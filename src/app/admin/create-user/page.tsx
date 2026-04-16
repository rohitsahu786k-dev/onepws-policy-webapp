'use client';

import { useState } from 'react';
import axios from 'axios';
import { Card, Button, Input } from '@/components/ui/components';
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

export default function CreateUserPage() {
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' as 'user' | 'admin', status: 'approved' as 'pending' | 'approved' | 'rejected' | 'blocked' });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;

    try {
      setCreating(true);
      setError('');
      setSuccess('');
      await axios.post('/api/admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'user', status: 'approved' });
      setSuccess('User created successfully and email notification sent.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to create user'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
        <p className="mt-2 text-sm text-muted">Manually create a new user account with specific access and roles.</p>
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

      <Card>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
          <Plus size={20} className="text-primary" />
          User Details
        </h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Full name</label>
            <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Email</label>
            <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Temporary password</label>
            <Input type="text" minLength={8} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Role</label>
            <select
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-white transition-colors focus:border-primary focus:outline-none"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
            >
              <option value="user">Regular User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Initial access</label>
            <select
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-white transition-colors focus:border-primary focus:outline-none"
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'pending' | 'approved' | 'rejected' | 'blocked' })}
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={creating}>
            {creating ? <><Loader2 className="mr-2 animate-spin" size={18} /> Creating...</> : 'Create user'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
