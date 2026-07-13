'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '@/lib/projects';

const SEVERITY_ORDER = ['major', 'moderate', 'minor'];

const SEVERITY_STYLES = {
  major: 'border-l-4 border-l-red-500 bg-white',
  moderate: 'border-l-4 border-l-orange-400 bg-white',
  minor: 'border-l-4 border-l-yellow-400 bg-white',
};

const SEVERITY_LABEL = {
  major: 'bg-red-100 text-red-700',
  moderate: 'bg-orange-100 text-orange-700',
  minor: 'bg-yellow-100 text-yellow-700',
};

const SEVERITY_ICONS = { major: '🔴', moderate: '🟠', minor: '🟡' };

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getModelLabel(m) {
  return m === 'anthropic' ? 'Claude' : m === 'google' ? 'Gemini' : 'GPT-4o';
}

function getSeverityCounts(repairs = []) {
  return repairs.reduce(
    (acc, r) => { const s = r?.severity || 'minor'; if (acc[s] !== undefined) acc[s]++; return acc; },
    { major: 0, moderate: 0, minor: 0 }
  );
}

function sortBySeverity(repairs = []) {
  return [...repairs].sort((a, b) => {
    const d = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    return d !== 0 ? d : (b.confidence || 0) - (a.confidence || 0);
  });
}

function RepairCard({ repair }) {
  return (
    <div className={`rounded-xl border border-stone-200 shadow-sm overflow-hidden ${SEVERITY_STYLES[repair.severity]}`}>
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-snug">{repair.type}</p>
          <p className="text-xs text-slate-500 mt-0.5">📍 {repair.location}</p>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
            Photo {repair.photoIndex} · {Math.round((repair.confidence || 0) * 100)}% confidence
          </p>
        </div>
        <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${SEVERITY_LABEL[repair.severity]}`}>
          {SEVERITY_ICONS[repair.severity]} {repair.severity}
        </span>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const projectId = params?.id;

  const project = useSyncExternalStore(
    (cb) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('storage', cb);
      window.addEventListener('focus', cb);
      window.addEventListener('scopework-projects-changed', cb);
      return () => {
        window.removeEventListener('storage', cb);
        window.removeEventListener('focus', cb);
        window.removeEventListener('scopework-projects-changed', cb);
      };
    },
    () => (projectId ? getProject(projectId) : null),
    () => null
  );

  const repairs = Array.isArray(project?.repairs) ? project.repairs : [];
  const counts = getSeverityCounts(repairs);
  const orderedRepairs = sortBySeverity(repairs);

  if (!projectId || !project) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-sm w-full text-center">
          <p className="text-slate-700 font-semibold">{!projectId ? 'Report not found' : 'Loading report...'}</p>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Dark report header */}
      <header className="bg-slate-900 px-5 pt-10 pb-7">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Inspection
          </Link>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Repair Report</p>
            <h1 className="text-2xl font-black text-white leading-tight">{project.address}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-slate-400">{formatDate(project.createdAt)}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                {getModelLabel(project.model)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-10 space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Repairs</p>
            <p className="text-5xl font-black text-slate-900 mt-1">{repairs.length}</p>
            <p className="text-sm text-slate-400 mt-1">
              across {project.photos?.length || 0} photo{(project.photos?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">Major</p>
            <p className="text-4xl font-black text-red-600 mt-1">{counts.major}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl border border-orange-100 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Moderate</p>
            <p className="text-4xl font-black text-orange-500 mt-1">{counts.moderate}</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm p-4 col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">Minor</p>
            <p className="text-4xl font-black text-yellow-600 mt-1">{counts.minor}</p>
          </div>
        </div>

        {/* Repair list */}
        {orderedRepairs.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Full Repair List</h2>
              <button
                type="button"
                onClick={() => console.log('Share report', projectId)}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
              >
                📤 Share
              </button>
            </div>
            <div className="p-4 space-y-2">
              {SEVERITY_ORDER.map((severity) => {
                const items = orderedRepairs.filter((r) => r.severity === severity);
                if (!items.length) return null;
                return (
                  <div key={severity}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-2 mt-4 first:mt-0">
                      {SEVERITY_ICONS[severity]} {severity} · {items.length}
                    </p>
                    <div className="space-y-2">
                      {items.map((repair, i) => (
                        <RepairCard key={`${repair.photoId}-${i}`} repair={repair} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cost estimation teaser */}
        <div className="bg-slate-900 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Coming Soon</p>
              <h2 className="text-lg font-black text-white mt-0.5">Cost Estimation</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
              💰
            </div>
          </div>
          {/* Placeholder blurred rows */}
          <div className="space-y-2 opacity-40 pointer-events-none select-none">
            {[
              { label: 'Roof repair', amt: '$4,200–6,800' },
              { label: 'Foundation crack', amt: '$1,500–2,200' },
              { label: 'HVAC replacement', amt: '$6,000–9,500' },
            ].map((row) => (
              <div key={row.label} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-slate-300 font-medium blur-[2px]">{row.label}</p>
                <p className="text-sm font-bold text-white blur-[2px]">{row.amt}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Contractor rate profiles + material pricing coming in the next update
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/project/${projectId}`}
            className="flex-1 text-center rounded-xl border-2 border-stone-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-slate-300"
          >
            ← Inspection
          </Link>
          <Link
            href="/"
            className="flex-1 text-center rounded-xl border-2 border-stone-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-slate-300"
          >
            🏠 All Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
