'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#151C24] flex items-center justify-center">
          <div className="w-6 h-6 rounded-lg bg-[#FFA12B] flex items-center justify-center text-sm">🏗️</div>
        </div>
        <div>
          <p className="font-bold text-[#171C24] text-base leading-none">ScopeWork</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA0A8] mt-0.5">Estimator</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-2xl border border-[#E1E2E4] p-8"
        style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.08)' }}
      >
        <h1 className="text-xl font-bold text-[#171C24] mb-1">Welcome back</h1>
        <p className="text-sm text-[#6E737B] mb-6">Sign in to your account</p>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-[#E1E2E4] bg-white py-2.5 text-sm font-semibold text-[#171C24] hover:bg-[#FAF9F6] transition-colors disabled:opacity-50 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#F0F1F3]" />
          <p className="text-xs text-[#9AA0A8] font-medium">or</p>
          <div className="flex-1 h-px bg-[#F0F1F3]" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] placeholder:text-[#B0B6BE] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8]">
                Password
              </label>
              <button type="button" className="text-xs text-[#FFA12B] hover:underline font-medium">
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] placeholder:text-[#B0B6BE] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#FFA12B] py-3 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors disabled:opacity-50"
            style={{ boxShadow: '0 4px 16px rgba(255,161,43,0.25)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6E737B] mt-5">
        Don't have an account?{' '}
        <Link href="/register" className="text-[#FFA12B] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
