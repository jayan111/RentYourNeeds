'use client';

import { cn } from '@/lib/utils';

interface TenureSelectorProps {
  value: number;
  onChange: (months: number) => void;
  basePrice?: number;
  className?: string;
}

const TENURE_OPTIONS = [
  { months: 3,  label: '3 Months',  saving: null },
  { months: 6,  label: '6 Months',  saving: 'Save 5%' },
  { months: 12, label: '12 Months', saving: 'Save 10%' },
  { months: 24, label: '24 Months', saving: 'Save 15%' },
];

export function TenureSelector({ value, onChange, basePrice, className }: TenureSelectorProps) {
  const selected = TENURE_OPTIONS.find(t => t.months === value) ?? TENURE_OPTIONS[0];

  const discountedPrice = (months: number) => {
    if (!basePrice) return null;
    const discounts: Record<number, number> = { 3: 0, 6: 0.05, 12: 0.10, 24: 0.15 };
    return Math.round(basePrice * (1 - (discounts[months] ?? 0)));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-semibold text-gray-800">Select Tenure</label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TENURE_OPTIONS.map((opt) => {
          const price = discountedPrice(opt.months);
          const isActive = value === opt.months;
          return (
            <button
              key={opt.months}
              type="button"
              onClick={() => onChange(opt.months)}
              className={cn(
                'relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-sm font-medium',
                isActive
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/40'
              )}
            >
              {opt.saving && (
                <span className={cn(
                  'absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                  isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'
                )}>
                  {opt.saving}
                </span>
              )}
              <span className="font-bold">{opt.months} mo</span>
              {price && (
                <span className={cn('text-xs mt-0.5', isActive ? 'text-primary-600' : 'text-gray-500')}>
                  ₹{price}/mo
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg px-4 py-2.5 text-sm">
        <span className="text-gray-700">Selected: <span className="font-semibold text-primary-700">{selected.label}</span></span>
        {selected.saving && (
          <span className="text-green-600 font-semibold">{selected.saving}</span>
        )}
      </div>
    </div>
  );
}
