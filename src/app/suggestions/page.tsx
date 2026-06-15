'use client';

import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useSuggestions } from '@/suggestions/hooks/useSuggestions';
import { AdminNav } from '@/shared/components/AdminNav';

export default function SuggestionsPage() {
  const { loading: authLoading } = useRequireAdmin();
  const { suggestions, loading, error, markRead, remove } = useSuggestions();

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-semibold mb-6">Suggestions</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions yet.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s._id}
                className={`border rounded-lg p-4 ${s.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    {!s.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    <span className="text-xs text-gray-400 truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</span>
                    {!s.read && (
                      <button
                        onClick={() => markRead(s._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => remove(s._id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
