'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Heart, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  reviews: number;
  category_name?: string;
  condition_type?: string;
}

export function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/products?limit=8&sort=newest`);
        const data = await res.json();
        setProducts(data.data?.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-48 bg-gray-200 rounded skeleton mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest & Trending</h2>
          <p className="text-gray-500 text-sm mt-1">Freshly added — rent today</p>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative h-36 sm:h-44 bg-gray-100 overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
              <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-3.5 h-3.5 text-gray-500" />
              </button>
              {product.condition_type && (
                <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {product.condition_type}
                </span>
              )}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors mb-1">
                {product.name}
              </h3>

              {product.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-base font-bold text-primary-600">₹{product.price}</span>
                  <span className="text-xs text-gray-400">/mo</span>
                </div>
                <Link href={`/products/${product.id}`}>
                  <button className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    Rent
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
