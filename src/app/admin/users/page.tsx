'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Card, Input } from '@/components/ui/components';
import { AlertCircle, Ban, CheckCircle, Clock, KeyRound, Loader2, Plus, Trash2, User as UserIcon, UserCheck, UserX } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

type UserStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

const statusConfig = {
  pending: { icon: Clock, className: 'text-yellow-400', label: 'Pending' },
  approved: { icon: UserCheck, className: 'text-emerald-400', label: 'Approved' },
  rejected: { icon: UserX, className: 'text-red-400', label: 'Rejected' },
  blocked: { icon: Ban, className: 'text-orange-400', label: 'Blocked' },
};

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', status: 'approved' as UserStatus, role: 'user' as 'admin' | 'user' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [resettingId, setResettingId] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = useMemo(() => {
    return users.reduce(
      (acc, user) => ({ ...acc, [user.status]: acc[user.status] + 1 }),
      { pending: 0, approved: 0, rejected: 0, blocked: 0 } as Record<UserStatus, number>
    );
  }, [users]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/admin/users', newUser);
      setUsers((prev) => [res.data, ...prev]);
      setNewUser({ name: '', email: '', password: '', status: 'approved', role: 'user' });
      setSuccess('User created and email notification sent.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to create user'));
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      setUpdatingId(userId);
      setError('');
      setSuccess('');
      const res = await axios.patch('/api/admin/users', { userId, status });
      setUsers(users.map((user) => (user._id === userId ? res.data : user)));
      setSuccess(`User marked as ${status}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to update user status'));
    } finally {
      setUpdatingId('');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Remove this user permanently?')) return;

    try {
      setUpdatingId(userId);
      setError('');
      setSuccess('');
      await axios.delete('/api/admin/users', { data: { userId } });
      setUsers(users.filter((user) => user._id !== userId));
      setSuccess('User removed and email notification sent.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to remove user'));
    } finally {
      setUpdatingId('');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const password = passwordDrafts[userId] || '';
    if (password.length < 8) {
      setError('Temporary password must be at least 8 characters.');
      return;
    }

    try {
      setResettingId(userId);
      setError('');
      setSuccess('');
      await axios.patch('/api/admin/users', {
        userId,
        action: 'reset-password',
        password,
      });
      setPasswordDrafts((prev) => ({ ...prev, [userId]: '' }));
      setSuccess('Password reset successfully and email notification sent.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to reset password'));
    } finally {
      setResettingId('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User management</h1>
        <p className="mt-2 text-sm text-muted">Create users, approve access, block accounts, and remove inactive users.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.keys(statusConfig) as UserStatus[]).map((status) => {
          const Icon = statusConfig[status].icon;
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">{statusConfig[status].label}</span>
                <Icon className={statusConfig[status].className} size={18} />
              </div>
              <p className="mt-3 text-3xl font-bold">{counts[status]}</p>
            </Card>
          );
        })}
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

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <Card>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <Plus size={20} className="text-primary" />
            Create user
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
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value as UserStatus })}
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

        <Card className="overflow-hidden border-none p-0 xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-6 py-4 font-semibold text-muted">User</th>
                  <th className="px-6 py-4 font-semibold text-muted">Email</th>
                  <th className="px-6 py-4 font-semibold text-muted">Status</th>
                  <th className="px-6 py-4 text-right font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const config = statusConfig[user.status];
                  const StatusIcon = config.icon;

                  return (
                    <tr key={user._id} className="border-b border-border transition-colors hover:bg-black">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <span className="font-medium">{user.name}</span>
                            <p className="text-xs text-muted">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{user.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={config.className} size={16} />
                          <span className={config.className}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {user.status !== 'approved' && <Button className="px-3 py-1 text-xs" disabled={updatingId === user._id} onClick={() => handleStatusChange(user._id, 'approved')}>Approve</Button>}
                            {user.status !== 'pending' && <Button variant="outline" className="px-3 py-1 text-xs" disabled={updatingId === user._id} onClick={() => handleStatusChange(user._id, 'pending')}>Pending</Button>}
                            {user.status !== 'blocked' && <Button variant="outline" className="px-3 py-1 text-xs text-orange-400 hover:text-orange-400" disabled={updatingId === user._id} onClick={() => handleStatusChange(user._id, 'blocked')}>Block</Button>}
                            {user.status !== 'rejected' && <Button variant="outline" className="px-3 py-1 text-xs text-red-400 hover:text-red-400" disabled={updatingId === user._id} onClick={() => handleStatusChange(user._id, 'rejected')}>Reject</Button>}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={updatingId === user._id}
                              className="rounded-md p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                              aria-label={`Remove ${user.name}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="text"
                              minLength={8}
                              placeholder="New temp password"
                              value={passwordDrafts[user._id] || ''}
                              onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [user._id]: e.target.value }))}
                              className="h-9 w-44 text-xs"
                              aria-label={`New temporary password for ${user.name}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="px-3 py-2 text-xs"
                              disabled={resettingId === user._id}
                              onClick={() => handleResetPassword(user._id)}
                            >
                              {resettingId === user._id ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                              Reset
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">No users found</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted">
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
  );
}
