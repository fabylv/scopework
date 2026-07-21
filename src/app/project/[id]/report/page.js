'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '@/lib/db';
import { SEVERITY_BADGE, TRADE_COLORS, inferTrade, estimateCostRange, groupByTrade, countBySeverity, totalCostRange, getModelLabel } from '@/lib/repair-utils';
import AppShell from '@/components/AppShell';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

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
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${SEVERITY_BADGE[repair.severity]}`}>
        {repair.severity}
      </span>
      <div className="hidden sm:block text-right shrink-0">
        <p className="text-sm font-bold text-[#171C24]">${low.toLocaleString()} – ${high.toLocaleString()}</p>
        <p className="text-[10px] text-[#9AA0A8] font-semibold uppercase tracking-wide mt-0.5">Estimate</p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const projectId = params?.id;
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    async function refresh() {
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error('Failed to load report', err);
      }
    }
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [projectId]);

  if (!project) {
    return (
      <AppShell>
        <div className="px-4 sm:px-6 py-5 sm:py-8 flex items-center justify-center min-h-[60vh]">
          <p className="text-[#6E737B]">{projectId ? 'Loading report...' : 'Report not found'}</p>
        </div>
      </AppShell>
    );
  }

  const repairs = Array.isArray(project.repairs) ? project.repairs : [];
  const tradeGroups = groupByTrade(repairs);
  const { low: totalLow, high: totalHigh } = totalCostRange(repairs);
  const counts = countBySeverity(repairs);

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        {/* Back */}
        <Link
          href={`/project/${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#6E737B] hover:text-[#171C24] mb-6 transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Inspection
        </Link>

        {/* Hero dark card */}
        <div className="rounded-xl bg-[#1E2530] p-6 mb-6" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.18)' }}>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3DE] px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFA12B]" />
            <span className="text-xs font-bold text-[#8A6400]">Repair Report · {getModelLabel(project.model)}</span>
          </div>

          <h1 className="text-2xl font-bold text-white">{project.address}</h1>
          <p className="text-sm text-[#5A6270] mt-1">{formatDate(project.createdAt)}</p>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-5 border-t border-[#2A323C]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Issues Found</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{repairs.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Photos Analyzed</p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1">{project.photos?.length || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6270]">Total Estimate</p>
              <p className="text-base sm:text-xl font-black text-white mt-1 leading-tight">
                ${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#2A323C]">
            <button
              onClick={() => console.log('Export PDF', projectId)}
              className="flex items-center gap-1.5 rounded-lg bg-[#2A323C] px-3 py-2 text-xs font-semibold text-[#C5CAD4] hover:bg-[#333D49] transition-colors"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export PDF
            </button>
            <button
              onClick={() => console.log('Share', projectId)}
              className="flex items-center gap-1.5 rounded-lg bg-[#2A323C] px-3 py-2 text-xs font-semibold text-[#C5CAD4] hover:bg-[#333D49] transition-colors"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share Link
            </button>
          </div>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Major',    count: counts.major,    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100' },
            { label: 'Moderate', count: counts.moderate, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
            { label: 'Minor',    count: counts.minor,    bg: 'bg-[#FAF9F6]', text: 'text-[#6E737B]',  border: 'border-[#E1E2E4]' },
          ].map(({ label, count, bg, text, border }) => (
            <div key={label} className={`${bg} rounded-xl border ${border} p-4`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${text} opacity-70`}>{label}</p>
              <p className={`text-4xl font-black ${text} mt-1`}>{count}</p>
            </div>
          ))}
        </div>

        {/* Repair list by trade */}
        {repairs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#E1E2E4] p-8 text-center">
            <p className="text-[#6E737B]">No repairs captured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tradeGroups).map(([trade, items]) => {
              const tLow  = items.reduce((s, r) => s + estimateCostRange(r.severity)[0], 0);
              const tHigh = items.reduce((s, r) => s + estimateCostRange(r.severity)[1], 0);
              return (
                <div key={trade} className="bg-white rounded-xl border border-[#E1E2E4] overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F6] border-b border-[#F0F1F3]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${TRADE_COLORS[trade] || 'bg-gray-100 text-gray-600'}`}>
                        {trade}
                      </span>
                      <span className="text-xs text-[#9AA0A8]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm font-bold text-[#171C24]">${tLow.toLocaleString()} – ${tHigh.toLocaleString()}</p>
                  </div>
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

        {/* Bottom nav */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            href={`/project/${projectId}`}
            className="flex-1 text-center rounded-lg border border-[#E1E2E4] bg-white py-2.5 text-sm font-semibold text-[#4A5260] hover:bg-[#FAF9F6] transition-colors"
          >
            ← Back to Inspection
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 text-center rounded-lg border border-[#E1E2E4] bg-white py-2.5 text-sm font-semibold text-[#4A5260] hover:bg-[#FAF9F6] transition-colors"
          >
            All Projects
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
