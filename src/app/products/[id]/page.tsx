'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useProduct } from '@/catalog/hooks/useProduct';
import { useProductDelete } from '@/catalog/hooks/useProductDelete';
import { useProductDiscount } from '@/catalog/hooks/useProductDiscount';
import { useCategories } from '@/categories/hooks/useCategories';
import { AdminNav } from '@/shared/components/AdminNav';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function ProductDetailPage() {
  const { loading: authLoading } = useRequireAdmin();
  const params = useParams();
  const id = params.id as string;
  const { product, loading, notFound: isNotFound, refetch } = useProduct(id);
  const { remove, loading: deleting } = useProductDelete();
  const { applyDiscount, removeDiscount, loading: discounting } = useProductDiscount();
  const { categories } = useCategories();
  const router = useRouter();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [discountPct, setDiscountPct] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('');
  const [discountError, setDiscountError] = useState('');

  if (authLoading || loading) return null;
  if (isNotFound) return notFound();

  const handleDelete = async () => {
    const ok = await remove(id);
    if (ok) router.push('/products');
  };

  const activeDiscount = product?.discount?.isActive ? product.discount : null;

  const categoryHasDiscount = product?.categories.some((cid) => {
    const cat = categories.find((c) => c._id === cid) as (typeof categories[0] & { discount?: { isActive: boolean } }) | undefined;
    return cat?.discount?.isActive;
  });

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseInt(discountPct, 10);
    if (!pct || pct < 1 || pct > 100) { setDiscountError('Percentage must be 1–100'); return; }
    if (!discountExpiry) { setDiscountError('Expiry date is required'); return; }
    setDiscountError('');
    const ok = await applyDiscount(id, { percentage: pct, expiresAt: new Date(discountExpiry).toISOString() });
    if (ok) { setShowDiscountDialog(false); setDiscountPct(''); setDiscountExpiry(''); refetch(); }
  };

  const handleRemoveDiscount = async () => {
    const ok = await removeDiscount(id);
    if (ok) refetch();
  };

  const categoryNames = product?.categories
    .map((cid) => categories.find((c) => c._id === cid)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-2xl mx-auto px-4 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{product?.name}</h1>
          <div className="flex gap-2">
            <Link href={`/products/${id}/edit`}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50 font-medium">
              Edit
            </Link>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium">
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{product?.description || '—'}</p>
          </div>
          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Price</p>
              <p className="text-sm font-medium">${product?.price.toFixed(2)}</p>
            </div>
            {product?.effectivePrice !== product?.price && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Effective Price</p>
                <p className="text-sm font-medium text-green-700">${product?.effectivePrice.toFixed(2)}</p>
              </div>
            )}
            {product?.cost != null && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cost</p>
                <p className="text-sm font-medium">${product.cost.toFixed(2)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stock</p>
              <p className="text-sm font-medium">{product?.stock}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Discount</p>
            {activeDiscount ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-700 font-medium">
                  {activeDiscount.percentage}% off — expires {new Date(activeDiscount.expiresAt).toLocaleDateString()}
                </span>
                <button onClick={handleRemoveDiscount} disabled={discounting}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50">
                  Remove discount
                </button>
              </div>
            ) : (
              <button onClick={() => setShowDiscountDialog(true)}
                className="text-sm text-blue-600 hover:underline">
                Add discount
              </button>
            )}
          </div>

          {categoryNames && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Categories</p>
              <p className="text-sm text-gray-700">{categoryNames}</p>
            </div>
          )}
          {product?.images && product.images.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Images</p>
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <img key={i} src={`${BASE_URL}/${img}`} alt={`Product image ${i + 1}`}
                    className="w-24 h-24 object-cover rounded border" />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="font-semibold">Delete &ldquo;{product?.name}&rdquo;?</h2>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscountDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="font-semibold">Add Discount</h2>
            {categoryHasDiscount && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                This product&apos;s category already has a discount. Both will stack.
              </p>
            )}
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
                <button type="button" onClick={() => { setShowDiscountDialog(false); setDiscountError(''); }}
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
