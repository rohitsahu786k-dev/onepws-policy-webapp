'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui/components';
import { AlertCircle, ChevronRight, FileText, Loader2, LogOut, Search, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

const PdfThumbnail = dynamic(() => import('@/components/app/PdfThumbnail'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-neutral-900"><Loader2 className="animate-spin text-primary" size={24} /></div>,
});

const DocumentPreview = dynamic(() => import('@/components/app/DocumentPreview'), {
  ssr: false,
  loading: () => <div className="flex min-h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>,
});

interface Category {
  _id: string;
  name: string;
}

interface PolicyDocument {
  _id: string;
  title: string;
  fileUrl: string;
  categoryId: string | Category;
}

type Profile = {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  profileImageUrl: string;
  status: string;
};

export default function PolicyDocumentsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null);
  const [zoom, setZoom] = useState(100);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [catsRes, docsRes, profileRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/documents'),
          axios.get('/api/auth/me'),
        ]);
        setCategories(catsRes.data);
        setDocuments(docsRes.data);
        setProfile(profileRes.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const categoryId = typeof doc.categoryId === 'string' ? doc.categoryId : doc.categoryId._id;
      const categoryName = typeof doc.categoryId === 'string' ? '' : doc.categoryId.name;
      const matchesCategory = activeTab === 'all' || categoryId === activeTab;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || doc.title.toLowerCase().includes(query) || categoryName.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, documents, searchTerm]);

  const initials = (profile?.name || profile?.email || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-30 border-b border-border bg-black/85 px-5 py-4 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-16 w-auto md:h-20 object-contain" />

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="search"
                placeholder="Search by document or category..."
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/profile">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/50"
              >
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.name} className="h-7 w-7 rounded-md object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold">{initials}</span>
                )}
                <span className="hidden md:inline">Profile</span>
              </button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border bg-card p-2 text-muted transition-colors hover:text-primary"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-8 p-5 md:p-10">
        <section className="rounded-lg border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Data Hub</h1>
              <p className="mt-2 text-sm text-muted">Access approved policies and disclosure documents inside the secure dashboard.</p>
            </div>
            <div className="relative sm:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="search"
                placeholder="Search documents..."
                className="w-full rounded-lg border border-border bg-black py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap rounded-lg border px-5 py-2 text-sm font-medium transition-all ${
              activeTab === 'all' ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted hover:border-primary/50'
            }`}
          >
            All Documents
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setActiveTab(cat._id)}
              className={`whitespace-nowrap rounded-lg border px-5 py-2 text-sm font-medium transition-all ${
                activeTab === cat._id ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted hover:border-primary/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted">Loading documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocs.map((doc) => {
              const extension = getExtension(doc.fileUrl);
              const categoryName = typeof doc.categoryId === 'string' ? 'Policy' : doc.categoryId.name;
              return (
                <Card
                  key={doc._id}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden p-0 transition-all hover:border-primary/50"
                  onClick={() => {
                    setZoom(100);
                    setSelectedDocument(doc);
                  }}
                >
                  <div className="relative aspect-[3/4] bg-neutral-900">
                    {extension === 'pdf' ? (
                      <PdfThumbnail fileUrl={doc.fileUrl} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
                        <FileText size={54} className="text-primary" />
                        <span className="rounded-md border border-border px-3 py-1 text-xs font-bold uppercase">{extension || 'doc'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 to-transparent p-5 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-2 text-sm font-bold text-white">
                        View inside dashboard <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto space-y-1 bg-card p-5">
                    <h3 className="line-clamp-2 font-bold transition-colors group-hover:text-primary">{doc.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">{categoryName}</p>
                  </div>
                </Card>
              );
            })}
            {filteredDocs.length === 0 && (
              <div className="col-span-full rounded-lg border-2 border-dashed border-border py-20 text-center">
                <FileText className="mx-auto mb-4 text-muted" size={48} />
                <p className="text-muted">No documents match your search.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-border bg-black/90 p-4 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="rounded-md border border-border p-2 text-muted transition-colors hover:text-white"
                aria-label="Close viewer"
              >
                <X size={22} />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold md:text-lg">{selectedDocument.title}</h2>
                <p className="text-xs text-muted">{typeof selectedDocument.categoryId === 'string' ? 'Policy' : selectedDocument.categoryId.name}</p>
              </div>
            </div>
            <div className="flex items-center rounded-md border border-border bg-card p-1">
              <button type="button" onClick={() => setZoom((value) => Math.max(60, value - 10))} className="rounded p-2 text-muted hover:text-white" aria-label="Zoom out">
                <ZoomOut size={18} />
              </button>
              <span className="w-14 text-center text-xs font-bold">{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(180, value + 10))} className="rounded p-2 text-muted hover:text-white" aria-label="Zoom in">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-neutral-950 p-4 md:p-6" onContextMenu={(e) => e.preventDefault()}>
            <DocumentPreview fileUrl={selectedDocument.fileUrl} title={selectedDocument.title} zoom={zoom} />
          </div>
        </div>
      )}
    </div>
  );
}

function getExtension(fileUrl: string) {
  return fileUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
}
