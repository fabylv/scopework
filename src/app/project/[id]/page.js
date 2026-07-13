'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { addPhotoError, addPhotoResult, getProject } from '@/lib/projects';

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
      {repair.needsCloserPhoto && repair.guidance && (
        <div className="border-t border-stone-100 bg-amber-50 px-4 py-2.5">
          <p className="text-xs font-semibold text-amber-700">📸 Better photo needed</p>
          <p className="text-xs text-amber-600 mt-0.5">{repair.guidance}</p>
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.id;
  const fileInputRef = useRef(null);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [busy, setBusy] = useState(false);

  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    function refresh() { setProject(getProject(projectId)); }
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('scopework-projects-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('scopework-projects-changed', refresh);
    };
  }, [projectId]);

  const repairs = Array.isArray(project?.repairs) ? project.repairs : [];
  const counts = getSeverityCounts(repairs);
  const orderedRepairs = sortBySeverity(repairs);
  const hasAnalyzedPhotos = (project?.photos?.filter((p) => p.analysisResult)?.length || 0) > 0;

  async function runAnalysis(pending) {
    if (!pending || !projectId) return;
    setBusy(true);
    setAnalysisError('');
    try {
      const formData = new FormData();
      formData.append('photo', pending.file);
      formData.append('model', project?.model || 'openai');
      const res = await fetch('/api/analyze-photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Analysis failed');
      addPhotoResult(projectId, pending.id, data);
      setPendingPhoto(null);
    } catch (err) {
      setAnalysisError(err?.message || 'Analysis failed');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    const preview = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not load photo preview.'));
      reader.readAsDataURL(file);
    });
    const pending = {
      id: crypto?.randomUUID?.() || `photo_${Date.now()}`,
      file,
      preview,
    };
    setPendingPhoto(pending);
    setAnalysisError('');
    await runAnalysis(pending);
  }

  function handleSkip() {
    if (!pendingPhoto || !projectId) return;
    addPhotoError(projectId, pendingPhoto.id, analysisError || 'Skipped');
    setPendingPhoto(null);
    setAnalysisError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 max-w-sm w-full text-center">
          <p className="text-slate-700 font-semibold">Project not found</p>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sticky dark header */}
      <header className="sticky top-0 z-20 bg-slate-900 px-4 py-3 flex items-center gap-3 shadow-lg">
        <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{project?.address || 'Loading...'}</p>
          <p className="text-slate-400 text-xs">{getModelLabel(project?.model || 'openai')}</p>
        </div>
        {hasAnalyzedPhotos && (
          <Link
            href={`/project/${projectId}/report`}
            className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
          >
            Report →
          </Link>
        )}
      </header>

      {/* Stats bar */}
      <div className="bg-slate-800 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-4 text-sm">
          <span className="text-slate-300 font-semibold">{project?.photos?.length || 0} photos</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-semibold">{repairs.length} repairs</span>
          {counts.major > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-red-400 font-bold">{counts.major} major</span>
            </>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-28">
        {/* Empty state */}
        {(!project || project.photos.length === 0) && (
          <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center mb-4">
            <div className="text-5xl mb-3">🏠</div>
            <h2 className="text-lg font-black text-slate-900">Ready to inspect</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Walk the property and tap <strong>Add Photo</strong> below to start capturing repairs.
            </p>
          </div>
        )}

        {/* Repair list */}
        {orderedRepairs.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-stone-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Repair List</h2>
              <div className="flex items-center gap-2 text-xs">
                {counts.major > 0 && <span className="text-red-600 font-bold">{counts.major}🔴</span>}
                {counts.moderate > 0 && <span className="text-orange-500 font-bold">{counts.moderate}🟠</span>}
                {counts.minor > 0 && <span className="text-yellow-500 font-bold">{counts.minor}🟡</span>}
              </div>
            </div>
            <div className="p-4 space-y-2">
              {SEVERITY_ORDER.map((severity) => {
                const items = orderedRepairs.filter((r) => r.severity === severity);
                if (!items.length) return null;
                return (
                  <div key={severity}>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-2 mt-3 first:mt-0">
                      {severity} · {items.length}
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
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-slate-900 border-t border-slate-800 px-4 py-3 safe-area-pb">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl bg-amber-500 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/20 hover:bg-amber-600 active:scale-[0.98] transition-transform"
          >
            📷 Add Photo
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Analysis overlay */}
      {pendingPhoto && (
        <>
          <style>{`
            @keyframes scan {
              0% { top: 5%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 95%; opacity: 0; }
            }
            .scan-line { animation: scan 2.5s ease-in-out infinite; }
          `}</style>
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Photo with scan overlay */}
            <div className="relative flex-1 overflow-hidden">
              <Image
                src={pendingPhoto.preview}
                alt="Analyzing"
                fill
                unoptimized
                className="object-cover opacity-70"
              />
              {busy && (
                <div className="absolute inset-0">
                  <div
                    className="scan-line absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_2px_rgba(251,191,36,0.6)]"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

              {/* Top badge */}
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="rounded-full bg-black/60 backdrop-blur-sm px-4 py-1.5 border border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    {getModelLabel(project?.model || 'openai')}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom panel */}
            <div className="bg-slate-900 px-5 pt-5 pb-8">
              {busy ? (
                <div className="text-center mb-5">
                  <p className="text-xl font-black text-white">Scanning for repairs...</p>
                  <p className="text-sm text-slate-400 mt-1">AI is analyzing every surface and defect</p>
                </div>
              ) : analysisError ? (
                <div className="mb-5">
                  <p className="text-lg font-black text-white">Analysis failed</p>
                  <p className="text-sm text-red-400 mt-1">{analysisError}</p>
                </div>
              ) : (
                <div className="text-center mb-5">
                  <p className="text-xl font-black text-white">Preparing scan...</p>
                </div>
              )}

              <div className="flex gap-3">
                {analysisError ? (
                  <>
                    <button
                      type="button"
                      onClick={() => runAnalysis(pendingPhoto)}
                      className="flex-1 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white hover:bg-amber-600"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="flex-1 rounded-2xl bg-slate-700 py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-600"
                    >
                      Skip Photo
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={busy}
                    className="flex-1 rounded-2xl bg-slate-700 py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-600 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
