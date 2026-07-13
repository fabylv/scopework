'use client';

import AppShell from '@/components/AppShell';

export default function ContractorsPage() {
  return (
    <AppShell>
      <div className="px-6 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-[#171C24] mb-1">Contractors</h1>
        <p className="text-sm text-[#6E737B] mb-8">Manage your contractor profiles and labor rates.</p>

        <div className="bg-white rounded-xl border border-dashed border-[#E1E2E4] p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="text-lg font-bold text-[#171C24]">Coming soon</h2>
          <p className="text-sm text-[#6E737B] mt-2 max-w-xs mx-auto leading-relaxed">
            Add your contractor profiles with custom labor rates so ScopeWork can generate accurate estimates for your market.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
