'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck, Wrench } from 'lucide-react';
import { RootState } from '@/store';
import { removeFromCart, updateQuantity, loadCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, total, itemCount } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingBag className="w-12 h-12 text-primary-400" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started!</p>
          <Link href="/products">
            <Button className="px-8">Browse Products</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900"
      >
        Shopping Cart
        <span className="ml-2 text-base font-medium text-gray-400">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 mb-3 hover:shadow-md transition-shadow"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.product.images?.[0] || '/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-primary-600 font-bold text-sm mt-0.5">{fmt(item.price)}<span className="text-gray-400 font-normal">/mo</span></p>
                  {item.tenureMonths && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.tenureMonths} month tenure</p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow transition-all"
                  >
                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="w-7 text-center font-semibold text-sm"
                  >
                    {item.quantity}
                  </motion.span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>

                {/* Line total + remove */}
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-900">
                    {fmt(item.tenureMonths ? item.price * item.tenureMonths * item.quantity : item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: Wrench, label: 'Free Maintenance' },
              { icon: Shield, label: 'Zero Deposit' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs font-medium text-green-800">
                <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-5 text-gray-900">Order Summary</h3>

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Monthly Rent ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span className="font-medium">{fmt(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Security Deposit</span>
                <span className="text-green-600 font-semibold">₹0 (Zero!)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery & Installation</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Pay Now</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-primary-600"
                >
                  {fmt(total)}
                </motion.span>
              </div>
              <p className="text-xs text-gray-400">First month's rent only</p>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full group">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/products" className="block mt-3">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
