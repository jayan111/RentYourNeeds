'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Eye, LogIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  tenureMonths?: number;
  total?: number;
}

interface Order {
  orderId?: string;
  id?: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  items: OrderItem[];
  tenureMonths?: number;
  tenure_months?: number;
  pricing?: { grandTotal: number };
  total_amount?: number;
}

function getOrderId(order: Order): string {
  return order.orderId || order.id || '';
}

function getTotal(order: Order): number {
  return order.pricing?.grandTotal ?? order.total_amount ?? 0;
}

function getDate(order: Order): string {
  return order.createdAt || order.created_at || '';
}

function getTenure(order: Order): number {
  return order.tenureMonths ?? order.tenure_months ?? 0;
}

function getStatusConfig(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'confirmed':
    case 'delivered':
      return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, dot: 'bg-green-500', canCancel: false };
    case 'active':
      return { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" />, dot: 'bg-blue-500', canCancel: false };
    case 'pending':
      return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, dot: 'bg-yellow-500', canCancel: true };
    case 'cancelled':
    case 'returned':
      return { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, dot: 'bg-red-500', canCancel: false };
    default:
      return { color: 'bg-gray-100 text-gray-700', icon: <Package className="w-4 h-4" />, dot: 'bg-gray-400', canCancel: false };
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function OrderCard({ order, index, onCancel }: { order: Order; index: number; onCancel: (id: string) => void }) {
  const id = getOrderId(order);
  const statusCfg = getStatusConfig(order.status);
  const total = getTotal(order);
  const date = getDate(order);
  const tenure = getTenure(order);
  const firstName = order.items[0]?.name || 'Product';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
              {statusCfg.icon}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base">Order #{id.slice(-8).toUpperCase()}</h3>
          {date && (
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
          <p className="text-xl font-bold text-primary-600">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          <span>
            <span className="font-medium text-gray-900">{firstName}</span>
            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
          </span>
          <span>Qty: {order.items.reduce((s, i) => s + i.quantity, 0)}</span>
          {tenure > 0 && <span>Tenure: {tenure} month{tenure > 1 ? 's' : ''}</span>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {statusCfg.canCancel && (
          <button
            onClick={() => onCancel(id)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Cancel Order
          </button>
        )}
        <div className="ml-auto">
          <Link
            href={`/orders/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchOrders = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to load orders');
      setOrders(result.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login?redirect=/orders');
      return;
    }
    fetchOrders(token);
  }, [router, fetchOrders]);

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login?redirect=/orders'); return; }
    setCancelling(orderId);
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
      toast.success('Order cancelled successfully');
      setOrders(prev =>
        prev.map(o => getOrderId(o) === orderId ? { ...o, status: 'cancelled' } : o)
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse h-9 w-40 bg-gray-200 rounded-lg mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </motion.div>

      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-xl border border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Start browsing our collection!
            </p>
            <Link href="/products" className="btn-primary">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <div key={getOrderId(order) || i} className={cancelling === getOrderId(order) ? 'opacity-60 pointer-events-none' : ''}>
                <OrderCard order={order} index={i} onCancel={handleCancel} />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
