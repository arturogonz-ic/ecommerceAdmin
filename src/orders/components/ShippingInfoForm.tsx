'use client';

import { useState } from 'react';

interface ShippingInfoFormProps {
  onSubmit: (data: { shippingCarrier?: string; trackingId?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
}

export function ShippingInfoForm({ onSubmit, onCancel, isLoading, error }: ShippingInfoFormProps) {
  const [carrier, setCarrier] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      shippingCarrier: carrier || undefined,
      trackingId: trackingId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="font-semibold">Add Shipping Information</h2>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Delivery Company</label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g., FedEx, UPS, DHL"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tracking ID</label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g., 794629439"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save & Ship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
