'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useOrder } from '@/orders/hooks/useOrder';
import { useOrderStatus } from '@/orders/hooks/useOrderStatus';
import { AdminNav } from '@/shared/components/AdminNav';
import { ShippingInfoForm } from '@/orders/components/ShippingInfoForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FORWARD_TRANSITIONS: Record<string, string> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const NEGATIVE_TRANSITIONS: Record<string, string[]> = {
  pending: ['cancelled'],
  processing: ['cancelled'],
  shipped: ['lost'],
};

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

export default function OrderDetailPage() {
  const { loading: authLoading } = useRequireAdmin();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { order, loading, notFound, refetch } = useOrder(id);
  const { transition, loading: transitioning, error: transitionError } = useOrderStatus(id);

  const [confirmDialog, setConfirmDialog] = useState<{ targetStatus: string; message: string } | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingError, setShippingError] = useState('');

  if (authLoading) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-500">Order not found</p>
        </main>
      </div>
    );
  }

  if (!order) return null;

  const handleForwardTransition = () => {
    const nextStatus = FORWARD_TRANSITIONS[order.status];
    if (!nextStatus) return;
    if (nextStatus === 'shipped') {
      setShowShippingForm(true);
    } else {
      transitionToStatus(nextStatus);
    }
  };

  const transitionToStatus = async (status: string, shippingCarrier?: string, trackingId?: string) => {
    const success = await transition(status, shippingCarrier, trackingId);
    if (success) {
      setShowShippingForm(false);
      setShippingError('');
      refetch();
    }
  };

  const handleNegativeTransition = (targetStatus: string) => {
    let message = '';
    if (targetStatus === 'cancelled') {
      message = 'Are you sure? Cancelling will restore stock for all items.';
    } else if (targetStatus === 'lost') {
      message = 'Are you sure? Marking as lost will not restore stock.';
    }
    setConfirmDialog({ targetStatus, message });
  };

  const confirmTransition = async () => {
    if (!confirmDialog) return;
    const success = await transition(confirmDialog.targetStatus);
    if (success) {
      setConfirmDialog(null);
      refetch();
    }
  };

  const nextStatus = FORWARD_TRANSITIONS[order.status];
  const negativeStatuses = NEGATIVE_TRANSITIONS[order.status] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-2xl mx-auto px-4 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Order {order._id.substring(0, 8)}...</h1>
          <Link href="/orders" className="text-sm text-blue-600 hover:underline">
            Back to Orders
          </Link>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Buyer Name</p>
              <p className="text-sm">{order.userId.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Buyer Email</p>
              <p className="text-sm">{order.userId.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Created</p>
              <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Delivery Date</p>
              <p className="text-sm">
                {order.deliveryAt ? new Date(order.deliveryAt).toLocaleString() : 'Not set'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Shipping Address</p>
            {order.userId.shippingAddress && (order.userId.shippingAddress.street || order.userId.shippingAddress.city || order.userId.shippingAddress.state || order.userId.shippingAddress.country || order.userId.shippingAddress.zip) ? (
              <div className="text-sm text-gray-700 space-y-0.5">
                {order.userId.shippingAddress.street && <p>{order.userId.shippingAddress.street}</p>}
                {order.userId.shippingAddress.city && order.userId.shippingAddress.state && (
                  <p>
                    {order.userId.shippingAddress.city}, {order.userId.shippingAddress.state}
                  </p>
                )}
                {order.userId.shippingAddress.zip && <p>{order.userId.shippingAddress.zip}</p>}
                {order.userId.shippingAddress.country && <p>{order.userId.shippingAddress.country}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No address information provided</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Billing Address</p>
            {order.userId.billingAddress && (order.userId.billingAddress.street || order.userId.billingAddress.city || order.userId.billingAddress.state || order.userId.billingAddress.country || order.userId.billingAddress.zip) ? (
              <div className="text-sm text-gray-700 space-y-0.5">
                {order.userId.billingAddress.street && <p>{order.userId.billingAddress.street}</p>}
                {order.userId.billingAddress.city && order.userId.billingAddress.state && (
                  <p>
                    {order.userId.billingAddress.city}, {order.userId.billingAddress.state}
                  </p>
                )}
                {order.userId.billingAddress.zip && <p>{order.userId.billingAddress.zip}</p>}
                {order.userId.billingAddress.country && <p>{order.userId.billingAddress.country}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No address information provided</p>
            )}
          </div>

          {(order.status === 'shipped' || order.status === 'delivered' || order.status === 'lost') && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Shipping</p>
              {order.shippingCarrier || order.trackingId ? (
                <div className="text-sm text-gray-700">
                  {order.shippingCarrier && <p>Carrier: {order.shippingCarrier}</p>}
                  {order.trackingId && <p>Tracking ID: {order.trackingId}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tracking information provided</p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">Items</p>
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium">Product</th>
                    <th className="px-4 py-2 text-right text-xs font-medium">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-4 py-2 text-xs">{item.name}</td>
                      <td className="px-4 py-2 text-xs text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-xs text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-xs text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-right pt-4 border-t">
            <p className="text-sm">
              <span className="font-medium">Total: </span>
              <span className="text-lg font-semibold">${order.total.toFixed(2)}</span>
            </p>
          </div>

          {transitionError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {transitionError}
            </p>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {nextStatus && (
              <button
                onClick={handleForwardTransition}
                disabled={transitioning}
                className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {transitioning ? 'Updating...' : `Next Status: ${nextStatus}`}
              </button>
            )}
            {negativeStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleNegativeTransition(status)}
                disabled={transitioning}
                className="border border-amber-600 text-amber-700 rounded px-4 py-2 text-sm font-medium hover:bg-amber-50 disabled:opacity-50"
              >
                {status === 'cancelled' ? 'Cancel Order' : 'Mark as Lost'}
              </button>
            ))}
          </div>
        </div>
      </main>

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="font-semibold">Confirm {confirmDialog.targetStatus}</h2>
            <p className="text-sm text-gray-600">{confirmDialog.message}</p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Go back
              </button>
              <button
                onClick={confirmTransition}
                disabled={transitioning}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {transitioning ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShippingForm && (
        <ShippingInfoForm
          onSubmit={async (data) => {
            await transitionToStatus('shipped', data.shippingCarrier, data.trackingId);
          }}
          onCancel={() => {
            setShowShippingForm(false);
            setShippingError('');
          }}
          isLoading={transitioning}
          error={shippingError || transitionError || undefined}
        />
      )}
    </div>
  );
}
