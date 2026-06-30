'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { SearchBar } from '@/components/product/SearchBar';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Product } from '@/types';
import { productAPI } from '@/lib/api';
import { Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUrlParams } from '@/hooks/useUrlParams';
import { motion } from 'framer-motion';
import { FadeInUp, StaggerContainer, PageTransition } from '@/components/ui/MotionComponents';

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { updateParams, getParam, getAllParams } = useUrlParams();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = getAllParams();
      
      const response = await productAPI.getAll(params);
      const data = response.data;
      setProducts(data.data || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(parseInt(params.page || '1'));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [getAllParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback((query: string) => {
    updateParams({ search: query, page: null });
  }, [updateParams]);


  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateParams]);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 skeleton"></div>
            <div className="h-12 bg-gray-200 rounded skeleton"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-200 h-96 rounded-lg skeleton"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(9)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <FadeInUp>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              {getParam('category') ? `${getParam('category')?.charAt(0).toUpperCase()}${getParam('category')?.slice(1)} Products` : 'All Products'}
            </h1>
          </FadeInUp>
          
          {/* Search Bar */}
          <FadeInUp delay={0.1}>
            <div className="mb-4 sm:mb-6">
              <SearchBar 
                onSearch={handleSearch} 
                className="w-full max-w-2xl" 
                defaultValue={getParam('search') || ''}
              />
            </div>
          </FadeInUp>
          
          {/* Active Filters */}
          {Object.keys(getAllParams()).length > 0 && (
            <FadeInUp delay={0.2}>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(getAllParams()).map(([key, value]) => (
                  <motion.span 
                    key={key} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {key}: {value}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateParams({ [key]: null })}
                      className="ml-2 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </motion.span>
                ))}
              </div>
            </FadeInUp>
          )}
          
          {/* Controls */}
          <FadeInUp delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-sm text-gray-600">
                  {totalCount} product{totalCount !== 1 ? 's' : ''} found
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </motion.button>
                
                <div className="flex border rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'grid' ? 'bg-primary-600 text-white' : 'hover:bg-gray-50'
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 transition-colors',
                      viewMode === 'list' ? 'bg-primary-600 text-white' : 'hover:bg-gray-50'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            className={cn(
              'lg:col-span-1 transition-all duration-300',
              showFilters ? 'block' : 'hidden lg:block'
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductFilters />
          </motion.div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <StaggerContainer
                className={cn(
                  'transition-all duration-300',
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr'
                    : 'space-y-4'
                )}
              >
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </StaggerContainer>
            ) : (
              <FadeInUp>
                <div className="text-center py-12 sm:py-16 px-4">
                  <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    No products match your current filters. Try adjusting your criteria.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateParams({ search: null, category: null, minPrice: null, maxPrice: null, rating: null, sortBy: null })}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
                  >
                    Clear all filters
                  </motion.button>
                </div>
              </FadeInUp>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <FadeInUp delay={0.2}>
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </FadeInUp>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-200 h-96 rounded-lg skeleton"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    }>
      <ProductsContent />
    </Suspense>
  );
}