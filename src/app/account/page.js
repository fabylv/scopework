'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppShell from '@/components/AppShell';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-xl">
        <h1 className="text-2xl font-bold text-[#171C24] mb-1">Account</h1>
        <p className="text-sm text-[#6E737B] mb-6">Your profile and settings.</p>

        {user && (
          <div className="bg-white rounded-xl border border-[#E1E2E4] p-6 mb-4" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-4">Profile</p>
            <div className="space-y-3">
              {user.user_metadata?.full_name && (
                <div>
                  <p className="text-xs text-[#9AA0A8] mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-[#171C24]">{user.user_metadata.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#9AA0A8] mb-0.5">Email</p>
                <p className="text-sm font-semibold text-[#171C24]">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E1E2E4] p-6 mb-4" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-4">Coming Soon</p>
          <div className="space-y-2 text-sm text-[#6E737B]">
            <p>· Change password</p>
            <p>· Notification preferences</p>
            <p>· Default AI model</p>
            <p>· Billing & subscription</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
