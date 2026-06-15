'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/shared/api';

export interface Discount {
  percentage: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  effectivePrice: number;
  stock: number;
  images: string[];
  categories: string[];
  discount?: Discount;
}

export interface ProductFilters {
  name: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;
}

const DEFAULT_FILTERS: ProductFilters = { name: '', minPrice: '', maxPrice: '', categoryId: '' };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    apiFetch<{ products: Product[] }>('/catalog/products')
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false;
      if (filters.categoryId && !p.categories.includes(filters.categoryId)) return false;
      return true;
    });
  }, [products, filters]);

  return { products, filteredProducts, loading, error, filters, setFilters };
}
