'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Button, Card, Input } from '@/components/ui/components';
import { AlertCircle, CheckCircle, Edit3, Eye, FileText, Filter, Loader2, Save, Trash2, Upload, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

const DocumentPreview = dynamic(() => import('@/components/app/DocumentPreview'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  ),
});

interface Document {
  _id: string;
  title: string;
  fileUrl: string;
  categoryId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newDoc, setNewDoc] = useState({ title: '', categoryId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [zoom, setZoom] = useState(100);
  const [titleEdited, setTitleEdited] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editDoc, setEditDoc] = useState({ title: '', categoryId: '' });

  const fetchData = async () => {
    try {
      setError('');
      const [docsRes, catsRes] = await Promise.all([
        axios.get('/api/documents'),
        axios.get('/api/categories'),
      ]);
      setDocuments(docsRes.data);
      setCategories(catsRes.data);
      if (catsRes.data.length > 0) {
        setNewDoc((prev) => ({ ...prev, categoryId: catsRes.data[0]._id }));
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to load documents'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newDoc.title.trim() || !newDoc.categoryId) {
      setError('Title, category, and file are required.');
      return;
    }
    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', newDoc.title);
    formData.append('categoryId', newDoc.categoryId);

    try {
      const res = await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewDoc({ ...newDoc, title: '' });
      setTitleEdited(false);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setDocuments((prev) => [res.data, ...prev]);
      setSuccess('Document uploaded successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error uploading document'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      setError('');
      setSuccess('');
      await axios.delete(`/api/documents/${id}`);
      setDocuments(documents.filter((d) => d._id !== id));
      setSuccess('Document deleted successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error deleting document'));
    }
  };

  const startEdit = (doc: Document) => {
    setEditingId(doc._id);
    setEditDoc({ title: doc.title, categoryId: doc.categoryId?._id || '' });
  };

  const saveDocument = async (docId: string) => {
    try {
      setError('');
      setSuccess('');
      const res = await axios.patch(`/api/documents/${docId}`, editDoc);
      setDocuments(documents.map((doc) => (doc._id === docId ? res.data : doc)));
      setEditingId('');
      setSuccess('Document updated successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to update document'));
    }
  };

  const filteredDocs = filterCategory === 'all'
    ? documents
    : documents.filter((d) => d.categoryId?._id === filterCategory);

  const handlePreview = (doc: Document) => {
    setZoom(100);
    setPreviewDocument(doc);
  };

  const getDefaultTitleFromFile = (selectedFile: File) => {
    return selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (!selectedFile) return;

    const defaultTitle = getDefaultTitleFromFile(selectedFile);
    if (!titleEdited || !newDoc.title.trim()) {
      setNewDoc((prev) => ({ ...prev, title: defaultTitle }));
      setTitleEdited(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document management</h1>
        <p className="mt-2 text-sm text-muted">Upload, filter, and remove policy files from the portal.</p>
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
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              Upload document
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Document title</label>
                <Input
                  placeholder="e.g., Annual Report 2023"
                  value={newDoc.title}
                  onChange={(e) => {
                    setTitleEdited(true);
                    setNewDoc({ ...newDoc, title: e.target.value });
                  }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Category</label>
                <select
                  className="w-full bg-card border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary transition-colors appearance-none"
                  value={newDoc.categoryId}
                  onChange={(e) => setNewDoc({ ...newDoc, categoryId: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Document file</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <Upload className="mx-auto mb-2 text-muted" size={24} />
                  <p className="text-sm text-muted">
                    {file ? file.name : 'Click to upload Document or Image'}
                  </p>
                  <p className="text-xs text-muted mt-2">Max size: 500 MB</p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading || categories.length === 0}>
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Uploading...
                  </>
                ) : 'Upload document'}
              </Button>
              {categories.length === 0 && !loading && (
                <p className="text-xs text-yellow-300">Create a category before uploading documents.</p>
              )}
            </form>
          </Card>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <select
              className="bg-black border border-border text-white px-3 py-1 rounded-lg text-sm focus:outline-none focus:border-primary"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <Card className="overflow-hidden border-none p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="px-6 py-4 font-semibold text-muted">Title</th>
                    <th className="px-6 py-4 font-semibold text-muted">Category</th>
                    <th className="px-6 py-4 font-semibold text-muted">Date</th>
                    <th className="px-6 py-4 font-semibold text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc._id} className="border-b border-border hover:bg-black transition-colors">
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handlePreview(doc)}
                          className="flex max-w-md items-center gap-3 text-left transition-colors hover:text-primary"
                        >
                          <FileText size={16} className="text-primary" />
                          <span className="truncate font-medium">{doc.title}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === doc._id ? (
                          <select
                            className="w-52 rounded-md border border-border bg-black px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                            value={editDoc.categoryId}
                            onChange={(e) => setEditDoc({ ...editDoc, categoryId: e.target.value })}
                          >
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {doc.categoryId?.name || 'Uncategorized'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted text-sm">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreview(doc)}
                            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                          {editingId === doc._id ? (
                            <>
                              <Input
                                className="h-9 w-48 text-sm"
                                value={editDoc.title}
                                onChange={(e) => setEditDoc({ ...editDoc, title: e.target.value })}
                                aria-label="Document title"
                              />
                              <button
                                type="button"
                                onClick={() => saveDocument(doc._id)}
                                className="rounded-md p-2 text-muted transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                                aria-label={`Save ${doc.title}`}
                              >
                                <Save size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId('')}
                                className="rounded-md p-2 text-muted transition-colors hover:text-white"
                                aria-label="Cancel edit"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(doc)}
                              className="rounded-md p-2 text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                              aria-label={`Edit ${doc.title}`}
                            >
                              <Edit3 size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc._id)}
                            className="rounded-md p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                            aria-label={`Delete ${doc.title}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted">
                        No documents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-border bg-black/90 p-4 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-md border border-border p-2 text-muted transition-colors hover:text-white"
                aria-label="Close preview"
              >
                <X size={22} />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold md:text-lg">{previewDocument.title}</h2>
                <p className="text-xs text-muted">{previewDocument.categoryId?.name || 'Uncategorized'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.max(60, value - 10))}
                  className="rounded p-2 text-muted transition-colors hover:text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="w-14 text-center text-xs font-bold">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((value) => Math.min(180, value + 10))}
                  className="rounded p-2 text-muted transition-colors hover:text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-neutral-950 p-4 md:p-6">
            <DocumentPreview fileUrl={previewDocument.fileUrl} title={previewDocument.title} zoom={zoom} />
          </div>
        </div>
      )}
    </div>
  );
}
