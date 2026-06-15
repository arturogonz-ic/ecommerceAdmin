'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/shared/api';

export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip?: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'lost';
  createdAt: string;
  deliveryAt?: string;
  shippingCarrier?: string;
  trackingId?: string;
}

export interface OrderFilters {
  createdAtFrom?: string;
  createdAtTo?: string;
  deliveryAtFrom?: string;
  deliveryAtTo?: string;
  productIds?: string[];
  categoryIds?: string[];
  status?: string[];
}

export function useOrders(initialFilters: OrderFilters = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.createdAtFrom) params.append('createdAtFrom', filters.createdAtFrom);
    if (filters.createdAtTo) params.append('createdAtTo', filters.createdAtTo);
    if (filters.deliveryAtFrom) params.append('deliveryAtFrom', filters.deliveryAtFrom);
    if (filters.deliveryAtTo) params.append('deliveryAtTo', filters.deliveryAtTo);
    if (filters.productIds?.length) {
      filters.productIds.forEach((id) => params.append('productIds', id));
    }
    if (filters.categoryIds?.length) {
      filters.categoryIds.forEach((id) => params.append('categoryIds', id));
    }
    if (filters.status?.length) {
      filters.status.forEach((s) => params.append('status', s));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    apiFetch<{ orders: Order[] }>(`/orders${query}`)
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    filters,
    setFilter: (key: keyof OrderFilters, value: OrderFilters[keyof OrderFilters]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
  };
}
