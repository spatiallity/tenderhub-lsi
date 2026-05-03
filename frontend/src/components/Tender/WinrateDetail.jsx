import React from 'react';
import { Badge } from '../UI/index';
import { portfolioColor } from '../../utils/constants';
import { formatRupiah, formatDate } from '../../utils/helpers';

export default function WinrateDetail({ tenders, openTender }) {
  const followed = tenders.filter(t => t.followed || t.internalStatus === 'Sudah Diikuti').sort((a, b) => new Date(b.deadlineStage) - new Date(a.deadlineStage));
  
  if (followed.length === 0) {
    return <div className="text-slate-500 p-5 text-center">Belum ada tender yang diikuti.</div>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {followed.map(t => {
        const isWon = t.won;
        const isLost = t.status === 'Selesai' && !t.won;
        const statusColor = isWon ? 'green' : isLost ? 'red' : 'amber';
        const statusLabel = isWon ? 'Menang' : isLost ? 'Kalah' : 'Sedang Proses';

        return (
          <div key={t.id} 
               className="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer transition-colors duration-200 hover:border-blue-300"
               onClick={() => openTender(t.id)}>
            <div className="flex justify-between items-start gap-2.5 mb-2">
              <Badge color={statusColor}>{statusLabel}</Badge>
              <div className="text-slate-500 text-[11px]">{formatDate(new Date(`${t.deadlineStage}T00:00:00+07:00`))}</div>
            </div>
            <div className="text-[13px] font-extrabold leading-snug">{t.nama}</div>
            <div className="text-slate-500 text-[11px] mt-1">{t.instansi}</div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs font-extrabold">{formatRupiah(t.hps)}</div>
              <Badge color={portfolioColor[t.recommendation]}>{t.recommendation}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
