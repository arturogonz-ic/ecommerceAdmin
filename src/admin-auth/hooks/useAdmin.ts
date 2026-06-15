'use client';

import { useState, useEffect } from 'react';
import { apiFetch, ApiError } from '@/shared/api';

interface Admin {
  id: string;
  email: string;
  name: string;
}

export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    apiFetch<{ admin: Admin }>('/admin-auth/me')
      .then((data) => setAdmin(data.admin))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { admin, loading, error };
}
