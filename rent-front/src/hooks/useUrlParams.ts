import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useUrlParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`${window.location.pathname}${newUrl}`, { scroll: false });
  }, [router, searchParams]);

  const getParam = useCallback((key: string) => {
    return searchParams.get(key);
  }, [searchParams]);

  const getAllParams = useCallback(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return { updateParams, getParam, getAllParams };
}