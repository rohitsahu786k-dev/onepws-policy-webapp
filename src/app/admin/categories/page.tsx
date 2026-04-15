'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Input } from '@/components/ui/components';
import { AlertCircle, CheckCircle, FolderTree, Loader2, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

interface Category {
  _id: string;
  name: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to load categories'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await axios.post('/api/categories', { name: newCategoryName.trim() });
      setCategories([...categories, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      setSuccess('Category added successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error adding category'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
      setSuccess('Category deleted successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error deleting category'));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Category management</h1>
        <p className="mt-2 text-sm text-muted">Create clean policy groups and remove unused categories.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Category */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              Add category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Category Name</label>
                <Input
                  placeholder="e.g., Certificates"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 animate-spin" size={18} /> Adding...</> : 'Add category'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-none p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="px-6 py-4 font-semibold text-muted">Name</th>
                    <th className="px-6 py-4 font-semibold text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="border-b border-border hover:bg-black transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FolderTree size={16} className="text-primary" />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && !loading && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-muted">
                        No categories found
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-muted">
                        <Loader2 className="mx-auto animate-spin text-primary" size={24} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
