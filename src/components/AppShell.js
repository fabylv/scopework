'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { href: '/contractors', label: 'Contractors', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { href: '/account', label: 'Account', icon: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
  )},
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-[200px] shrink-0 bg-[#151C24] min-h-screen sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFA12B] flex items-center justify-center shrink-0">
              <span className="text-sm">🏗️</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">ScopeWork</p>
              <p className="text-[#5A6270] text-[10px] font-bold uppercase tracking-widest mt-0.5">Estimator</p>
            </div>
          </div>
        </div>

        {/* New Project */}
        <div className="px-4 mb-5">
          <Link
            href="/project/new"
            className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#FFA12B] py-2 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors"
          >
            <span className="text-base leading-none">+</span> New Project
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#222B36] text-white'
                    : 'text-[#6A7280] hover:text-[#C5CAD4] hover:bg-[#1C242E]'
                }`}
              >
                <span className={active ? 'text-[#FFA12B]' : 'text-current'}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 pb-5 pt-3 border-t border-[#222B36]">
          {user && (
            <p className="text-[11px] text-[#5A6270] px-3 pb-2 truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-[#5A6270] hover:text-[#8A909A] px-3 py-2 transition-colors w-full"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-[#151C24] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFA12B] flex items-center justify-center text-xs">🏗️</div>
          <p className="text-white font-bold text-sm">ScopeWork</p>
        </div>
        <Link
          href="/project/new"
          className="rounded-lg bg-[#FFA12B] px-3 py-1.5 text-xs font-bold text-[#171C24]"
        >
          + New
        </Link>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#151C24] border-t border-[#222B36] flex">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                active ? 'text-[#FFA12B]' : 'text-[#5A6270] hover:text-[#9AA0A8]'
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14 md:pb-0 pb-16 min-w-0">
        {children}
      </main>
    </div>
  );
}
