'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInUp } from '@/components/ui/MotionComponents';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  image: string;
  code: string;
}

export function OffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/content/home`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        setOffers(data.data.offers || []);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    if (offers.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-96 bg-gray-200 rounded-2xl skeleton" />
      </section>
    );
  }

  if (!offers.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeInUp>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Special Offers & Discounts</h2>
          <p className="text-gray-600">Don't miss out on these amazing deals</p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <div className="relative overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="relative h-64 sm:h-80 lg:h-96">
                <Image
                  src={offers[currentIndex].image}
                  alt={offers[currentIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-2xl mx-auto px-6 text-white text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      {offers[currentIndex].discount} OFF
                    </motion.div>
                    
                    <motion.h3
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                    >
                      {offers[currentIndex].title}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg sm:text-xl mb-6 opacity-90"
                    >
                      {offers[currentIndex].description}
                    </motion.p>
                    
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <span className="text-sm">Use code: </span>
                        <span className="font-bold">{offers[currentIndex].code}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Shop Now
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {offers.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all',
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}