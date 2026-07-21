'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { addPhotoError, addPhotoResult, getProject } from '@/lib/db';
import { SEVERITY_BADGE, TRADE_COLORS, inferTrade, estimateCostRange, groupByTrade, countBySeverity, totalCostRange, getModelLabel } from '@/lib/repair-utils';
import AppShell from '@/components/AppShell';

const SEVERITY_ORDER = ['major', 'moderate', 'minor'];

function RepairRow({ repair, photoIcon }) {
  const [low, high] = estimateCostRange(repair.severity);
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-[#F0F1F3] last:border-0">
      <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500">
        {photoIcon
          ? <img src={photoIcon} alt="" className="w-full h-full object-cover" />
          : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#171C24] leading-snug">{repair.type}</p>
        <p className="text-xs text-[#9AA0A8] mt-0.5 truncate">📍 {repair.location}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[repair.severity]}`}>
        {repair.severity.charAt(0).toUpperCase() + repair.severity.slice(1)}
      </span>
      <div className="hidden sm:block text-right shrink-0 ml-1">
        <p className="text-sm font-bold text-[#171C24]">${low.toLocaleString()} – ${high.toLocaleString()}</p>
        <p className="text-[10px] text-[#9AA0A8] font-semibold uppercase tracking-wide mt-0.5">Estimate</p>
      </div>
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
    async function refresh() {
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error('Failed to load project', err);
      }
    }
    refresh();
  }, [projectId]);

  const repairs = Array.isArray(project?.repairs) ? project.repairs : [];
  const counts = countBySeverity(repairs);
  const { low, high } = totalCostRange(repairs);
  const hasEstimate = repairs.length > 0;
  const tradeGroups = groupByTrade(repairs);
  const hasAnalyzedPhotos = (project?.photos?.filter((p) => p.analysisResult)?.length || 0) > 0;

  async function createThumbnail(file) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 600, maxH = 400;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  // Small square crop for repair row icons (96×96, ~3–6 KB each)
  async function createIconThumbnail(file) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 96;
        canvas.width = size;
        canvas.height = size;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        canvas.getContext('2d').drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  async function runAnalysis(pending) {
    if (!pending || !projectId) return;
    setBusy(true);
    setAnalysisError('');
    try {
      const formData = new FormData();
      formData.append('photo', pending.file);
      formData.append('model', project?.model || 'openai');
      const [res, thumbnail, iconThumbnail] = await Promise.all([
        fetch('/api/analyze-photo', { method: 'POST', body: formData }),
        !project?.thumbnail ? createThumbnail(pending.file) : Promise.resolve(null),
        createIconThumbnail(pending.file),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Analysis failed');
      const updated = await addPhotoResult(projectId, pending.id, data, thumbnail, iconThumbnail);
      if (updated) setProject(updated);
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
      reader.onerror = () => reject(new Error('Could not load photo.'));
      reader.readAsDataURL(file);
    });
    const pending = { id: crypto?.randomUUID?.() || `photo_${Date.now()}`, file, preview };
    setPendingPhoto(pending);
    setAnalysisError('');
    await runAnalysis(pending);
  }

  async function handleSkip() {
    if (!pendingPhoto || !projectId) return;
    const updated = await addPhotoError(projectId, pendingPhoto.id, analysisError || 'Skipped');
    if (updated) setProject(updated);
    setPendingPhoto(null);
    setAnalysisError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-3xl pb-20 md:pb-28">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#6E737B] hover:text-[#171C24] mb-6 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          All Projects
        </Link>

        {/* Hero dark card */}
        <div className="rounded-xl bg-[#1E2530] p-6 mb-6" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.18)' }}>
          {/* Status badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3DE] px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFA12B]" />
            <span className="text-xs font-bold text-[#8A6400]">
              {hasAnalyzedPhotos ? 'AI Estimate · Estimate Ready' : 'AI Estimate · No Photos Yet'}
            </span>
          </div>

          {/* Title + address */}
          <h1 className="text-2xl font-bold text-white leading-tight">{project?.address || 'Loading...'}</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#5A6270" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p className="text-sm text-[#5A6270]">{project?.address}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-5 border-t border-[#2A323C]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Issues Found</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{repairs.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Photos Analyzed</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{project?.photos?.length || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Total Estimate</p>
              {hasEstimate ? (
                <p className="text-base sm:text-xl font-black text-white mt-1 leading-tight">${low.toLocaleString()} – ${high.toLocaleString()}</p>
              ) : (
                <p className="text-base sm:text-xl font-black text-[#3A4250] mt-1">—</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start gap-2 mt-5 pt-4 border-t border-[#2A323C]">
            <div className="flex gap-2 flex-1 min-w-0">
              <button className="flex items-center gap-1.5 rounded-lg bg-[#2A323C] px-3 py-2 text-xs font-semibold text-[#C5CAD4] hover:bg-[#333D49] transition-colors">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export PDF
              </button>
              {hasAnalyzedPhotos && (
                <Link
                  href={`/project/${projectId}/report`}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2A323C] px-3 py-2 text-xs font-semibold text-[#C5CAD4] hover:bg-[#333D49] transition-colors"
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share Link
                </Link>
              )}
            </div>
            <div className="shrink-0 flex rounded-lg overflow-hidden border border-[#2A323C]">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#FFA12B] text-[#171C24]">
                🏠 Home Depot Pricing
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5A6270] hover:text-[#C5CAD4] bg-[#1E2530] hover:bg-[#2A323C] transition-colors">
                🔧 My Contractor
              </button>
            </div>
          </div>
        </div>

        {/* Repair list */}
        {repairs.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E1E2E4] border-dashed p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <div className="text-4xl mb-3">📷</div>
            <p className="font-bold text-[#171C24]">No repairs yet</p>
            <p className="text-sm text-[#6E737B] mt-1">Tap "Add Photo" to start capturing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tradeGroups).map(([trade, items]) => {
              const tradeLow  = items.reduce((s, r) => s + estimateCostRange(r.severity)[0], 0);
              const tradeHigh = items.reduce((s, r) => s + estimateCostRange(r.severity)[1], 0);
              return (
                <div key={trade} className="bg-white rounded-xl border border-[#E1E2E4] overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                  {/* Group header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F6] border-b border-[#F0F1F3]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${TRADE_COLORS[trade] || 'bg-gray-100 text-gray-600'}`}>
                        {trade}
                      </span>
                      <span className="text-xs text-[#9AA0A8]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm font-bold text-[#171C24]">${tradeLow.toLocaleString()} – ${tradeHigh.toLocaleString()}</p>
                  </div>
                  {/* Rows */}
                  <div>
                    {items.map((repair, i) => (
                      <RepairRow
                        key={`${repair.photoId}-${i}`}
                        repair={repair}
                        photoIcon={project?.photos?.find(p => p.id === repair.photoId)?.icon || null}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Photo — bottom sticky (mobile) */}
        <div className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-[#E1E2E4] px-4 py-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg bg-[#FFA12B] py-3 text-sm font-bold text-[#171C24]"
          >
            📷 Add Photo
          </button>
        </div>

        {/* Desktop add photo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden md:flex items-center gap-2 mt-6 rounded-lg bg-[#FFA12B] px-5 py-2.5 text-sm font-bold text-[#171C24] hover:bg-[#F28E1C] transition-colors"
          style={{ boxShadow: '0 4px 16px rgba(255,161,43,0.25)' }}
        >
          📷 Add Photo
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

      {/* Analysis overlay */}
      {pendingPhoto && (
        <>
          <style>{`
            @keyframes scan { 0%{top:5%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:95%;opacity:0} }
            .scan-line { animation: scan 2.5s ease-in-out infinite; }
          `}</style>
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="relative flex-1 overflow-hidden">
              <Image src={pendingPhoto.preview} alt="Analyzing" fill unoptimized className="object-cover opacity-60" />
              {busy && (
                <div className="absolute inset-0">
                  <div className="scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFA12B] to-transparent" style={{ filter: 'drop-shadow(0 0 8px #FFA12B)' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
              <div className="absolute top-4 inset-x-0 flex justify-center">
                <div className="rounded-full bg-black/60 backdrop-blur-sm px-4 py-1.5 border border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FFA12B]">{getModelLabel(project?.model || 'openai')}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#151C24] px-5 pt-5 pb-8">
              {busy ? (
                <div className="text-center mb-5">
                  <p className="text-xl font-black text-white">Scanning for repairs...</p>
                  <p className="text-sm text-[#5A6270] mt-1">AI is analyzing every surface and defect</p>
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
                    <button onClick={() => runAnalysis(pendingPhoto)} className="flex-1 rounded-lg bg-[#FFA12B] py-3 text-sm font-bold text-[#171C24]">Try Again</button>
                    <button onClick={handleSkip} className="flex-1 rounded-lg bg-[#2A323C] py-3 text-sm font-bold text-[#6E737B]">Skip</button>
                  </>
                ) : (
                  <button onClick={handleSkip} disabled={busy} className="flex-1 rounded-lg bg-[#2A323C] py-3 text-sm font-bold text-[#6E737B] disabled:opacity-40">Cancel</button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
