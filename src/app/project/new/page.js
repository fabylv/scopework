'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createProject } from '@/lib/projects';

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
    <div className="min-h-screen bg-stone-50">
      {/* Dark header */}
      <header className="bg-slate-900 px-5 pt-12 pb-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            ← Back
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
              📍
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">New Inspection</p>
              <h1 className="text-2xl font-black text-white leading-tight">Set up your project</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <label htmlFor="address" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Property Address
            </label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Tampa, FL"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              required
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Notes <span className="text-slate-300 normal-case tracking-normal font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 3BR/2BA rental, built 1978, vacant"
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
            />
          </div>

          {/* Model selector */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">AI Model</p>
            <div className="grid grid-cols-3 gap-2">
              {MODEL_OPTIONS.map((opt) => {
                const active = model === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setModel(opt.id)}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      active
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 bg-stone-50 hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-sm font-bold ${active ? 'text-amber-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${active ? 'text-amber-500' : 'text-slate-400'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-amber-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            {saving ? 'Starting...' : 'Start Inspection →'}
          </button>
        </form>
      </main>
    </div>
  );
}
