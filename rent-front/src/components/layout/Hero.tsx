'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer } from '@/components/ui/MotionComponents';

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <StaggerContainer className="text-center">
          <FadeInUp>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rent Anything,
              <br />
              <span className="text-primary-100">Anytime</span>
            </h1>
          </FadeInUp>
          
          <FadeInUp delay={0.2}>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              From electronics to furniture, find everything you need without the commitment of buying
            </p>
          </FadeInUp>
          
          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/products" 
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Browse Products
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/categories" 
                  className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  View Categories
                </Link>
              </motion.div>
            </div>
          </FadeInUp>
        </StaggerContainer>
      </div>
    </section>
  );
}