'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/shared/api';

export function useOrderStatus(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transition = useCallback(
    async (status: string, shippingCarrier?: string, trackingId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const body: { status: string; shippingCarrier?: string; trackingId?: string } = { status };
        if (shippingCarrier) body.shippingCarrier = shippingCarrier;
        if (trackingId) body.trackingId = trackingId;
        await apiFetch(`/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to transition status');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  return { transition, loading, error };
}
