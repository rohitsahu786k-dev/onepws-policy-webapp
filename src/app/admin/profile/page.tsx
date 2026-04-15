'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button, Card, Input } from '@/components/ui/components';
import { AlertCircle, ArrowLeft, Camera, CheckCircle, Loader2, Lock, Mail, Phone, Shield, User, Workflow } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  profileImageUrl: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  createdAt: string;
  updatedAt: string;
};

export default function ProfileManagement() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', department: '', designation: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          department: res.data.department || '',
          designation: res.data.designation || '',
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Unable to load profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = useMemo(() => {
    const source = form.name || profile?.email || 'A';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [form.name, profile?.email]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.patch('/api/auth/me', form);
      setProfile(res.data);
      setMessage('Profile updated successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      setChangingPassword(false);
      return;
    }

    try {
      await axios.put('/api/auth/me', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to update password'));
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadProfilePhoto = async (file: File | null) => {
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setMessage('Profile photo updated successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to upload profile photo'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary/50 hover:text-primary"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-primary text-2xl font-bold text-white">
              {profile?.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">{initials}</div>
              )}
              <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-black/75 py-1 text-[11px] font-medium text-white">
                {uploadingPhoto ? <Loader2 className="animate-spin" size={12} /> : <Camera size={12} />}
                Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => uploadProfilePhoto(e.target.files?.[0] || null)}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile management</h1>
              <p className="mt-1 text-sm text-muted">Maintain your admin identity and account security.</p>
            </div>
          </div>
          {profile && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-black px-4 py-3">
                <p className="text-muted">Role</p>
                <p className="mt-1 capitalize text-white">{profile.role}</p>
              </div>
              <div className="rounded-lg border border-border bg-black px-4 py-3">
                <p className="text-muted">Status</p>
                <p className="mt-1 capitalize text-emerald-400">{profile.status}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {message && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle size={18} />
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-xl font-bold">Account details</h2>
          <p className="mt-1 text-sm text-muted">These details identify you across the admin dashboard.</p>

          <form onSubmit={saveProfile} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10 opacity-75" value={profile?.email || ''} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Department</label>
              <div className="relative">
                <Workflow className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Compliance" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted">Designation</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Policy Administrator" />
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 animate-spin" size={18} /> Saving...</> : 'Save profile'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Password</h2>
          <p className="mt-1 text-sm text-muted">Use at least 8 characters for the new password.</p>

          <form onSubmit={changePassword} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Current password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} minLength={8} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input className="pl-10" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} minLength={8} required />
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={changingPassword}>
              {changingPassword ? <><Loader2 className="mr-2 animate-spin" size={18} /> Updating...</> : 'Update password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
