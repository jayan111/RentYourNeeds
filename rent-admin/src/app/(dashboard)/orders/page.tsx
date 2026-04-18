'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: any[];
  totalAmount: number;
  subscriptionType: string;
  tenureMonths?: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: any;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();

    // SSE for real-time order status updates
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const sseUrl = apiUrl.replace('/api', '') + '/api/orders/stream';
    const eventSource = new EventSource(sseUrl);
    eventSource.addEventListener('orderUpdate', () => {
      fetchOrders();
      fetchStats();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const formattedOrders = (data.data || []).map((order: any) => {
        let items: any[] = [];
        let deliveryAddress: any = {};
        try { items = JSON.parse(order.items || '[]'); } catch { items = []; }
        try { deliveryAddress = JSON.parse(order.delivery_address || '{}'); } catch { deliveryAddress = {}; }
        return {
          id: order.id,
          userId: order.user_id,
          userName: order.user_name,
          userEmail: order.user_email,
          items,
          totalAmount: order.total_amount,
          subscriptionType: order.subscription_type,
          tenureMonths: order.tenure_months,
          status: order.status,
          paymentStatus: order.payment_status,
          deliveryAddress,
          createdAt: order.created_at
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <Button onClick={fetchOrders}>Refresh</Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Recurring Revenue</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.recurringRevenue)}</p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Order ID</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{order.id}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.userName}</div>
                      <div className="text-sm text-gray-500">{order.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.tenureMonths ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {order.tenureMonths} Month Plan
                        </span>
                      ) : null}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.subscriptionType === 'recurring'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.subscriptionType === 'recurring' ? 'Monthly Auto-pay' : 'One-time'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => viewOrderDetails(order)}>
                        View
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Order ID</p>
                <p className="text-sm text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Customer</p>
                <p className="text-sm text-gray-900">{selectedOrder.userName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.userEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Delivery Address</p>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm">{selectedOrder.deliveryAddress?.street}</p>
                <p className="text-sm">{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state}</p>
                <p className="text-sm">{selectedOrder.deliveryAddress?.pincode}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}