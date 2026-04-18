'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'packages',
    name: 'Packages',
    subtitle: 'Starting ₹799/mo',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop',
    href: '/products?category=packages',
    highlight: true,
  },
  {
    id: 'beds',
    name: 'Beds',
    subtitle: 'Starting ₹399/mo',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&h=200&fit=crop',
    href: '/products?search=bed',
  },
  {
    id: 'sofas',
    name: 'Sofas',
    subtitle: 'Starting ₹499/mo',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop',
    href: '/products?search=sofa',
  },
  {
    id: 'refrigerators',
    name: 'Refrigerators',
    subtitle: 'Starting ₹349/mo',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=200&fit=crop',
    href: '/products?search=refrigerator',
  },
  {
    id: 'washing-machines',
    name: 'Washing Machines',
    subtitle: 'Starting ₹299/mo',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&h=200&fit=crop',
    href: '/products?search=washing+machine',
  },
  {
    id: 'televisions',
    name: 'Televisions',
    subtitle: 'Starting ₹399/mo',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=300&h=200&fit=crop',
    href: '/products?search=tv',
  },
  {
    id: 'air-conditioners',
    name: 'Air Conditioners',
    subtitle: 'Starting ₹549/mo',
    image: 'https://images.unsplash.com/photo-1584559582128-b8be739912e1?w=300&h=200&fit=crop',
    href: '/products?search=ac',
  },
  {
    id: 'mattresses',
    name: 'Mattresses',
    subtitle: 'Starting ₹199/mo',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop',
    href: '/products?search=mattress',
  },
  {
    id: 'wardrobes',
    name: 'Wardrobes',
    subtitle: 'Starting ₹299/mo',
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=300&h=200&fit=crop',
    href: '/products?search=wardrobe',
  },
  {
    id: 'study-tables',
    name: 'Study Tables',
    subtitle: 'Starting ₹199/mo',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300&h=200&fit=crop',
    href: '/products?search=study+table',
  },
  {
    id: 'laptops',
    name: 'Laptops',
    subtitle: 'Starting ₹699/mo',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
    href: '/products?search=laptop',
  },
  {
    id: 'water-purifiers',
    name: 'Water Purifiers',
    subtitle: 'Starting ₹149/mo',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    href: '/products?search=water+purifier',
  },
];

const VISIBLE_COUNT = 8;

export function CategoryGrid() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? CATEGORIES : CATEGORIES.slice(0, VISIBLE_COUNT);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
        <Link href="/categories" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={cat.href}>
              <div className={`relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${cat.highlight ? 'border-primary-400' : 'border-transparent hover:border-primary-200'}`}>
                <div className="relative h-28 sm:h-36 bg-gray-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {cat.highlight && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Popular
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm leading-tight">{cat.name}</p>
                  <p className="text-white/80 text-xs mt-0.5">{cat.subtitle}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Show more/less */}
      <div className="mt-5 text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm border border-primary-200 hover:border-primary-400 px-5 py-2 rounded-full transition-all"
        >
          {showAll ? (
            <><ChevronUp className="w-4 h-4" /> Show Less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> View {CATEGORIES.length - VISIBLE_COUNT} More Categories</>
          )}
        </button>
      </div>
    </section>
  );
}
