'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Package, 
  Play, 
  Pause, 
  X, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import Image from 'next/image';

interface Subscription {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImages: string[];
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  orderStatus: string;
  startDate: string;
  endDate: string;
  tenureMonths: number;
  monthlyAmount: number;
  totalAmount: number;
  stripeSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800'
};

export default function SubscriptionsPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Subscriptions' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, selectedStatus, currentPage]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      console.log('Fetching subscriptions:', { status: selectedStatus, page: currentPage });
      
      // Mock data
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          orderId: 'order_123',
          productId: 'prod_1',
          productName: 'MacBook Pro 16"',
          productImages: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
          status: 'ACTIVE',
          orderStatus: 'DELIVERED',
          startDate: '2024-01-15',
          endDate: '2024-07-15',
          tenureMonths: 6,
          monthlyAmount: 583.33,
          totalAmount: 3500,
          stripeSubscriptionId: 'sub_stripe_123',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'sub_2',
          orderId: 'order_124',
          productId: 'prod_2',
          productName: 'Canon EOS R5',
          productImages: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'],
          status: 'PAUSED',
          orderStatus: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2025-01-01',
          tenureMonths: 12,
          monthlyAmount: 433.33,
          totalAmount: 5200,
          stripeSubscriptionId: 'sub_stripe_124',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z'
        }
      ];

      setSubscriptions(mockSubscriptions);
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (subscriptionId: string, action: 'cancel' | 'pause' | 'resume') => {
    setActionLoading(subscriptionId);
    try {
      // TODO: Implement API call
      console.log(`${action} subscription:`, subscriptionId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId 
          ? { 
              ...sub, 
              status: action === 'cancel' ? 'CANCELLED' : action === 'pause' ? 'PAUSED' : 'ACTIVE' 
            }
          : sub
      ));
    } catch (error) {
      console.error(`Failed to ${action} subscription:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view your subscriptions.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
                  <p className="text-gray-600">Manage your active rental subscriptions</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </motion.button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedStatus === option.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subscriptions List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscriptions Found</h3>
              <p className="text-gray-600">You don't have any subscriptions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48">
                    <Image
                      src={subscription.productImages[0] || '/placeholder.jpg'}
                      alt={subscription.productName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
                        {subscription.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {subscription.productName}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Monthly Amount:</span>
                        <span className="font-medium">₹{subscription.monthlyAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tenure:</span>
                        <span className="font-medium">{subscription.tenureMonths} months</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>End Date:</span>
                        <span className="font-medium">{formatDate(subscription.endDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {subscription.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                            disabled={actionLoading === subscription.id}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                          <button
                            onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                            disabled={actionLoading === subscription.id}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {subscription.status === 'PAUSED' && (
                        <>
                          <button
                            onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                            disabled={actionLoading === subscription.id}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            <Play className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                          <button
                            onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                            disabled={actionLoading === subscription.id}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      
                      {(subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') && (
                        <div className="flex-1 text-center py-2 text-gray-500 text-sm">
                          No actions available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}