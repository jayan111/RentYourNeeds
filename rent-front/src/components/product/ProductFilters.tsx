'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterProps {
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  category: string;
  priceRange: { min: number; max: number };
  rating: number;
  sortBy: string;
}

interface Category {
  id: string;
  name: string;
}

const sortOptions = [
  { id: 'relevance', name: 'Most Relevant' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'newest', name: 'Newest First' },
];

const MAX_PRICE = 50000;

export function ProductFilters({ onFiltersChange }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedSections, setExpandedSections] = useState({ category: true, price: true, rating: true, sort: true });

  // Read current filter values directly from URL params (single source of truth)
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = parseInt(searchParams.get('minPrice') || '0');
  const currentMaxPrice = parseInt(searchParams.get('maxPrice') || String(MAX_PRICE));
  const currentRating = parseFloat(searchParams.get('rating') || '0');
  const currentSortBy = searchParams.get('sortBy') || 'relevance';

  // Local state only for the price slider (to avoid URL update on every drag)
  const [sliderMax, setSliderMax] = useState(currentMaxPrice);

  // Fetch categories from API once
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    fetch(`${apiUrl}/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.data || d || []))
      .catch(() => setCategories([]));
  }, []);

  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === '0' || value === 'relevance') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page on filter change
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleCategoryChange = (category: string) => {
    updateURL({ category: category || null });
  };

  const handlePriceCommit = () => {
    updateURL({
      maxPrice: sliderMax < MAX_PRICE ? String(sliderMax) : null,
    });
  };

  const handleRatingChange = (rating: string) => {
    updateURL({ rating: rating !== '0' ? rating : null });
  };

  const handleSortChange = (sortBy: string) => {
    updateURL({ sortBy: sortBy !== 'relevance' ? sortBy : null });
  };

  const clearFilters = () => {
    setSliderMax(MAX_PRICE);
    router.push('/products');
  };

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const hasActiveFilters = currentCategory !== '' || currentMaxPrice < MAX_PRICE || currentRating > 0 || currentSortBy !== 'relevance';

  return (
    <div className="bg-white rounded-lg shadow-sm border animate-slide-up">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors flex items-center">
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn(
        'transition-all duration-300 overflow-hidden',
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 lg:max-h-screen lg:opacity-100'
      )}>
        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <button onClick={() => toggleSection('sort')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors">
              Sort By
              {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn('transition-all duration-200 overflow-hidden', expandedSections.sort ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}>
              <select value={currentSortBy} onChange={e => handleSortChange(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                {sortOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <button onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors">
              Categories
              {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn('transition-all duration-200 overflow-hidden', expandedSections.category ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0')}>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <input type="radio" name="category" value=""
                    checked={currentCategory === ''}
                    onChange={() => handleCategoryChange('')}
                    className="mr-3 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm">All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input type="radio" name="category" value={cat.id}
                      checked={currentCategory === cat.id}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="mr-3 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <button onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors">
              Price Range (per month)
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn('transition-all duration-200 overflow-hidden', expandedSections.price ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}>
              <div className="space-y-3">
                <input type="range" min="0" max={MAX_PRICE} step="500"
                  value={sliderMax}
                  onChange={e => setSliderMax(parseInt(e.target.value))}
                  onMouseUp={handlePriceCommit}
                  onTouchEnd={handlePriceCommit}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹0</span>
                  <span className="font-medium text-primary-600">₹{sliderMax.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <button onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors">
              Minimum Rating
              {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn('transition-all duration-200 overflow-hidden', expandedSections.rating ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}>
              <select value={String(currentRating)} onChange={e => handleRatingChange(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option value="0">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
