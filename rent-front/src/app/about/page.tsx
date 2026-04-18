'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, Package, Star } from 'lucide-react';

const stats = [
  { label: 'Happy Customers', value: '50,000+', icon: Users },
  { label: 'Products Available', value: '2,000+', icon: Package },
  { label: 'Cities Served', value: '7', icon: Star },
  { label: 'Years of Service', value: '5+', icon: CheckCircle },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 py-8 sm:py-16"
    >
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold mb-4"
        >
          About RentYourNeeds
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600"
        >
          Your trusted marketplace for premium rentals
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
      >
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center"
          >
            <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary-700">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="prose prose-lg max-w-none"
      >
        <p>
          RentYourNeeds is a revolutionary rental marketplace that connects people who need items
          with those who have them available for rent. We believe in the sharing economy and
          sustainable consumption.
        </p>

        <h2>Our Mission</h2>
        <p>
          To make quality products accessible to everyone while promoting sustainable consumption
          and reducing waste through the sharing economy.
        </p>

        <h2>Why Choose Us?</h2>
        <ul>
          <li>Verified products and quality-checked before every delivery</li>
          <li>Flexible tenure: 3, 6, 12, or 24 months with up to 15% savings</li>
          <li>Free delivery, installation, and professional maintenance</li>
          <li>Zero security deposit — pay just the first month's rent</li>
          <li>24/7 customer support via chat, phone, and email</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
