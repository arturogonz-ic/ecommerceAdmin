'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';
import type { Category } from './useCategories';

export function useCategoryCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ category: Category }>('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return data.category;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create category');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
