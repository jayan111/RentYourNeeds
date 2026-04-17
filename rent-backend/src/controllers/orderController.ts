import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { getDB } from '../config/database';
import { addJob } from '../services/queue';
import { notifyOrderUpdate } from '../services/sse';
import { RowDataPacket } from 'mysql2';

interface OrderRow extends RowDataPacket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  items: string;
  total_amount: number;
  subscription_type: string;
  tenure_months: number;
  status: string;
  payment_status: string;
  payment_intent_id: string;
  subscription_id: string;
  delivery_address: string;
  tracking_number: string;
  created_at: Date;
  updated_at: Date;
}

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, deliveryAddress, subscriptionType, tenureMonths, email, phone } = req.body;
    const userId = req.user?.id || null;
    const userName = req.user?.name || 'Guest';
    const userEmail = req.user?.email || email || 'guest@example.com';
    const userPhone = req.user?.phone || phone || null;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.product.price * item.quantity * (item.tenureMonths || 1)), 0);

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.product.name,
          description: item.product.description || '',
        },
        unit_amount: Math.round(item.product.price * 100 * (item.tenureMonths || 1)),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: subscriptionType === 'recurring' ? 'subscription' : 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId: userId || 'guest',
        subscriptionType,
        tenureMonths: tenureMonths?.toString() || '0',
      },
    });

    const orderId = `order_${Date.now()}`;
    
    try {
      const db = await getDB();
      
      if (!db) {
        console.error('Database connection not available');
        return res.json({
          sessionId: session.id,
          url: session.url,
          orderId,
        });
      }
      
      await db.query(
        `INSERT INTO orders (id, user_id, user_name, user_email, user_phone, items, total_amount, subscription_type, tenure_months, status, payment_status, payment_intent_id, delivery_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
        [orderId, userId, userName, userEmail, userPhone, JSON.stringify(items), totalAmount, subscriptionType, tenureMonths || 1, session.id, JSON.stringify(deliveryAddress)]
      );
      console.log('Order saved to database:', orderId);
    } catch (dbError: any) {
      console.error('Database error:', dbError.message);
    }

    res.json({
      sessionId: session.id,
      url: session.url,
      orderId,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

export const handleWebhook = async (req: AuthenticatedRequest, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object as any);
        break;
      case 'invoice.payment_succeeded':
        await handleRecurringPayment(event.data.object as any);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as any);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

async function handleSuccessfulPayment(session: any) {
  try {
    const db = await getDB();
    if (!db) return;
    
    await db.query(
      `UPDATE orders SET payment_status = 'paid', status = 'confirmed', subscription_id = ?, updated_at = NOW() WHERE payment_intent_id = ?`,
      [session.subscription || null, session.id]
    );

    const [orders] = await db.query<OrderRow[]>('SELECT * FROM orders WHERE payment_intent_id = ?', [session.id]);
    
    if (orders && orders.length > 0) {
      const order = orders[0];
      await addJob.email({
        to: order.user_email,
        subject: 'Order Confirmed - RentYourNeeds',
        message: `Your order ${order.id} has been confirmed! Total: ₹${order.total_amount}`,
        type: 'order_confirmation',
      }).catch(console.error);
    }
  } catch (error) {
    console.error('Handle successful payment error:', error);
  }
}

async function handleRecurringPayment(invoice: any) {
  try {
    const db = await getDB();
    if (!db) return;
    const [orders] = await db.query<OrderRow[]>('SELECT * FROM orders WHERE subscription_id = ?', [invoice.subscription]);
    
    if (orders && orders.length > 0) {
      const order = orders[0];
      await addJob.email({
        to: order.user_email,
        subject: 'Subscription Payment Successful',
        message: `Your subscription payment of ₹${invoice.amount_paid / 100} was successful`,
        type: 'payment_success',
      }).catch(console.error);
    }
  } catch (error) {
    console.error('Handle recurring payment error:', error);
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const db = await getDB();
    if (!db) return;
    await db.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE subscription_id = ?`,
      [subscription.id]
    );
  } catch (error) {
    console.error('Handle subscription cancelled error:', error);
  }
}

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();
    
    if (!db) {
      console.log('Database not connected');
      return res.json({ success: true, data: [], total: 0 });
    }
    
    const userId = req.user?.id;
    const { status, page = 1, limit = 10, email, phone } = req.query;
    
    let query = 'SELECT * FROM orders';
    let params: any[] = [];
    const conditions = [];

    // If user is logged in, show their orders
    if (userId && req.user?.role !== 'admin') {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    // If not logged in but email/phone provided, show matching orders
    else if (!userId && (email || phone)) {
      const guestConditions = [];
      if (email) {
        guestConditions.push('user_email = ?');
        params.push(email);
      }
      if (phone) {
        guestConditions.push('user_phone = ?');
        params.push(phone);
      }
      if (guestConditions.length > 0) {
        conditions.push(`(${guestConditions.join(' OR ')})`);
      }
    }
    // Admin can see all orders
    else if (req.user?.role !== 'admin' && !email && !phone) {
      return res.json({ success: true, data: [], total: 0 });
    }

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    // Count total orders
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const [countResult] = await db.query<any[]>(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [orders] = await db.query<OrderRow[]>(query, params);
    
    console.log(`Found ${orders?.length || 0} orders`);

    const formattedOrders = (orders || []).map(order => {
      const items = JSON.parse(order.items || '[]');
      const address = JSON.parse(order.delivery_address || '{}');
      const estimatedDelivery = new Date(order.created_at);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      return {
        orderId: order.id,
        status: order.status.toUpperCase(),
        createdAt: order.created_at,
        user: {
          userId: order.user_id,
          name: order.user_name,
          email: order.user_email,
          phone: order.user_phone
        },
        items: items.map((item: any) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          tenureMonths: item.tenureMonths || 1,
          total: item.product.price * item.quantity * (item.tenureMonths || 1)
        })),
        pricing: {
          subtotal: order.total_amount,
          discount: 0,
          tax: Math.round(order.total_amount * 0.18),
          deliveryFee: 0,
          grandTotal: order.total_amount
        },
        payment: {
          paymentId: order.payment_intent_id,
          method: order.subscription_type === 'recurring' ? 'SUBSCRIPTION' : 'ONE_TIME',
          status: order.payment_status.toUpperCase(),
          transactionId: order.payment_intent_id
        },
        shippingAddress: {
          addressLine1: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: 'India'
        },
        estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
        tenureMonths: order.tenure_months,
        trackingNumber: order.tracking_number
      };
    });

    const totalPages = Math.ceil(total / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({ 
      success: true, 
      data: formattedOrders, 
      pagination: {
        total,
        page: pageNum,
        totalPages,
        hasMore,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.json({ success: false, data: [], total: 0 });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }
    
    const [orders] = await db.query<OrderRow[]>('SELECT * FROM orders WHERE id = ?', [id]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    if (req.user?.role !== 'admin' && order.user_id !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const items = JSON.parse(order.items || '[]');
    const address = JSON.parse(order.delivery_address || '{}');
    const estimatedDelivery = new Date(order.created_at);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const formattedOrder = {
      orderId: order.id,
      status: order.status.toUpperCase(),
      createdAt: order.created_at,
      user: {
        userId: order.user_id,
        name: order.user_name,
        email: order.user_email
      },
      items: items.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity * (item.tenureMonths || 1)
      })),
      pricing: {
        subtotal: order.total_amount,
        discount: 0,
        tax: Math.round(order.total_amount * 0.18),
        deliveryFee: 0,
        grandTotal: order.total_amount
      },
      payment: {
        paymentId: order.payment_intent_id,
        method: order.subscription_type === 'recurring' ? 'SUBSCRIPTION' : 'ONE_TIME',
        status: order.payment_status.toUpperCase(),
        transactionId: order.payment_intent_id
      },
      shippingAddress: {
        addressLine1: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: 'India'
      },
      estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
      tenureMonths: order.tenure_months
    };

    res.json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    await db.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    // Notify real-time SSE clients
    notifyOrderUpdate(id, status);

    const [orders] = await db.query<OrderRow[]>('SELECT * FROM orders WHERE id = ?', [id]);

    if (orders && orders.length > 0) {
      const order = orders[0];
      await addJob.email({
        to: order.user_email,
        subject: 'Order Status Updated',
        message: `Your order ${order.id} status: ${status}`,
        type: 'status_update',
      }).catch(console.error);

      res.json({ message: 'Order status updated', data: order });
    } else {
      res.json({ message: 'Order status updated' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const [orders] = await db.query<OrderRow[]>('SELECT * FROM orders WHERE id = ?', [id]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (order.subscription_id) {
      try {
        await stripe.subscriptions.cancel(order.subscription_id);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
      }
    }

    await db.query('UPDATE orders SET status = "cancelled", updated_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Subscription cancelled', data: order });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: get all orders in flat format (for admin table)
export const getAdminOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();
    if (!db) return res.json({ data: [], total: 0 });

    const { status, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [countRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    );
    const total = (countRows[0] as any).total;

    const [rows] = await db.query<OrderRow[]>(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const data = (rows || []).map((order: OrderRow) => ({
      id: order.id,
      user_id: order.user_id,
      user_name: order.user_name,
      user_email: order.user_email,
      user_phone: order.user_phone,
      items: order.items,
      total_amount: order.total_amount,
      subscription_type: order.subscription_type,
      tenure_months: order.tenure_months,
      status: order.status,
      payment_status: order.payment_status,
      delivery_address: order.delivery_address,
      tracking_number: order.tracking_number,
      created_at: order.created_at
    }));

    res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.json({ data: [], total: 0 });
  }
};

export const getOrderStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();
    
    if (!db) {
      return res.json({ data: { total: 0, pending: 0, confirmed: 0, active: 0, delivered: 0, cancelled: 0, totalRevenue: 0, recurringRevenue: 0 } });
    }
    
    const [stats] = await db.query<any[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN subscription_type = 'recurring' AND status = 'active' THEN total_amount ELSE 0 END) as recurringRevenue
      FROM orders
    `);

    res.json({ data: stats && stats.length > 0 ? stats[0] : {} });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.json({ data: { total: 0, pending: 0, confirmed: 0, active: 0, delivered: 0, cancelled: 0, totalRevenue: 0, recurringRevenue: 0 } });
  }
};