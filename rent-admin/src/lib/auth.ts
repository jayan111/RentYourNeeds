'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role !== 'admin') {
            localStorage.clear();
            router.push('/login');
            return;
          }
          setUser(parsedUser);
        } else {
          localStorage.clear();
          router.push('/login');
        }
      } catch (error) {
        localStorage.clear();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return { user, loading, logout };
}