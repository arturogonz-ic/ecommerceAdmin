'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useOrders } from '@/orders/hooks/useOrders';
import { useProducts } from '@/catalog/hooks/useProducts';
import { useCategories } from '@/categories/hooks/useCategories';
import { AdminNav } from '@/shared/components/AdminNav';
import { MultiSelect } from '@/shared/components/MultiSelect';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersPageInner />
    </Suspense>
  );
}

function OrdersPageInner() {
  const { loading: authLoading } = useRequireAdmin();
  const { products } = useProducts();
  const { categories } = useCategories();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.getAll('status');
  const { orders, loading, setFilter } = useOrders(
    initialStatus.length ? { status: initialStatus } : {}
  );

  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [deliveryAtFrom, setDeliveryAtFrom] = useState('');
  const [deliveryAtTo, setDeliveryAtTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>(initialStatus);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  if (authLoading) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'lost', label: 'Lost' },
  ];

  const productOptions = products.map((p) => ({ value: p._id, label: p.name }));
  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      lost: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const applyFilters = () => {
    if (createdAtFrom) setFilter('createdAtFrom', createdAtFrom);
    if (createdAtTo) setFilter('createdAtTo', createdAtTo);
    if (deliveryAtFrom) setFilter('deliveryAtFrom', deliveryAtFrom);
    if (deliveryAtTo) setFilter('deliveryAtTo', deliveryAtTo);
    if (selectedStatus.length) setFilter('status', selectedStatus);
    if (selectedProducts.length) setFilter('productIds', selectedProducts);
    if (selectedCategories.length) setFilter('categoryIds', selectedCategories);
  };

  const clearFilters = () => {
    setCreatedAtFrom('');
    setCreatedAtTo('');
    setDeliveryAtFrom('');
    setDeliveryAtTo('');
    setSelectedStatus([]);
    setSelectedProducts([]);
    setSelectedCategories([]);
    setFilter('createdAtFrom', undefined);
    setFilter('createdAtTo', undefined);
    setFilter('deliveryAtFrom', undefined);
    setFilter('deliveryAtTo', undefined);
    setFilter('status', undefined);
    setFilter('productIds', undefined);
    setFilter('categoryIds', undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-semibold mb-6">Orders</h1>

        <div className="bg-white border rounded-lg mb-6 flex flex-col">
          <div className="flex flex-wrap gap-2 p-4 border-b">
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'created' ? null : 'created')}
              className={`text-sm font-medium px-3 py-1 border rounded transition-colors ${
                expandedFilter === 'created'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Created Date {createdAtFrom || createdAtTo ? '✓' : ''}
            </button>
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'delivery' ? null : 'delivery')}
              className={`text-sm font-medium px-3 py-1 border rounded transition-colors ${
                expandedFilter === 'delivery'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Delivery Date {deliveryAtFrom || deliveryAtTo ? '✓' : ''}
            </button>
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'status' ? null : 'status')}
              className={`text-sm font-medium px-3 py-1 border rounded transition-colors ${
                expandedFilter === 'status'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Status {selectedStatus.length ? `(${selectedStatus.length})` : ''}
            </button>
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'products' ? null : 'products')}
              className={`text-sm font-medium px-3 py-1 border rounded transition-colors ${
                expandedFilter === 'products'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Products {selectedProducts.length ? `(${selectedProducts.length})` : ''}
            </button>
            <button
              onClick={() => setExpandedFilter(expandedFilter === 'categories' ? null : 'categories')}
              className={`text-sm font-medium px-3 py-1 border rounded transition-colors ${
                expandedFilter === 'categories'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              Categories {selectedCategories.length ? `(${selectedCategories.length})` : ''}
            </button>
            <div className="flex-1" />
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white rounded px-3 py-1 text-sm font-medium hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="border rounded px-3 py-1 text-sm font-medium hover:bg-gray-50"
            >
              Clear
            </button>
          </div>

          {expandedFilter && (
            <div className="p-4 border-t">
              {expandedFilter === 'created' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">From</label>
                    <input
                      type="datetime-local"
                      value={createdAtFrom}
                      onChange={(e) => setCreatedAtFrom(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">To</label>
                    <input
                      type="datetime-local"
                      value={createdAtTo}
                      onChange={(e) => setCreatedAtTo(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {expandedFilter === 'delivery' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">From</label>
                    <input
                      type="datetime-local"
                      value={deliveryAtFrom}
                      onChange={(e) => setDeliveryAtFrom(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">To</label>
                    <input
                      type="datetime-local"
                      value={deliveryAtTo}
                      onChange={(e) => setDeliveryAtTo(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {expandedFilter === 'status' && (
                <MultiSelect
                  options={statusOptions}
                  selected={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Select status..."
                />
              )}

              {expandedFilter === 'products' && (
                <MultiSelect
                  options={productOptions}
                  selected={selectedProducts}
                  onChange={setSelectedProducts}
                  placeholder="Select products..."
                />
              )}

              {expandedFilter === 'categories' && (
                <MultiSelect
                  options={categoryOptions}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Select categories..."
                />
              )}
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders found.</p>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Buyer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b cursor-pointer hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/orders/detail?id=${order._id}`} className="block">
                        {order._id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/orders/detail?id=${order._id}`} className="block">
                        {order.userId.name} ({order.userId.email})
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link href={`/orders/detail?id=${order._id}`} className="block">
                        ${order.total.toFixed(2)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/orders/detail?id=${order._id}`} className="block">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/orders/detail?id=${order._id}`} className="block">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
