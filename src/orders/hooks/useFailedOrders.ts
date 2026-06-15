'use client';

import { useState, useEffect } from 'react';
import type { Period } from '@/catalog/hooks/useDashboard';
import { apiFetch } from '@/shared/api';

export interface FailedOrder {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'cancelled' | 'lost';
  total: number;
  createdAt: string;
}

export interface FailedOrdersData {
  total: number;
  cancelledCount: number;
  lostCount: number;
  totalImpact: number;
  orders: FailedOrder[];
}

const getPeriodDateRange = (period: Period): Date => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = start.getDate() - start.getDay();
      start.setDate(day);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'all':
      start.setFullYear(1970);
      break;
  }

  return start;
};

export function useFailedOrders(period: Period = 'month') {
  const [data, setData] = useState<FailedOrdersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const createdAtFrom = getPeriodDateRange(period).toISOString();

      const params = new URLSearchParams();
      params.append('status', 'cancelled');
      params.append('status', 'lost');
      params.append('createdAtFrom', createdAtFrom);

      const response = await apiFetch<{ orders: FailedOrder[] }>(
        `/orders?${params.toString()}`
      );

      if (response && response.orders) {
        const orders = response.orders.slice(0, 5);
        const cancelledCount = response.orders.filter(
          (o: FailedOrder) => o.status === 'cancelled'
        ).length;
        const lostCount = response.orders.filter((o: FailedOrder) => o.status === 'lost').length;
        const totalImpact = response.orders.reduce((sum: number, o: FailedOrder) => sum + o.total, 0);

        setData({
          total: response.orders.length,
          cancelledCount,
          lostCount,
          totalImpact,
          orders,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch failed orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [period]);

  return { data, loading, error, retry: fetch };
}
