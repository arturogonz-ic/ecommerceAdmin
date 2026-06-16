'use client';

import Link from 'next/link';
import type { Period } from '@/catalog/hooks/useDashboard';
import { useFailedOrders } from '../hooks/useFailedOrders';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    cancelled: 'bg-red-100 text-red-700',
    lost: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

interface FailedOrdersWidgetProps {
  period?: Period;
}

export function FailedOrdersWidget({ period = 'month' }: FailedOrdersWidgetProps) {
  const { data, loading, error, retry } = useFailedOrders(period);

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Failed Orders</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Failed Orders</h2>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-red-600">Unable to load failed orders</p>
          <button
            onClick={retry}
            className="self-start text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Failed Orders</h2>
        <p className="text-sm text-gray-500">No failed orders in the last 30 days</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Failed Orders</h2>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{data.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{data.cancelledCount}</p>
            <p className="text-xs text-gray-600">Cancelled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{data.lostCount}</p>
            <p className="text-xs text-gray-600">Lost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">${data.totalImpact.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Impact</p>
          </div>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Order ID</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Reason</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/detail?id=${order._id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {order._id.substring(0, 8)}...
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{order.userId.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium">
                  ${order.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/orders?status=cancelled&status=lost"
        className="text-sm text-blue-600 hover:underline"
      >
        View all failed orders →
      </Link>
    </div>
  );
}
