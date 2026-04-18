'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const STATIC_CATEGORIES = [
  { id: 'beds',             name: 'Beds',              startingPrice: 399, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=280&fit=crop' },
  { id: 'sofas',            name: 'Sofas',             startingPrice: 499, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=280&fit=crop' },
  { id: 'wardrobes',        name: 'Wardrobes',         startingPrice: 299, image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=280&fit=crop' },
  { id: 'study-tables',     name: 'Study Tables',      startingPrice: 199, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=280&fit=crop' },
  { id: 'mattresses',       name: 'Mattresses',        startingPrice: 199, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop' },
  { id: 'refrigerators',    name: 'Refrigerators',     startingPrice: 349, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=280&fit=crop' },
  { id: 'washing-machines', name: 'Washing Machines',  startingPrice: 299, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=280&fit=crop' },
  { id: 'televisions',      name: 'Televisions',       startingPrice: 399, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&h=280&fit=crop' },
  { id: 'air-conditioners', name: 'Air Conditioners',  startingPrice: 549, image: 'https://images.unsplash.com/photo-1584559582128-b8be739912e1?w=400&h=280&fit=crop' },
  { id: 'water-purifiers',  name: 'Water Purifiers',   startingPrice: 149, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop' },
  { id: 'laptops',          name: 'Laptops',           startingPrice: 699, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=280&fit=crop' },
  { id: 'packages',         name: 'Packages',          startingPrice: 799, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop' },
];

export default function CategoriesPage() {
  const [apiCategories, setApiCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/categories`, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        setApiCategories(data.data || []);
      } catch {
        // silently use static data
      }
    };
    fetchCategories();
  }, []);

  const getProductCount = (id: string) =>
    apiCategories.find(c => c.id === id)?.productCount ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Browse Categories</h1>
        <p className="text-gray-500">Find exactly what you need — rent premium products starting ₹149/mo</p>
      </motion.div>

      {/* Packages CTA */}
      <Link href="/products?category=packages">
        <div className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 sm:p-6 flex items-center justify-between text-white hover:from-primary-700 hover:to-primary-800 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Checkout Our Packages</h3>
              <p className="text-primary-100 text-sm">Curated combos — save up to 25% · Starting ₹799/mo</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </Link>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {STATIC_CATEGORIES.map((cat, i) => {
          const count = getProductCount(cat.id);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/products?search=${encodeURIComponent(cat.name)}`}>
                <div className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white">
                  <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{cat.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-white/80 text-xs">From ₹{cat.startingPrice}/mo</p>
                      {count !== null && (
                        <p className="text-white/70 text-xs">{count} items</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
