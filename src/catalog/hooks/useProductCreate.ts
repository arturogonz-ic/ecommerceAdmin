'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';
import type { Product } from './useProducts';

export function useProductCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (formData: FormData): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ product: Product }>('/catalog/products', {
        method: 'POST',
        body: formData,
      });
      return data.product;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
