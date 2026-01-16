'use client';

import Image from 'next/image';
import { ArrowRight, Home, Users, Shield } from 'lucide-react';

export function HouseShowcase() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-6">Transform Your Space with Premium Rentals</h2>
              <p className="text-lg text-gray-600 mb-8">
                From cozy apartments to luxury homes, we provide everything you need to create the perfect living space without the commitment of buying.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complete Home Solutions</h3>
                  <p className="text-gray-600">Everything from furniture to electronics, all in one place</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Trusted by Thousands</h3>
                  <p className="text-gray-600">Join over 10,000 satisfied customers who chose smart renting</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fully Protected</h3>
                  <p className="text-gray-600">Comprehensive insurance and damage protection included</p>
                </div>
              </div>
            </div>

            <button className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 hover:scale-105 flex items-center space-x-2">
              <span>Start Renting Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
                    alt="Modern living room"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="relative h-32 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=200&fit=crop"
                    alt="Home office setup"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-32 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=200&fit=crop"
                    alt="Bedroom furniture"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop"
                    alt="Kitchen appliances"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}