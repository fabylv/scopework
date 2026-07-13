'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function Step({ number, icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#151C24] flex items-center justify-center text-[#FFA12B] font-black text-sm">
        {number}
      </div>
      <div>
        <p className="font-bold text-[#171C24] text-base">{icon} {title}</p>
        <p className="text-sm text-[#6E737B] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
      <div className="w-10 h-10 rounded-xl bg-[#FFF3DE] flex items-center justify-center text-xl mb-4">{icon}</div>
      <p className="font-bold text-[#171C24] mb-1">{title}</p>
      <p className="text-sm text-[#6E737B] leading-relaxed">{desc}</p>
    </div>
  );
}

function MockRepairCard({ severity, type, trade, cost }) {
  const colors = {
    major:    'border-l-red-500 bg-red-50/30',
    moderate: 'border-l-orange-400 bg-orange-50/30',
    minor:    'border-l-yellow-400 bg-yellow-50/20',
  };
  const badges = {
    major:    'bg-red-100 text-red-700',
    moderate: 'bg-orange-100 text-orange-700',
    minor:    'bg-yellow-100 text-yellow-700',
  };
  const tradeColors = {
    ROOFING: 'bg-slate-100 text-slate-600',
    PLUMBING: 'bg-blue-50 text-blue-700',
    COSMETIC: 'bg-pink-50 text-pink-700',
    ELECTRICAL: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <div className={`border-l-4 border border-[#E1E2E4] rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 ${colors[severity]}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${tradeColors[trade] || 'bg-gray-100 text-gray-600'}`}>{trade}</span>
        <p className="text-xs font-semibold text-[#171C24] truncate">{type}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${badges[severity]}`}>{severity}</span>
        <p className="text-xs font-bold text-[#171C24]">{cost}</p>
      </div>
    </div>
  );
}

function UserAvatar({ user }) {
  const avatar = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email || '?';
  const initial = name.charAt(0).toUpperCase();

  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover border-2 border-[#FFA12B]"
        unoptimized
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#FFA12B] flex items-center justify-center text-sm font-bold text-[#171C24]">
      {initial}
    </div>
  );
}

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Nav */}
      <nav className="border-b border-[#E8E6E1] bg-[#FAF9F6]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FFA12B] flex items-center justify-center text-sm">🏗️</div>
            <p className="font-bold text-[#171C24] text-sm">ScopeWork</p>
          </div>
          <div className="flex items-center gap-3">
            {!loaded ? null : user ? (
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <UserAvatar user={user} />
                <span className="text-sm font-semibold text-[#171C24] hidden sm:inline group-hover:text-[#FFA12B] transition-colors">
                  Dashboard →
                </span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-[#6E737B] hover:text-[#171C24] px-3 py-1.5 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold text-[#171C24] bg-[#FFA12B] px-4 py-1.5 rounded-lg hover:bg-[#F28E1C] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-10 sm:pt-16 pb-14 sm:pb-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3DE] border border-[#FFA12B]/20 px-3 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFA12B]" />
            <p className="text-xs font-bold text-[#8A6400]">Powered by GPT-4o · Claude · Gemini</p>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-[#171C24] leading-tight tracking-tight mb-5">
            Turn property photos into repair estimates{' '}
            <span className="relative inline-block">
              <span className="relative z-10">in minutes.</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-[#FFA12B]/25 -z-0 rounded" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6E737B] leading-relaxed mb-8 max-w-md">
            Walk a property, snap photos, and let AI identify every repair — grouped by trade with cost estimates. No clipboard. No guesswork.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FFA12B] px-6 py-3.5 text-base font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors"
              style={{ boxShadow: '0 8px 24px rgba(255,161,43,0.3)' }}
            >
              Start for free →
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#E1E2E4] bg-white px-6 py-3.5 text-base font-semibold text-[#4A5260] hover:bg-[#F5F4F1] transition-colors"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-[#9AA0A8]">No credit card required · First 3 estimates free</p>
        </div>

        {/* Right — App mockup */}
        <div className="hidden lg:block bg-white rounded-2xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 18px 48px rgba(15,23,42,0.12)' }}>
          {/* Mock header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA0A8]">Live Estimate</p>
              <p className="font-bold text-[#171C24] text-sm mt-0.5">1428 Elm St, Tampa FL</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3DE] px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFA12B]" />
              <p className="text-[10px] font-bold text-[#8A6400]">Analyzing 4 photos</p>
            </div>
          </div>

          {/* Mock photo grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              'from-slate-500 to-slate-700',
              'from-stone-400 to-stone-600',
              'from-zinc-500 to-zinc-700',
              'from-neutral-400 to-neutral-600',
            ].map((g, i) => (
              <div key={i} className={`h-24 rounded-lg bg-gradient-to-br ${g} flex items-center justify-center text-white/30`}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              </div>
            ))}
          </div>

          {/* Mock repairs */}
          <div className="space-y-2 mb-4">
            <MockRepairCard severity="major"    type="Roof membrane failure"    trade="ROOFING"    cost="$3,200–$5,800" />
            <MockRepairCard severity="moderate" type="Leak under kitchen sink"  trade="PLUMBING"   cost="$400–$900" />
            <MockRepairCard severity="moderate" type="Damaged drywall — hallway" trade="COSMETIC"  cost="$300–$700" />
            <MockRepairCard severity="minor"    type="Outlet cover missing"     trade="ELECTRICAL" cost="$50–$150" />
          </div>

          {/* Mock total */}
          <div className="border-t border-[#F0F1F3] pt-3 flex items-center justify-between">
            <p className="text-xs text-[#9AA0A8] font-semibold uppercase tracking-wide">Estimated total</p>
            <p className="text-base font-black text-[#171C24]">$3,950 – $7,550</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#E8E6E1] py-16">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9AA0A8] text-center mb-2">How it works</p>
          <h2 className="text-2xl font-black text-[#171C24] text-center mb-10">Three steps to a full scope of work</h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <Step number="1" icon="📷" title="Snap photos"
              desc="Walk the property and capture repairs room by room — on your phone, in real time." />
            <Step number="2" icon="🤖" title="AI analyzes"
              desc="GPT-4o, Claude, or Gemini identifies every repair, grouped by trade with severity ratings." />
            <Step number="3" icon="📋" title="Get your scope"
              desc="Instant repair list with estimated costs per trade. Export or share with your team." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9AA0A8] text-center mb-2">Features</p>
        <h2 className="text-2xl font-black text-[#171C24] text-center mb-10">Built for real estate pros</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard icon="🧠" title="Multi-model AI"
            desc="Choose GPT-4o, Claude, or Gemini — or compare all three on the same property." />
          <FeatureCard icon="🔧" title="Trade-grouped repairs"
            desc="Roofing, plumbing, electrical, HVAC — repairs organized the way contractors think." />
          <FeatureCard icon="💰" title="Instant estimates"
            desc="Cost ranges per repair based on severity, with contractor and materials breakdowns coming soon." />
          <FeatureCard icon="📱" title="Mobile-first"
            desc="Designed for fieldwork. Take photos directly from your camera, no uploads needed." />
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="bg-[#151C24] rounded-2xl px-6 sm:px-8 py-10 sm:py-12 text-center" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.15)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FFA12B] mb-3">Get started today</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Ready to scope your first property?</h2>
          <p className="text-[#6A7280] mb-8 max-w-md mx-auto">
            Join investors and contractors who use ScopeWork to stop guessing and start knowing.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFA12B] px-8 py-4 text-base font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors"
            style={{ boxShadow: '0 8px 24px rgba(255,161,43,0.3)' }}
          >
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E6E1] py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9AA0A8]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#FFA12B] flex items-center justify-center text-[10px]">🏗️</div>
            <p className="font-bold text-[#6E737B]">ScopeWork</p>
          </div>
          <p>© {new Date().getFullYear()} ScopeWork. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#6E737B] cursor-pointer">Privacy</span>
            <span className="hover:text-[#6E737B] cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
