'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/shared/api';

export interface Suggestion {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ suggestions: Suggestion[] }>('/suggestions')
      .then((data) => setSuggestions(data.suggestions))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await apiFetch(`/suggestions/${id}/read`, { method: 'PATCH' });
    setSuggestions((prev) => prev.map((s) => s._id === id ? { ...s, read: true } : s));
  };

  const remove = async (id: string) => {
    await apiFetch(`/suggestions/${id}`, { method: 'DELETE' });
    setSuggestions((prev) => prev.filter((s) => s._id !== id));
  };

  return { suggestions, loading, error, markRead, remove };
}
