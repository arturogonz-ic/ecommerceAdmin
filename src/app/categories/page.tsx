'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useCategories } from '@/categories/hooks/useCategories';
import { useCategoryCreate } from '@/categories/hooks/useCategoryCreate';
import { useCategoryDelete } from '@/categories/hooks/useCategoryDelete';
import { useCategoryDiscount } from '@/categories/hooks/useCategoryDiscount';
import { AdminNav } from '@/shared/components/AdminNav';
import type { Category } from '@/categories/hooks/useCategories';

export default function CategoriesPage() {
  const { loading: authLoading } = useRequireAdmin();
  const { categories, loading, refetch } = useCategories();
  const { create, loading: creating, error: createError } = useCategoryCreate();
  const { remove, getProductCount, loading: deleting } = useCategoryDelete();
  const { applyDiscount, removeDiscount, loading: discounting } = useCategoryDiscount();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string; count: number } | null>(null);
  const [discountDialog, setDiscountDialog] = useState<Category | null>(null);
  const [discountPct, setDiscountPct] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('');
  const [discountError, setDiscountError] = useState('');

  if (authLoading) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Name is required'); return; }
    setNameError('');
    const cat = await create(name.trim(), description.trim() || undefined);
    if (cat) { setName(''); setDescription(''); refetch(); }
  };

  const handleDeleteClick = async (id: string, catName: string) => {
    const count = await getProductCount(id);
    setDeleteDialog({ id, name: catName, count });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    const ok = await remove(deleteDialog.id);
    if (ok) { setDeleteDialog(null); refetch(); }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountDialog) return;
    const pct = parseInt(discountPct, 10);
    if (!pct || pct < 1 || pct > 100) { setDiscountError('Percentage must be 1–100'); return; }
    if (!discountExpiry) { setDiscountError('Expiry date is required'); return; }
    setDiscountError('');
    const ok = await applyDiscount(discountDialog._id, { percentage: pct, expiresAt: new Date(discountExpiry).toISOString() });
    if (ok) { setDiscountDialog(null); setDiscountPct(''); setDiscountExpiry(''); refetch(); }
  };

  const handleRemoveDiscount = async (id: string) => {
    const ok = await removeDiscount(id);
    if (ok) refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-2xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-semibold mb-6">Categories</h1>

        <div className="bg-white border rounded-lg mb-6">
          <button onClick={() => setShowCreateForm(!showCreateForm)}
            className={`w-full px-4 py-3 text-left font-medium transition-colors flex items-center justify-between ${
              showCreateForm ? 'bg-blue-50 text-blue-700 border-b' : 'hover:bg-gray-50'
            }`}>
            <span>New Category</span>
            <span className="text-sm">{showCreateForm ? '▼' : '▶'}</span>
          </button>
          {showCreateForm && (
            <form onSubmit={handleCreate} className="p-4 flex flex-col gap-3 border-t">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {nameError && <p className="text-xs text-red-600">{nameError}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {createError && <p className="text-xs text-red-600">{createError}</p>}
              <button type="submit" disabled={creating}
                className="self-start bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {categories.map((cat) => {
              const activeDiscount = cat.discount?.isActive ? cat.discount : null;
              return (
                <li key={cat._id} className="bg-white border rounded-lg px-4 py-3 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                    {activeDiscount ? (
                      <p className="text-xs text-green-700">
                        {activeDiscount.percentage}% off — expires {new Date(activeDiscount.expiresAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeDiscount ? (
                      <button onClick={() => handleRemoveDiscount(cat._id)} disabled={discounting}
                        className="text-xs text-amber-700 hover:underline disabled:opacity-50">
                        Remove discount
                      </button>
                    ) : (
                      <button onClick={() => { setDiscountDialog(cat); setDiscountPct(''); setDiscountExpiry(''); setDiscountError(''); }}
                        className="text-xs text-blue-600 hover:underline">
                        Add discount
                      </button>
                    )}
                    <button onClick={() => handleDeleteClick(cat._id, cat.name)} disabled={deleting}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {deleteDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="font-semibold">Delete &ldquo;{deleteDialog.name}&rdquo;?</h2>
            {deleteDialog.count > 0 ? (
              <p className="text-sm text-gray-600">
                {deleteDialog.count} product{deleteDialog.count !== 1 ? 's' : ''} have this category and will lose it.
              </p>
            ) : (
              <p className="text-sm text-gray-600">No products have this category.</p>
            )}
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteDialog(null)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {discountDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="font-semibold">Add Discount — {discountDialog.name}</h2>
            {discountError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {discountError}
              </p>
            )}
            <form onSubmit={handleApplyDiscount} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Percentage (1–100)</label>
                <input type="number" min="1" max="100" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Expires at</label>
                <input type="datetime-local" value={discountExpiry} onChange={(e) => setDiscountExpiry(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setDiscountDialog(null)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={discounting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {discounting ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
