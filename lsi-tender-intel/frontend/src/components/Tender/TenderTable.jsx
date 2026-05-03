import React from 'react';
import { Card, Badge, RelevanceBar, CountdownBadge } from '../UI';
import { ExternalLink } from 'lucide-react';
import { formatRupiah, levelColor, portfolioColor, internalStatusColor } from '../../utils/format';

const TenderTable = ({ tenders, onRowClick }) => {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3 font-semibold w-1/3">Paket & Instansi</th>
              <th className="px-3 py-3 font-semibold">Portofolio</th>
              <th className="px-3 py-3 font-semibold">Status Internal</th>
              <th className="px-3 py-3 font-semibold text-right">HPS</th>
              <th className="px-3 py-3 font-semibold text-center">Relevance</th>
              <th className="px-4 py-3 font-semibold text-center">Deadline</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {tenders.map((t) => (
                <tr 
                  key={t.id} 
                  className="border-b border-slate-100 hover:bg-blue-50/60 transition-colors cursor-pointer group" 
                  onClick={() => onRowClick(t)}
                >
                  <td className="px-4 py-2.5">
                    <div 
                      className="font-bold text-slate-800 mb-1 max-w-sm whitespace-normal line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors"
                      title={t.nama || t.nama_paket}
                    >
                      {t.nama || t.nama_paket}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 max-w-sm truncate" title={t.instansi || t.nama_klpd}>
                      <span className="truncate">{t.instansi || t.nama_klpd}</span>
                      {t.lpse && (
                        <a href={t.lpse} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-500 hover:text-blue-700 flex-shrink-0" title="Buka Link LPSE">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {(t.level || t.jenis_klpd) && (
                      <div className="mt-1.5">
                        <Badge color={levelColor[t.level || 'K/L'] || 'gray'}>
                        {t.level || t.jenis_klpd}
                      </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge color={portfolioColor[t.portofolio || t.recommended_subporto] || 'gray'}>
                      {t.portofolio || t.recommended_subporto || '-'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge color={internalStatusColor[t.internalStatus || t.status_internal] || 'gray'}>
                      {t.internalStatus || t.status_internal || 'Dipantau'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="font-bold text-slate-800">{formatRupiah(t.hps || t.pagu || 0)}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[120px] ml-auto" title={t.metode || t.metode_pengadaan}>
                      {t.metode || t.metode_pengadaan}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center align-middle">
                    <RelevanceBar score={t.relevance_score || 0} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <CountdownBadge dateStr={t.deadlineStage} days={t.daysLeft} expired={t.deadlinePassed} />
                  </td>
                </tr>
            ))}
            {tenders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500 text-sm">
                  Tidak ada data tender yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TenderTable;
