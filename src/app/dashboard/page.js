'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProjects } from '@/lib/db';
import { loadSampleProjects, clearSampleProjects } from '@/lib/sample-data';
import AppShell from '@/components/AppShell';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function countBySeverity(repairs = []) {
  return repairs.reduce(
    (acc, r) => { const s = r?.severity || 'minor'; if (acc[s] !== undefined) acc[s]++; return acc; },
    { major: 0, moderate: 0, minor: 0 }
  );
}

function estimateRange(repairs = []) {
  const c = countBySeverity(repairs);
  const low = c.major * 1500 + c.moderate * 400 + c.minor * 100;
  const high = c.major * 5000 + c.moderate * 1800 + c.minor * 500;
  if (low === 0 && high === 0) return null;
  return [`$${low.toLocaleString()}`, `$${high.toLocaleString()}`];
}

// Gradient placeholder by project id
const GRADIENTS = [
  'from-slate-600 to-slate-800',
  'from-stone-500 to-stone-700',
  'from-zinc-600 to-zinc-800',
  'from-neutral-500 to-neutral-700',
  'from-slate-500 to-slate-700',
];

function projectGradient(id = '') {
  const n = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[n];
}

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1564013799919-ab3d54bcd0f8?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format',
];

function samplePhoto(id = '') {
  const n = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % SAMPLE_PHOTOS.length;
  return SAMPLE_PHOTOS[n];
}

function ProjectCard({ project }) {
  const range = estimateRange(project.repairs);
  const totalPhotos = project.photos?.length || 0;
  const hasEstimate = range !== null;

  return (
    <Link
      href={`/project/${project.id}`}
      className="group block bg-white rounded-xl border border-[#E1E2E4] overflow-hidden hover:shadow-lg transition-shadow"
      style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
    >
      {/* Photo / placeholder */}
      <div className="relative w-full h-44 overflow-hidden bg-stone-200">
        <img
          src={project.thumbnail || samplePhoto(project.id)}
          alt={project.address}
          className="w-full h-full object-cover"
        />
        {/* Overlay for readability */}
        {project.thumbnail && <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />}
        {totalPhotos > 0 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
            {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
          </div>
        )}
        {hasEstimate ? (
          <div className="absolute top-3 right-3 rounded-full bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1">
            Estimate Ready
          </div>
        ) : (
          <div className="absolute top-3 right-3 rounded-full bg-[#F1F2F3] text-[#6E737B] text-xs font-bold px-2.5 py-1">
            Draft
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="font-bold text-[#171C24] text-base leading-snug line-clamp-1">{project.address}</p>
        <div className="flex items-center gap-1 mt-1">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#9AA0A8" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p className="text-xs text-[#9AA0A8] truncate">{project.address}</p>
        </div>

        <div className="h-px bg-[#F0F1F3] my-3" />

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA0A8]">Estimated</p>
            {hasEstimate ? (
              <p className="text-base font-bold text-[#171C24] mt-0.5">{range[0]} – {range[1]}</p>
            ) : (
              <p className="text-base font-bold text-[#B0B6BE] mt-0.5">—</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#9AA0A8]">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {formatDate(project.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [seeding, setSeeding] = useState(false);

  async function handleLoadSamples() {
    setSeeding(true);
    try {
      await loadSampleProjects();
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Seed failed', err);
    } finally {
      setSeeding(false);
    }
  }

  async function handleClearSamples() {
    try {
      await clearSampleProjects();
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Clear samples failed', err);
    }
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function refresh() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-6xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="h-8 w-32 bg-[#E1E2E4] rounded-lg animate-pulse" />
            <div className="hidden md:block h-9 w-32 bg-[#E1E2E4] rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E1E2E4] overflow-hidden">
                <div className="w-full h-44 bg-[#E1E2E4] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-[#E1E2E4] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#E1E2E4] rounded animate-pulse" />
                  <div className="h-px bg-[#F0F1F3]" />
                  <div className="h-5 w-1/3 bg-[#E1E2E4] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#171C24]">Projects</h1>
            {projects.length > 0 && (
              <p className="text-sm text-[#6E737B] mt-0.5">
                {projects.length} active propert{projects.length !== 1 ? 'ies' : 'y'} · Estimates update in real time.
              </p>
            )}
          </div>
          <Link
            href="/project/new"
            className="hidden md:flex items-center gap-1.5 rounded-lg bg-[#FFA12B] px-4 py-2 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors shrink-0"
          >
            + New Project
          </Link>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-[#151C24] flex items-center justify-center text-4xl mb-5 shadow-xl">
              📋
            </div>
            <h2 className="text-xl font-bold text-[#171C24]">No projects yet</h2>
            <p className="mt-2 text-[#6E737B] text-sm max-w-xs leading-relaxed">
              Walk a property, snap photos, and let AI build your scope of work — repair by repair.
            </p>
            <Link
              href="/project/new"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#FFA12B] px-6 py-3 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors shadow-lg"
              style={{ boxShadow: '0 8px 24px rgba(255,161,43,0.3)' }}
            >
              Start First Inspection →
            </Link>
            <Link href="/test-photo" className="mt-3 text-xs text-[#9AA0A8] hover:text-[#6E737B]">
              Or try the photo analyzer →
            </Link>
            <button
              onClick={handleLoadSamples}
              disabled={seeding}
              className="mt-6 text-xs text-[#9AA0A8] hover:text-[#6E737B] underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              {seeding ? 'Loading samples...' : 'Load sample projects'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
            {projects.some((p) => p.id.startsWith('sample-')) && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleClearSamples}
                  className="text-xs text-[#C5CAD4] hover:text-[#9AA0A8] underline underline-offset-2 transition-colors"
                >
                  Clear sample projects
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
