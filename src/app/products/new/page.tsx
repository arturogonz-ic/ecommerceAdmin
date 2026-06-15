'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAdmin } from '@/admin-auth/hooks/useRequireAdmin';
import { useProductCreate } from '@/catalog/hooks/useProductCreate';
import { useCategories } from '@/categories/hooks/useCategories';
import { useCategoryCreate } from '@/categories/hooks/useCategoryCreate';
import { AdminNav } from '@/shared/components/AdminNav';
import { MultiSelect } from '@/shared/components/MultiSelect';

export default function NewProductPage() {
  const { loading: authLoading } = useRequireAdmin();
  const { create, loading, error } = useProductCreate();
  const { categories } = useCategories();
  const { create: createCategory } = useCategoryCreate();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<FileList | null>(null);
  const [validationError, setValidationError] = useState('');

  if (authLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setValidationError('Name is required'); return; }
    if (!price) { setValidationError('Price is required'); return; }
    if (!stock) { setValidationError('Stock is required'); return; }
    setValidationError('');

    const formData = new FormData();
    formData.append('name', name.trim());
    if (description.trim()) formData.append('description', description.trim());
    formData.append('price', price);
    if (cost) formData.append('cost', cost);
    formData.append('stock', stock);
    selectedCategories.forEach((id) => formData.append('categories', id));
    if (images) {
      Array.from(images).forEach((file) => formData.append('images', file));
    }

    const product = await create(formData);
    if (product) router.push(`/products/${product._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl font-semibold mb-6">New Product</h1>
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 flex flex-col gap-3">
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

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Price *</label>
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Cost</label>
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Stock *</label>
              <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)}
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)}
              className="text-sm" />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
