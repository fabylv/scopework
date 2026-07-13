'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  async function handleGitHub() {
    setGithubLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (err) {
      setError(err.message);
      setGithubLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-[#E1E2E4] p-8 text-center" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.08)' }}>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#171C24]">Check your email</h2>
          <p className="text-sm text-[#6E737B] mt-2 leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#FFA12B] py-3 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    );
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
        <h1 className="text-xl font-bold text-[#171C24] mb-1">Create your account</h1>
        <p className="text-sm text-[#6E737B] mb-6">Start scoping properties in minutes</p>

        {/* GitHub */}
        <button
          type="button"
          onClick={handleGitHub}
          disabled={githubLoading}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-[#E1E2E4] bg-white py-2.5 text-sm font-semibold text-[#171C24] hover:bg-[#FAF9F6] transition-colors disabled:opacity-50 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#171C24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          {githubLoading ? 'Redirecting...' : 'Continue with GitHub'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#F0F1F3]" />
          <p className="text-xs text-[#9AA0A8] font-medium">or</p>
          <div className="flex-1 h-px bg-[#F0F1F3]" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Faby Vanyo"
              required
              className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] placeholder:text-[#B0B6BE] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
            />
          </div>

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
            <label className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-xs text-center text-[#9AA0A8]">
            By creating an account you agree to our{' '}
            <span className="text-[#6E737B] underline cursor-pointer">Terms</span> and{' '}
            <span className="text-[#6E737B] underline cursor-pointer">Privacy Policy</span>
          </p>
        </form>
      </div>

      <p className="text-center text-sm text-[#6E737B] mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-[#FFA12B] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
