'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'photography', label: 'Photography' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'vehicles', label: 'Vehicles' },
];

const sortOptions = [
  { id: 'relevance', name: 'Most Relevant' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'newest', name: 'Newest First' },
];

export function ProductFilters({ onFiltersChange }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    sort: true,
  });
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    priceRange: { min: 0, max: 200 },
    rating: 0,
    sortBy: 'relevance',
  });

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setFilters(prev => ({ ...prev, category }));
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    const params = new URLSearchParams(searchParams);
    params.set('minPrice', min.toString());
    params.set('maxPrice', max.toString());
    setFilters(prev => ({ ...prev, priceRange: { min, max } }));
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setPriceRange([0, 200]);
    setFilters({
      category: '',
      priceRange: { min: 0, max: 200 },
      rating: 0,
      sortBy: 'relevance',
    });
    router.push('/products');
  };

  const hasActiveFilters = filters.category !== '' || priceRange[1] < 200 || filters.rating > 0;

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
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
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
            <button
              onClick={() => toggleSection('sort')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors"
            >
              Sort By
              {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn(
              'transition-all duration-200 overflow-hidden',
              expandedSections.sort ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors"
            >
              Categories
              {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn(
              'transition-all duration-200 overflow-hidden',
              expandedSections.category ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={searchParams.get('category') === category.value || (!searchParams.get('category') && category.value === '')}
                      onChange={() => handleCategoryChange(category.value)}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors"
            >
              Price Range (per day)
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn(
              'transition-all duration-200 overflow-hidden',
              expandedSections.price ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span className="font-medium text-primary-600">${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full mb-3 font-medium hover:text-primary-600 transition-colors"
            >
              Minimum Rating
              {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn(
              'transition-all duration-200 overflow-hidden',
              expandedSections.rating ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <select 
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value={0}>All Ratings</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}