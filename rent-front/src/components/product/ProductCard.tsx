'use client';

import { Product } from '@/types';
import { Star, MapPin, Heart, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductCard({ product, viewMode = 'grid', className }: ProductCardProps) {
  const isListView = viewMode === 'list';
  const imageUrl = product.images?.[0];
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <motion.div
      whileHover={{ y: isListView ? 0 : -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300',
        isListView ? 'flex flex-row h-44' : 'flex flex-col',
        className
      )}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100 flex-shrink-0',
        isListView ? 'w-44' : 'aspect-[4/3]'
      )}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes={isListView ? '176px' : '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}

        {/* Wishlist */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <Heart className={cn('w-4 h-4 transition-colors', wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
        </motion.button>

        {/* Condition badge */}
        {product.condition && (
          <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {product.condition}
          </span>
        )}
      </div>

      {/* Info */}
      <div className={cn('p-3 sm:p-4 flex flex-col flex-1', isListView ? 'justify-between' : '')}>
        <div className="flex-1">
          {product.category && (
            <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">{product.category}</p>
          )}
          <h3 className={cn(
            'font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1.5',
            isListView ? 'text-base' : 'text-sm'
          )}>
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>

          {!isListView && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-2">{product.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-700">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
            )}
            {product.location && (
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price + CTAs */}
        <div className={cn('mt-3 flex items-center justify-between gap-2', isListView ? 'mt-0' : '')}>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={cn('font-bold text-primary-600', isListView ? 'text-xl' : 'text-lg')}>
                ₹{product.price}
              </span>
              <span className="text-xs text-gray-400">/mo</span>
            </div>
            {product.stock !== undefined && (
              <p className="text-[11px] text-gray-400">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link href={`/products/${product.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:border-primary-400 text-gray-600 hover:text-primary-600 text-xs font-medium rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Quick View</span>
              </motion.button>
            </Link>
            <Link href={`/products/${product.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-xs',
                  isListView ? 'px-5 py-2' : 'px-3 py-1.5'
                )}
              >
                Rent Now
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
