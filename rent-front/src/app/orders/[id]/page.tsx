'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
  tenureMonths?: number;
}

interface Order {
  orderId: string;
  status: string;
  createdAt: string;
  user: { userId: string; name: string; email: string };
  items: OrderItem[];
  pricing: { subtotal: number; discount: number; tax: number; deliveryFee: number; grandTotal: number };
  payment: { paymentId: string; method: string; status: string; transactionId: string };
  shippingAddress: { addressLine1: string; city: string; state: string; pincode: string; country: string };
  estimatedDelivery: string;
  tenureMonths: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function getStatusConfig(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'confirmed':
    case 'delivered':
      return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5" />, canCancel: false };
    case 'active':
      return { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-5 h-5" />, canCancel: false };
    case 'pending':
      return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5" />, canCancel: true };
    case 'cancelled':
    case 'returned':
      return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-5 h-5" />, canCancel: false };
    default:
      return { color: 'bg-gray-100 text-gray-700', icon: <Package className="w-5 h-5" />, canCancel: false };
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/auth/login?redirect=/orders/${params.id}`);
      return;
    }
    if (params.id) fetchOrder(params.id as string, token);
  }, [params.id]);

  const fetchOrder = async (id: string, token: string) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to load order');
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login?redirect=/orders'); return; }
    setCancelling(true);
    try {
      const res = await fetch(`${apiUrl}/orders/${order.orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
      toast.success('Order cancelled successfully');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">{error || 'This order does not exist or you do not have access to it.'}</p>
        <button onClick={() => router.push('/orders')} className="btn-primary">Back to Orders</button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(order.status);
  const displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Order #{order.orderId.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-500 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusCfg.color}`}>
              {statusCfg.icon}
              {displayStatus}
            </span>
            {statusCfg.canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <Package className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Payment Method</p>
              <p className="font-medium text-sm capitalize">{order.payment.method.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <Calendar className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Tenure</p>
              <p className="font-medium text-sm">{order.tenureMonths} month{order.tenureMonths !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <CreditCard className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Payment Status</p>
              <p className="font-medium text-sm capitalize">{order.payment.status.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="border-t pt-5 mb-5">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
              <p className="font-medium text-gray-900">{order.user.name}</p>
              {order.shippingAddress.addressLine1 && (
                <p className="text-gray-600 text-sm">{order.shippingAddress.addressLine1}</p>
              )}
              <p className="text-gray-600 text-sm">
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">Est. delivery: {order.estimatedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} × {item.quantity} × {item.tenureMonths || order.tenureMonths} mo
                  </p>
                </div>
                <p className="font-semibold text-gray-900 shrink-0">
                  {formatCurrency(item.total ?? item.price * item.quantity * (item.tenureMonths || order.tenureMonths || 1))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing summary */}
        <div className="border-t pt-5 mt-5 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.pricing.subtotal)}</span>
          </div>
          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>−{formatCurrency(order.pricing.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST (18%)</span>
            <span>{formatCurrency(order.pricing.tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span>{order.pricing.deliveryFee === 0 ? 'Free' : formatCurrency(order.pricing.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(order.pricing.grandTotal)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
