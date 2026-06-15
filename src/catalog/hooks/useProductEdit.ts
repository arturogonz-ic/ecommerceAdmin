'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/shared/api';
import type { Product } from './useProducts';

interface EditData {
  name?: string;
  description?: string;
  cost?: number;
  stock?: number;
  categories?: string[];
}

export function useProductEdit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const edit = async (id: string, data: EditData): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ product: Product }>(`/catalog/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return result.product;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { edit, loading, error };
}
