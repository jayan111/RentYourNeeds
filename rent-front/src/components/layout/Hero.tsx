'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, Truck, Wrench, RotateCcw, Shield } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CITIES = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

const QUICK_TAGS = ['Sofa', 'Refrigerator', 'AC', 'Washing Machine', 'Laptop', 'Bed', 'TV', 'Study Table'];

const TRUST_ITEMS = [
  { icon: Truck, text: 'Free Delivery & Installation' },
  { icon: Wrench, text: 'Free Maintenance' },
  { icon: RotateCcw, text: 'Easy Relocation' },
  { icon: Shield, text: 'Zero Security Deposit' },
];

export function Hero() {
  const [city, setCity] = useState('Ahmedabad');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    else router.push('/products');
  };

  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-yellow-300 text-sm font-semibold tracking-wide uppercase mb-3"
          >
            Furniture & Appliances Starting at ₹299/mo
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 leading-tight"
          >
            Rent. Live.{' '}
            <span className="text-yellow-300">Upgrade.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-primary-100 text-lg mb-10 max-w-xl mx-auto"
          >
            Premium furniture & appliances on monthly rent — delivered, installed, maintained free
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-stretch bg-white rounded-xl shadow-2xl overflow-visible relative">
              {/* City Selector */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="h-full flex items-center gap-1.5 px-4 text-gray-700 font-medium border-r border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap rounded-l-xl"
                >
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="text-sm">{city}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <AnimatePresence>
                  {showCityDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[180px] overflow-hidden"
                    >
                      {CITIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCity(c); setShowCityDropdown(false); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for sofa, refrigerator, AC..."
                className="flex-1 px-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none text-base min-w-0"
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center gap-2 transition-colors rounded-r-xl"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:block">Search</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {QUICK_TAGS.map((tag) => (
              <Link key={tag} href={`/products?search=${encodeURIComponent(tag)}`}>
                <span className="px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium cursor-pointer transition-all hover:scale-105">
                  {tag}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-primary-800 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white text-sm font-medium">
                <Icon className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
