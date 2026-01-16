import { Response } from 'express';
import { Subscription, Payment, Order, AuthenticatedRequest } from '../types';

// Mock data for subscriptions
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    userId: 'user_1',
    productId: '1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    monthlyRent: 2500,
    securityDeposit: 5000,
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: new Date('2024-02-01'),
    autoRenewal: true,
    deliveryAddress: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockPayments: Payment[] = [
  {
    id: 'pay_1',
    subscriptionId: 'sub_1',
    userId: 'user_1',
    amount: 2500,
    type: 'rent',
    status: 'completed',
    paymentMethod: 'upi',
    dueDate: new Date('2024-01-01'),
    paidDate: new Date('2024-01-01'),
    created_at: new Date()
  }
];

export const createSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, rentalPeriod, deliveryAddress } = req.body;
    
    // Validate KYC status
    const kycVerified = true; // Mock check
    if (!kycVerified) {
      return res.status(400).json({ message: 'KYC verification required' });
    }

    const subscriptionId = `sub_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + rentalPeriod);

    const subscription: Subscription = {
      id: subscriptionId,
      userId: req.user?.id || 'user_1',
      productId,
      startDate,
      endDate,
      monthlyRent: 2500,
      securityDeposit: 5000,
      status: 'active',
      billingCycle: 'monthly',
      nextBillingDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      autoRenewal: false,
      deliveryAddress,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockSubscriptions.push(subscription);

    res.status(201).json({
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'user_1';
    const subscriptions = mockSubscriptions.filter(sub => sub.userId === userId);
    
    res.json({
      data: subscriptions,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const pauseSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = mockSubscriptions.find(sub => sub.id === id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'paused';
    subscription.updated_at = new Date();

    res.json({
      message: 'Subscription paused successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const subscription = mockSubscriptions.find(sub => sub.id === id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    subscription.updated_at = new Date();

    // Schedule pickup order
    const pickupOrder: Order = {
      id: `order_${Date.now()}`,
      subscriptionId: id,
      userId: subscription.userId,
      productId: subscription.productId,
      type: 'pickup',
      status: 'pending',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      deliveryAddress: subscription.deliveryAddress,
      notes: `Cancellation reason: ${reason}`,
      created_at: new Date(),
      updated_at: new Date()
    };

    res.json({
      message: 'Subscription cancelled successfully',
      data: { subscription, pickupOrder }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const payments = mockPayments.filter(pay => pay.subscriptionId === subscriptionId);
    
    res.json({
      data: payments,
      total: payments.length
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subscriptionId, amount, paymentMethod } = req.body;
    
    const payment: Payment = {
      id: `pay_${Date.now()}`,
      subscriptionId,
      userId: req.user?.id || 'user_1',
      amount,
      type: 'rent',
      status: 'completed',
      paymentMethod,
      dueDate: new Date(),
      paidDate: new Date(),
      created_at: new Date()
    };

    mockPayments.push(payment);

    // Update next billing date
    const subscription = mockSubscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      subscription.nextBillingDate = new Date(subscription.nextBillingDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    res.json({
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};