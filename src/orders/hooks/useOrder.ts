'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/shared/api';
import type { Order } from './useOrders';

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    apiFetch<{ order: Order }>(`/orders/${id}`)
      .then((data) => setOrder(data.order))
      .catch((err) => {
        if (err.message.includes('404') || err.code === 404) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { order, loading, error, notFound, refetch: fetch };
}
