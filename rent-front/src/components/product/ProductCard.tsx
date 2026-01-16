'use client';

import { Product } from '@/types';
import { Star, MapPin, Heart } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ScaleIn } from '@/components/ui/MotionComponents';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductCard({ product, viewMode = 'grid', className }: ProductCardProps) {
  const isListView = viewMode === 'list';

  return (
    <ScaleIn>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow duration-300',
          isListView ? 'flex flex-row h-48' : 'flex flex-col h-full',
          className
        )}
      >
        <div className={cn(
          'relative overflow-hidden',
          isListView ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'
        )}>
          <ImageCarousel 
            images={product.images} 
            alt={product.name}
            className="w-full h-full"
          />
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </motion.button>
          
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
              {product.condition}
            </span>
          </div>
        </div>

        <div className={cn(
          'p-4 flex flex-col',
          isListView ? 'flex-1 justify-between' : 'flex-1'
        )}>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className={cn(
                'font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2',
                isListView ? 'text-lg' : 'text-base'
              )}>
                <Link href={`/products/${product.id}`}>
                  {product.name}
                </Link>
              </h3>
            </div>

            <p className={cn(
              'text-gray-600 mb-3 line-clamp-2',
              isListView ? 'text-base' : 'text-sm'
            )}>
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{product.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  'font-bold text-primary-600',
                  isListView ? 'text-xl' : 'text-lg'
                )}>
                  ₹{product.price}
                </span>
                <span className="text-sm text-gray-500">/day</span>
              </div>
              <div className="text-xs text-gray-500">
                {product.stock} available
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors',
                isListView ? 'px-6 py-2' : 'px-4 py-2 text-sm'
              )}
            >
              Rent Now
            </motion.button>
          </div>
        </div>
      </motion.div>
    </ScaleIn>
  );
}