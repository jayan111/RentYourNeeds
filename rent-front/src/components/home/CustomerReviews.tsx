'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing service! Rented a MacBook for my project and it was in perfect condition. Delivery was super fast!',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'Mike Chen',
    rating: 5,
    comment: 'Great experience renting furniture for my new apartment. Everything was clean and exactly as described.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'Emily Davis',
    rating: 4,
    comment: 'Rented a camera for my wedding. Quality was excellent and the rental process was so smooth!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 4,
    name: 'David Wilson',
    rating: 5,
    comment: 'Perfect for short-term needs. Saved me thousands compared to buying. Highly recommend!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
];

export function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600">Real experiences from real customers</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-5 h-5',
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg mb-6 italic">"{review.comment}"</p>
                    <div className="flex items-center justify-center">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold">{review.name}</h4>
                        <p className="text-gray-500 text-sm">Verified Customer</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}