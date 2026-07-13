'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProjects } from '@/lib/projects';

const SEVERITY_ORDER = ['major', 'moderate', 'minor'];

const SEVERITY_DOT = {
  major: 'bg-red-500',
  moderate: 'bg-orange-400',
  minor: 'bg-yellow-400',
};

function formatDate(value) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function countBySeverity(repairs = []) {
  return repairs.reduce(
    (acc, r) => { const s = r?.severity || 'minor'; if (acc[s] !== undefined) acc[s]++; return acc; },
    { major: 0, moderate: 0, minor: 0 }
  );
}

function SeverityBar({ repairs = [] }) {
  const total = repairs.length;
  if (total === 0) return null;
  const counts = countBySeverity(repairs);
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-stone-100 mt-3">
      {SEVERITY_ORDER.map((s) => {
        const pct = (counts[s] / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={s}
            className={`h-full ${SEVERITY_DOT[s]}`}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

function ModelLabel(model) {
  return model === 'anthropic' ? 'Claude' : model === 'google' ? 'Gemini' : 'GPT-4o';
}

function ProjectCard({ project }) {
  const counts = countBySeverity(project.repairs);
  const totalPhotos = project.photos?.length || 0;
  const totalRepairs = project.repairs?.length || 0;

  return (
    <Link
      href={`/project/${project.id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-stone-200 p-5 transition hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900 leading-snug truncate">{project.address}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(project.createdAt)}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-500 bg-stone-100 px-2.5 py-1 rounded-full">
          {ModelLabel(project.model)}
        </span>
      </div>

      <div className="flex gap-3 mt-4">
        <div className="flex-1 rounded-xl bg-stone-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Photos</p>
          <p className="text-2xl font-black text-slate-900">{totalPhotos}</p>
        </div>
        <div className="flex-1 rounded-xl bg-stone-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Repairs</p>
          <p className="text-2xl font-black text-slate-900">{totalRepairs}</p>
        </div>
        {counts.major > 0 && (
          <div className="flex-1 rounded-xl bg-red-50 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Major</p>
            <p className="text-2xl font-black text-red-600">{counts.major}</p>
          </div>
        )}
      </div>

      <SeverityBar repairs={project.repairs} />
    </Link>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    function refresh() { setProjects(getProjects()); }
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('scopework-projects-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('scopework-projects-changed', refresh);
    };
  }, []);

  const hasProjects = projects.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 px-5 pt-12 pb-6">
        <div className="mx-auto max-w-2xl flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Field Tool</p>
            <h1 className="text-3xl font-black text-white tracking-tight">🏗️ ScopeWork</h1>
            <p className="text-sm text-slate-400 mt-1">AI-powered repair estimator</p>
          </div>
          {hasProjects && (
            <Link
              href="/project/new"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
            >
              + New
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        {!hasProjects ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-4xl mb-5 shadow-xl">
              📋
            </div>
            <h2 className="text-2xl font-black text-slate-900">No inspections yet</h2>
            <p className="mt-2 text-slate-500 max-w-xs leading-relaxed">
              Walk a property, snap photos, and let AI build your scope of work — repair by repair.
            </p>
            <Link
              href="/project/new"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/25 hover:bg-amber-600 active:scale-95 transition-transform"
            >
              Start First Inspection →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-4">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {hasProjects && (
        <Link
          href="/project/new"
          className="sm:hidden fixed bottom-6 right-5 flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 text-white text-2xl font-bold shadow-xl shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-transform"
          aria-label="New project"
        >
          +
        </Link>
      )}
    </div>
  );
}
