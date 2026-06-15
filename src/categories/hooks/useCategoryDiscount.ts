'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';

export function useCategoryDiscount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyDiscount = async (id: string, data: { percentage: number; expiresAt: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ category: unknown }>(`/categories/${id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return result.category;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to apply discount');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/categories/${id}/discount`, { method: 'DELETE' });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove discount');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { applyDiscount, removeDiscount, loading, error };
}
