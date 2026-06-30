'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({ onSearch, placeholder = "Search products...", className, defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Only sync external defaultValue changes when the input is NOT focused (e.g. navigating back)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (document.activeElement !== inputRef.current) {
      setQuery(defaultValue);
    }
  }, [defaultValue]);

  // Only trigger search after user changes, not on every defaultValue sync
  const prevDebounced = useRef(debouncedQuery);
  useEffect(() => {
    if (prevDebounced.current !== debouncedQuery) {
      prevDebounced.current = debouncedQuery;
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'relative flex items-center transition-all duration-200',
        isFocused ? 'scale-[1.02]' : 'scale-100'
      )}>
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'bg-white shadow-sm hover:shadow-md',
            isFocused ? 'shadow-lg border-primary-300' : 'border-gray-300'
          )}
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
