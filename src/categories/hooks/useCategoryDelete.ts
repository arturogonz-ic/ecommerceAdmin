'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';

export function useCategoryDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductCount = async (id: string): Promise<number> => {
    const data = await apiFetch<{ count: number }>(`/categories/${id}/product-count`);
    return data.count;
  };

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { remove, getProductCount, loading, error };
}
