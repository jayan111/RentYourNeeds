'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/categories');
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <Skeleton className="h-48 mb-4" />
              <Skeleton className="h-6 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 animate-slide-up">Browse Categories</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative h-40 sm:h-48 mb-4 overflow-hidden rounded-lg">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500">
                {category.productCount} products
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}