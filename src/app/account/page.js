'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getProjects } from '@/lib/db';
import AppShell from '@/components/AppShell';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user;
      if (!u) return;
      setUser(u);
      const meta = u.user_metadata || {};
      const fullName = meta.full_name || '';
      const parts = fullName.split(' ');
      setFirstName(meta.first_name || parts[0] || '');
      setLastName(meta.last_name || parts.slice(1).join(' ') || '');
      setEmail(u.email || '');
      setCompany(meta.company || '');
    });
    getProjects().then((list) => setProjectCount(list.length)).catch(() => {});
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        company,
      },
    });
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#171C24] mb-1">Account</h1>
        <p className="text-sm text-[#6E737B] mb-6">Manage your profile and subscription.</p>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Profile form — left (spans 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E1E2E4] p-6" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <p className="font-bold text-[#171C24] mb-0.5">Profile</p>
            <p className="text-sm text-[#6E737B] mb-5">Used on shared estimate reports.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6E737B] mb-1.5">First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6E737B] mb-1.5">Last name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Investor"
                    className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6E737B] mb-1.5">Email</label>
                <input
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-[#E1E2E4] bg-[#F0EFEC] px-4 py-2.5 text-sm text-[#9AA0A8] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6E737B] mb-1.5">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Investco Property Group"
                  className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#151C24] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#252B35] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {saved && <p className="text-sm text-green-600 font-medium">✓ Saved</p>}
              </div>
            </form>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Saved projects */}
            <div className="bg-white rounded-xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA0A8] mb-2">Saved Projects</p>
              <p className="text-5xl font-black text-[#171C24]">{projectCount}</p>
              <p className="text-sm text-[#9AA0A8] mt-1">across active portfolios</p>
            </div>

            {/* Current plan */}
            <div className="bg-[#1E2530] rounded-xl p-5 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#FFA12B]/10" />
              <div className="absolute -right-1 top-6 w-10 h-10 rounded-full bg-[#FFA12B]/10" />

              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270] mb-2 relative">Current Plan</p>
              <p className="text-xl font-black text-white relative">Starter</p>
              <p className="text-xs text-[#5A6270] mt-1 mb-4 relative">Unlimited photos · 3 AI models</p>

              <div className="space-y-1.5 mb-5 relative">
                {['Photo analysis', 'Trade-grouped estimates', 'Repair reports'].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#FFA12B" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
                    <p className="text-xs text-[#8A909A]">{f}</p>
                  </div>
                ))}
              </div>

              <button className="w-full rounded-lg bg-[#2A323C] py-2.5 text-xs font-bold text-[#C5CAD4] hover:bg-[#333D49] transition-colors relative">
                Manage subscription
              </button>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full rounded-xl border border-red-200 bg-white py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
