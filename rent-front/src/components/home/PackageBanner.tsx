'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const PACKAGES = [
  {
    id: 1,
    name: 'Studio Starter Pack',
    items: 'Bed + Mattress + Study Table + Chair',
    price: 799,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=280&fit=crop',
    badge: 'Most Popular',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 2,
    name: 'Living Room Bundle',
    items: 'Sofa + TV + Coffee Table',
    price: 1199,
    originalPrice: 1600,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop',
    badge: '25% Off',
    badgeColor: 'bg-green-500',
  },
  {
    id: 3,
    name: 'Complete Home Setup',
    items: 'Bedroom + Living + Kitchen Appliances',
    price: 2499,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop',
    badge: 'Best Value',
    badgeColor: 'bg-primary-600',
  },
];

export function PackageBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Checkout Our Packages</h2>
          <p className="text-gray-500 text-sm mt-1">Save more with curated combos — Starting ₹799/mo</p>
        </div>
        <Link href="/products?category=packages" className="hidden sm:flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
          View All Packages <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={pkg.image}
                alt={pkg.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full ${pkg.badgeColor}`}>
                {pkg.badge}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-base mb-1">{pkg.name}</h3>
              <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {pkg.items}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-primary-600">₹{pkg.price}</span>
                    <span className="text-xs text-gray-400">/mo</span>
                  </div>
                  <span className="text-xs text-gray-400 line-through">₹{pkg.originalPrice}/mo</span>
                </div>
                <Link href={`/products?category=packages`}>
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Rent Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center sm:hidden">
        <Link href="/products?category=packages" className="text-primary-600 font-medium text-sm">
          View All Packages →
        </Link>
      </div>
    </section>
  );
}
