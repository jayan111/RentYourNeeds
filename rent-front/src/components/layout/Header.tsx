'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, CreditCard, UserCircle, MapPin, ChevronDown, Phone } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const CITIES = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];

export function Header() {
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [city, setCity] = useState('Ahmedabad');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowLogoutConfirm(false);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40"
    >
      {/* Top info bar */}
      <div className="bg-primary-700 text-white text-xs py-1.5 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>Free delivery & installation on all orders 🎉</span>
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:text-primary-200 transition-colors">
              <Phone className="w-3 h-3" /> +91 98765 43210
            </a>
            <Link href="/help" className="hover:text-primary-200 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + City */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl sm:text-2xl font-black text-primary-600 whitespace-nowrap">
              RentYour<span className="text-gray-900">Needs</span>
            </Link>

            {/* City selector */}
            <div className="relative hidden md:block" ref={cityRef}>
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors border border-gray-200 hover:border-primary-300 rounded-lg px-2.5 py-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                <span className="font-medium">{city}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <AnimatePresence>
                {showCityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 min-w-[160px] py-1 overflow-hidden"
                  >
                    {CITIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCity(c); setShowCityDropdown(false); }}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm transition-colors ${c === city ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">
              Categories
            </Link>
            <Link href="/products?category=packages" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">
              Packages
            </Link>
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
            
            <div className="relative flex items-center">
              <Link href="/cart" className="p-2 text-gray-600 hover:text-primary-600 transition-transform hover:scale-110">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {itemCount > 9 ? '9' : itemCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="p-2 text-gray-600 hover:text-primary-600 flex items-center space-x-1"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  {user?.name && (
                    <span className="hidden sm:block text-sm font-medium">
                      {user.name.split(' ')[0]}
                    </span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <UserCircle className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile/subscriptions"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <CreditCard className="w-4 h-4 mr-3" />
                        Subscriptions
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Orders & Returns
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  {isAuthenticated ? (
                    <>
                      <motion.div whileHover={{ x: 5 }}>
                        <Link 
                          href="/profile" 
                          className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ x: 5 }}>
                        <Link 
                          href="/profile/orders" 
                          className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Orders
                        </Link>
                      </motion.div>
                    </>
                  ) : (
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
      </div>{/* end main nav bg-white */}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export const Navbar = Header;