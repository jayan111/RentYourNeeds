'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TenureSelectorProps {
  value: number;
  onChange: (months: number) => void;
  className?: string;
}

const TENURE_OPTIONS = [3, 6, 12];

export function TenureSelector({ value, onChange, className }: TenureSelectorProps) {
  const currentIndex = TENURE_OPTIONS.indexOf(value);
  const [sliderIndex, setSliderIndex] = useState(currentIndex >= 0 ? currentIndex : 0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setSliderIndex(index);
    onChange(TENURE_OPTIONS[index]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label className="block text-sm font-medium text-gray-700">
        Choose Tenure
      </label>
      
      <div className="relative px-2">
        {/* Custom Slider Track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute h-2 bg-primary-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(sliderIndex / 2) * 100}%` }}
          />
        </div>
        
        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={sliderIndex}
          onChange={handleSliderChange}
          className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-input"
        />
        
        {/* Slider Dots */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between px-1">
          {TENURE_OPTIONS.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all duration-200',
                index <= sliderIndex
                  ? 'bg-primary-600 border-primary-600 shadow-md'
                  : 'bg-white border-gray-300'
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Tenure Labels */}
      <div className="flex justify-between px-2">
        {TENURE_OPTIONS.map((months, index) => (
          <button
            key={months}
            onClick={() => {
              setSliderIndex(index);
              onChange(months);
            }}
            className={cn(
              'text-sm font-medium transition-all duration-200 px-2 py-1 rounded',
              index === sliderIndex 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            {months} months
          </button>
        ))}
      </div>
      
      {/* Selected Value Display */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 transition-all duration-300">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold text-primary-700">
              {TENURE_OPTIONS[sliderIndex]}
            </span>
            <span className="text-lg text-primary-600">months</span>
          </div>
          <p className="text-sm text-primary-600 mt-1">
            Selected subscription period
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider-input::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }
        
        .slider-input::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </div>
  );
}