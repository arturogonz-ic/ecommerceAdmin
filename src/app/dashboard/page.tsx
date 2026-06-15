'use client';

import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useDashboard } from '@/catalog/hooks/useDashboard';
import { AdminNav } from '@/shared/components/AdminNav';
import { FailedOrdersWidget } from '@/orders/components/FailedOrdersWidget';
import type { Period } from '@/catalog/hooks/useDashboard';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

export default function DashboardPage() {
  const { loading: authLoading } = useRequireAdmin();
  const { stats, loading, error, period, setPeriod } = useDashboard();

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-wrap gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm rounded ${
                  period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'border hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-semibold">${stats.revenue.toFixed(2)}</p>
              </div>
              <div className="bg-white border rounded-lg p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Profit</p>
                <p className={`text-2xl font-semibold ${stats.profit < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  ${stats.profit.toFixed(2)}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Orders</p>
                <p className="text-2xl font-semibold">{stats.orderCount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">Profit is based on current product cost, not historical cost at time of purchase.</p>

            <FailedOrdersWidget period={period} />
          </>
        ) : null}
      </main>
    </div>
  );
}
