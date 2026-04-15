'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button, Card, Input } from '@/components/ui/components';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/errors';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const user = res.data.user;
      
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/policy-documents');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    setAutoLoading(true);
    setError('');
    try {
      window.location.href = '/api/auth/auto-login';
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Auto-login failed.'));
      setAutoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src="/uploads/onepws-logo.png" alt="OnePWS Logo" className="h-20 w-auto object-contain" />
        </div>
        
        <Card className="shadow-2xl border-primary/10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted text-sm">Log in to access your policy documents</p>
          </div>

          {message === 'pending' && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3 text-yellow-500 text-sm">
              <AlertCircle size={18} />
              <span>Your account is under review by admin.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Logging in...
                </>
              ) : 'Sign In'}
            </Button>

            <Button type="button" onClick={handleAutoLogin} className="w-full py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50" disabled={autoLoading}>
              {autoLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Auto Login...
                </>
              ) : 'Quick Admin Login'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
