'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/shared/api';
import type { Product } from './useProducts';

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<{ product: Product }>(`/catalog/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => {
        if (err.code === 404) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, loading, error, notFound, refetch: fetch };
}
