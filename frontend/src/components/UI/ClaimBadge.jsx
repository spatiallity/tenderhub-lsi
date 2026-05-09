import React from 'react';
import { Building2, Lock, Globe } from 'lucide-react';
import { unitKerjaLabel, isPusat } from '../../utils/unitKerja';

/**
 * Pill showing which unit_kerja owns a tender/RUP.
 * Variants:
 *   - claim={null}              → muted "Belum di-claim" pill
 *   - claim={{unit_kerja:...}}  → owner name + region
 *   - viewerOwns                → highlight in blue
 *   - readOnly                  → small lock icon for non-owners
 */
export default function ClaimBadge({ claim, viewerOwns = false, readOnly = false, size = 'sm', className = '' }) {
  const sizeClass = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5';

  if (!claim || !claim.unit_kerja) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-bold border bg-slate-50 text-slate-500 border-slate-200 ${sizeClass} ${className}`} title="Belum di-claim cabang manapun">
        <Globe size={size === 'xs' ? 9 : 10} />
        Tersedia
      </span>
    );
  }

  const pusat = isPusat(claim.unit_kerja);
  const ownerColor = viewerOwns
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : pusat
    ? 'bg-violet-50 text-violet-700 border-violet-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold border ${ownerColor} ${sizeClass} ${className}`}
      title={viewerOwns ? 'Tender milik unit kerja Anda' : `Di-claim oleh ${unitKerjaLabel(claim.unit_kerja)}${claim.unit_kerja_region ? ` (Wilayah ${claim.unit_kerja_region})` : ''}`}
    >
      {readOnly && !viewerOwns ? <Lock size={size === 'xs' ? 9 : 10} /> : <Building2 size={size === 'xs' ? 9 : 10} />}
      <span className="truncate max-w-[140px]">{unitKerjaLabel(claim.unit_kerja)}</span>
    </span>
  );
}
