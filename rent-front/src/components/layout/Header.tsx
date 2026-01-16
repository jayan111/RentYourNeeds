'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-sm border-b border-border sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="text-xl sm:text-2xl font-bold text-primary-600">
                RentYourNeeds
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
                Products
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
                Categories
              </Link>
            </motion.div>
          </nav>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <motion.div 
              className="relative w-full"
              whileFocus={{ scale: 1.02 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </motion.div>
          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Icon for Mobile */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link href="/search" className="lg:hidden p-2 text-gray-600 hover:text-primary-600">
                <Search className="w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary-600">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
            
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link href="/profile" className="p-2 text-gray-600 hover:text-primary-600">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/auth/login" className="hidden sm:block btn-primary text-sm px-3 py-2">
                  Sign In
                </Link>
              </motion.div>
            )}
            
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-gray-200">
                {/* Mobile Search */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="lg:hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </motion.div>
                
                {/* Mobile Navigation */}
                <motion.nav 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <motion.div whileHover={{ x: 5 }}>
                    <Link 
                      href="/products" 
                      className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Products
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link 
                      href="/categories" 
                      className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                  </motion.div>
                  {!isAuthenticated && (
                    <motion.div whileHover={{ x: 5 }}>
                      <Link 
                        href="/auth/login" 
                        className="block py-2 text-primary-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  )}
                </motion.nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export const Navbar = Header;