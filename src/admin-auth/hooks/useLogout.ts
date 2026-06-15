'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api';

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setLoading(true);
    try {
      await apiFetch('/admin-auth/logout', { method: 'POST' });
    } finally {
      setLoading(false);
      router.replace('/login');
    }
  };

  return { logout, loading };
}
