'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from './useAdmin';

export function useRequireAdmin() {
  const { admin, loading, error } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (error || !admin)) {
      router.replace('/');
    }
  }, [admin, loading, error, router]);

  return { admin, loading };
}
