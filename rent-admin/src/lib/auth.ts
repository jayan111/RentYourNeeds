'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, clearAuthTokens } from './fetchWithAuth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        // fetchWithAuth handles 401 → auto-refresh → retry automatically
        const response = await fetchWithAuth(`${API_BASE}/auth/verify`);

        if (response.ok) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role !== 'admin') {
            clearAuthTokens();
            router.push('/login');
            return;
          }
          setUser(parsedUser);
        } else {
          // refresh was attempted inside fetchWithAuth and failed — tokens already cleared
          router.push('/login');
        }
      } catch {
        clearAuthTokens();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await fetchWithAuth(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {});
    } finally {
      clearAuthTokens();
      router.push('/login');
    }
  };

  return { user, loading, logout };
}
