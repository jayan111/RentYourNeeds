'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from 'lucide-react';
import Image from 'next/image';

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  items: string;
  total_amount: number;
  subscription_type: string;
  tenure_months: number;
  status: string;
  payment_status: string;
  delivery_address: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/orders/${id}`);
      const data = await response.json();
      setOrder(data.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <button onClick={() => router.push('/orders')} className="btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  const items = JSON.parse(order.items || '[]');
  const address = JSON.parse(order.delivery_address || '{}');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'confirmed' || order.status === 'active' || order.status === 'delivered'
              ? 'bg-green-100 text-green-800'
              : order.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Subscription Type</p>
              <p className="font-medium capitalize">{order.subscription_type}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Tenure</p>
              <p className="font-medium">{order.tenure_months} month(s)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-medium capitalize">{order.payment_status}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary-600 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
              <p className="font-medium">{order.user_name}</p>
              <p className="text-gray-700">{address.street}</p>
              <p className="text-gray-700">{address.city}, {address.state} - {address.pincode}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-20 h-20 relative bg-gray-100 rounded">
                  {item.product.image && (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity * (item.tenureMonths || 1))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Amount</span>
            <span className="text-primary-600">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
