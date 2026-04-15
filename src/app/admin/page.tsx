'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button, Card } from '@/components/ui/components';
import { AlertCircle, CheckCircle, Clock, FileText, FolderTree, Loader2, ShieldCheck, Users } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

type User = { _id: string; status: 'pending' | 'approved' | 'rejected' | 'blocked'; createdAt: string };
type Category = { _id: string; name: string };
type PolicyDocument = { _id: string; title: string; createdAt: string };

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        const [usersRes, categoriesRes, documentsRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/categories'),
          axios.get('/api/documents'),
        ]);

        setUsers(usersRes.data);
        setCategories(categoriesRes.data);
        setDocuments(documentsRes.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to load dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const approved = users.filter((user) => user.status === 'approved').length;
    const pending = users.filter((user) => user.status === 'pending').length;
    const rejected = users.filter((user) => user.status === 'rejected').length;
    const blocked = users.filter((user) => user.status === 'blocked').length;

    return { approved, pending, rejected, blocked };
  }, [users]);

  const cards = [
    { label: 'Users', value: users.length, helper: `${stats.pending} pending approval`, icon: Users, color: 'text-sky-400' },
    { label: 'Pending', value: stats.pending, helper: 'Waiting for review', icon: Clock, color: 'text-yellow-400' },
    { label: 'Categories', value: categories.length, helper: 'Policy groups available', icon: FolderTree, color: 'text-emerald-400' },
    { label: 'Documents', value: documents.length, helper: 'Published files', icon: FileText, color: 'text-primary' },
  ];

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
            <ShieldCheck size={14} />
            Admin dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Policy operations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review account access, organize policy categories, and keep document uploads current.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users">
            <Button variant="outline">Review users</Button>
          </Link>
          <Link href="/admin/documents">
            <Button>Upload document</Button>
          </Link>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="min-h-36">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight">{loading ? '-' : card.value}</p>
                </div>
                <div className="rounded-lg border border-border bg-black p-3">
                  <Icon size={22} className={card.color} />
                </div>
              </div>
              <p className="mt-5 text-sm text-muted">{card.helper}</p>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent documents</h2>
              <p className="text-sm text-muted">Latest policy files added to the portal.</p>
            </div>
            {loading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-black p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="shrink-0 text-primary" size={18} />
                  <span className="truncate font-medium">{doc.title}</span>
                </div>
                <span className="shrink-0 text-xs text-muted">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {!loading && recentDocuments.length === 0 && (
              <p className="rounded-lg border border-border bg-black p-6 text-center text-sm text-muted">No documents uploaded yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Access health</h2>
          <p className="mt-1 text-sm text-muted">Current user approval split.</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-black p-4">
              <span className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-emerald-400" /> Approved</span>
              <strong>{loading ? '-' : stats.approved}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-black p-4">
              <span className="flex items-center gap-2 text-sm"><Clock size={16} className="text-yellow-400" /> Pending</span>
              <strong>{loading ? '-' : stats.pending}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-black p-4">
              <span className="flex items-center gap-2 text-sm"><AlertCircle size={16} className="text-red-400" /> Rejected</span>
              <strong>{loading ? '-' : stats.rejected}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-black p-4">
              <span className="flex items-center gap-2 text-sm"><AlertCircle size={16} className="text-orange-400" /> Blocked</span>
              <strong>{loading ? '-' : stats.blocked}</strong>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
