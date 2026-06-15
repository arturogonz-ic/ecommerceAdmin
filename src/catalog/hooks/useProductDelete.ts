'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';

export function useProductDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/catalog/products/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}
