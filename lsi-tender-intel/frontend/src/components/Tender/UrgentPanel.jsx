import React from 'react';
import { Badge, CountdownBadge } from '../UI/index';
import { portfolioColor } from '../../utils/constants';
import { formatRupiah } from '../../utils/helpers';

export default function UrgentPanel({ tenders, openTender }) {
  const urgent = tenders.filter(t => t.daysLeft <= 7 && t.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  
  if (urgent.length === 0) {
    return <div className="text-slate-500 p-5 text-center">Tidak ada tender dengan deadline kurang dari 7 hari.</div>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-slate-500 text-xs mb-1">{urgent.length} tender membutuhkan perhatian segera</div>
      {urgent.map(t => (
        <div key={t.id} 
             className="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer transition-colors duration-200 hover:border-red-300"
             onClick={() => openTender(t.id)}>
          <div className="flex justify-between items-start gap-2.5 mb-2">
            <CountdownBadge dateStr={t.deadlineStage} days={t.daysLeft} expired={t.deadlinePassed} />
            <Badge color={t.currentStageColor}>{t.currentStageName}</Badge>
          </div>
          <div className="text-[13px] font-extrabold leading-snug">{t.nama}</div>
          <div className="text-slate-500 text-[11px] mt-1">{t.instansi}</div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs font-extrabold">{formatRupiah(t.hps)}</div>
            <Badge color={portfolioColor[t.recommendation]}>{t.recommendation}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
