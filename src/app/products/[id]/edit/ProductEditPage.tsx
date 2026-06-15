'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useProduct } from '@/catalog/hooks/useProduct';
import { useProductEdit } from '@/catalog/hooks/useProductEdit';
import { useCategories } from '@/categories/hooks/useCategories';
import { useCategoryCreate } from '@/categories/hooks/useCategoryCreate';
import { AdminNav } from '@/shared/components/AdminNav';
import { MultiSelect } from '@/shared/components/MultiSelect';

export default function EditProductPage() {
  const { loading: authLoading } = useRequireAdmin();
  const params = useParams();
  const id = params.id as string;
  const { product, loading } = useProduct(id);
  const { edit, loading: saving, error } = useProductEdit();
  const { categories } = useCategories();
  const { create: createCategory } = useCategoryCreate();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setCost(product.cost != null ? String(product.cost) : '');
      setStock(String(product.stock));
      setSelectedCategories(product.categories ?? []);
    }
  }, [product]);

  if (authLoading || loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setValidationError('Name is required'); return; }
    if (!stock) { setValidationError('Stock is required'); return; }
    setValidationError('');

    const updated = await edit(id, {
      name: name.trim(),
      description: description.trim() || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      stock: parseInt(stock, 10),
      categories: selectedCategories,
    });
    if (updated) router.push(`/products/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 flex flex-col gap-4">
          {(validationError || error) && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {validationError || error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Stock *</label>
              <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Cost (optional)</label>
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Categories</label>
            <MultiSelect
              options={categories.map((c) => ({ value: c._id, label: c.name }))}
              selected={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="Add categories..."
              onCreate={async (name) => {
                const cat = await createCategory(name);
                return cat ? { value: cat._id, label: cat.name } : null;
              }}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => router.push(`/products/${id}`)}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
