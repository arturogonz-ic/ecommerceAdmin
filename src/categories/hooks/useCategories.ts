'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/shared/api';

export interface CategoryDiscount {
  percentage: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  discount?: CategoryDiscount;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    apiFetch<{ categories: Category[] }>('/categories')
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
}
