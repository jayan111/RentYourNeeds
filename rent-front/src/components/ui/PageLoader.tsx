'use client';

import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-4">
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="md" />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}