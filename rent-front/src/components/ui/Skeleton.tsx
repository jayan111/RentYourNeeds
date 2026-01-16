'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      style={style}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card animate-fade-in">
      <Skeleton className="h-48 mb-4" />
      <Skeleton className="h-6 mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-96 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-8 mb-4" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-20 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}