'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, FileCheck, Shield, Truck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useSelector((state: any) => state.cart.items);
  const cartTotal = useSelector((state: any) => state.cart.total);

  const [loading, setLoading] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'one-time' | 'recurring'>('one-time');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken') || '';

      // Resolve email: from user localStorage or guest input
      let resolvedEmail = guestEmail;
      if (token) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (storedUser.email) resolvedEmail = storedUser.email;
        } catch {}
      }

      const response = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cartItems,
          deliveryAddress,
          subscriptionType,
          tenureMonths: Math.max(...cartItems.map((i: any) => i.tenureMonths || 1), 1),
          email: resolvedEmail || 'guest@example.com',
        })
      });

      const data = await response.json();

      if (data.url) {
        // Persist guest email for order tracking on the orders page
        if (resolvedEmail) localStorage.setItem('guestOrderEmail', resolvedEmail);
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout');
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

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-lg">Redirecting to Payment</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-center">
                <Lock className="w-3.5 h-3.5" /> Secured by Stripe
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trust bar */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-primary-800">
            {[
              { icon: Truck, label: 'Free Delivery & Installation' },
              { icon: Shield, label: 'Zero Security Deposit' },
              { icon: CheckCircle, label: 'Free Maintenance' },
              { icon: FileCheck, label: 'Easy KYC' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>

          {/* Payment Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Payment Preference</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: subscriptionType === 'one-time' ? '#0284c7' : '#e5e7eb' }}>
                <input type="radio" value="one-time" checked={subscriptionType === 'one-time'} onChange={(e) => setSubscriptionType(e.target.value as any)} className="mr-3 accent-primary-600" />
                <div>
                  <p className="font-semibold">One-Time Payment</p>
                  <p className="text-sm text-gray-500">Pay full tenure amount upfront</p>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: subscriptionType === 'recurring' ? '#0284c7' : '#e5e7eb' }}>
                <input type="radio" value="recurring" checked={subscriptionType === 'recurring'} onChange={(e) => setSubscriptionType(e.target.value as any)} className="mr-3 accent-primary-600" />
                <div className="flex-1">
                  <p className="font-semibold flex items-center gap-2">
                    Monthly Auto-Pay
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Save 10%</span>
                  </p>
                  <p className="text-sm text-gray-500">Auto-deducted every month</p>
                </div>
              </label>
            </div>

            {/* KYC Note */}
            <div className="mt-4 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <FileCheck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Quick KYC Required</p>
                <p className="text-xs">After payment, complete KYC with your <strong>PAN card</strong> + any <strong>Government ID</strong>. Takes under 2 minutes.</p>
              </div>
            </div>
          </div>

          {/* Guest Email — shown only when not logged in */}
          {!isLoggedIn && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-1">Email Address</h2>
              <p className="text-sm text-gray-500 mb-4">Required to track your order after checkout</p>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Already have an account?{' '}
                <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</a>
              </p>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street Address"
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={deliveryAddress.pincode}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, pincode: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-gray-700 line-clamp-1 flex-1">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">{formatCurrency(item.product.price * item.quantity)}/mo</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Monthly Rent</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Security Deposit</span>
                <span className="text-green-600 font-semibold">₹0 (Zero!)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery & Installation</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              {subscriptionType === 'recurring' && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Monthly Discount</span>
                  <span>−{formatCurrency(Math.round(cartTotal * 0.1))}</span>
                </div>
              )}
            </div>

            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-base">
              <span>Pay Now</span>
              <span className="text-primary-600">
                {formatCurrency(subscriptionType === 'recurring' ? Math.round(cartTotal * 0.9) : cartTotal)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">First month's rent only</p>

            <Button
              onClick={handleCheckout}
              disabled={loading || !deliveryAddress.street}
              className="w-full mt-5"
            >
              {loading ? 'Processing...' : 'Proceed to Payment →'}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">🔒 Secured by Stripe · 256-bit encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}