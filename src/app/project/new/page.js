'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createProject } from '@/lib/projects';
import AppShell from '@/components/AppShell';

const MODEL_OPTIONS = [
  { id: 'openai', label: 'GPT-4o', desc: 'Fast & precise' },
  { id: 'anthropic', label: 'Claude', desc: 'Detailed analysis' },
  { id: 'google', label: 'Gemini', desc: 'Great for photos' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [model, setModel] = useState('openai');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!address.trim()) { setError('Property address is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const project = createProject({ address: address.trim(), notes: notes.trim(), model });
      router.push(`/project/${project.id}`);
    } catch (err) {
      setError(err?.message || 'Unable to create project.');
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-xl">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#6E737B] hover:text-[#171C24] mb-6 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          All Projects
        </Link>

        <h1 className="text-2xl font-bold text-[#171C24] mb-1">New Inspection</h1>
        <p className="text-sm text-[#6E737B] mb-6">Set up a property to start capturing repair photos.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address */}
          <div className="bg-white rounded-xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <label htmlFor="address" className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-3">
              Property Address
            </label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Tampa, FL"
              className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] font-medium placeholder:text-[#B0B6BE] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition"
              required
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-3">
              Notes <span className="text-[#C5CAD4] normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 3BR/2BA rental, built 1978, vacant"
              rows={3}
              className="w-full rounded-lg border border-[#E1E2E4] bg-[#FAF9F6] px-4 py-2.5 text-sm text-[#171C24] placeholder:text-[#B0B6BE] outline-none focus:border-[#FFA12B] focus:ring-2 focus:ring-[#FFA12B]/20 transition resize-none"
            />
          </div>

          {/* Model selector */}
          <div className="bg-white rounded-xl border border-[#E1E2E4] p-5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9AA0A8] mb-3">AI Model</p>
            <div className="grid grid-cols-3 gap-2">
              {MODEL_OPTIONS.map((opt) => {
                const active = model === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModel(opt.id)}
                    className={`rounded-lg border-2 p-3 text-left transition ${
                      active
                        ? 'border-[#FFA12B] bg-[#FFF3DE]'
                        : 'border-[#E1E2E4] bg-[#FAF9F6] hover:border-[#C5CAD4]'
                    }`}
                  >
                    <p className={`text-sm font-bold ${active ? 'text-[#171C24]' : 'text-[#4A5260]'}`}>{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${active ? 'text-[#8A6400]' : 'text-[#9AA0A8]'}`}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#FFA12B] py-3 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ boxShadow: '0 4px 16px rgba(255,161,43,0.25)' }}
          >
            {saving ? 'Creating...' : 'Start Inspection →'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
