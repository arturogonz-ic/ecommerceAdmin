'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/shared/api';

export type Period = 'day' | 'week' | 'month' | 'year' | 'all';

export interface DashboardStats {
  revenue: number;
  profit: number;
  orderCount: number;
  period: Period;
}

export function useDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<DashboardStats>(`/admin/dashboard?period=${period}`)
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, period, setPeriod };
}
