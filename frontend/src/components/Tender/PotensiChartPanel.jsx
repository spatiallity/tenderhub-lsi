import React from 'react';
import { formatRupiah } from '../../utils/helpers';

export default function PotensiChartPanel({ tenders, openTender }) {
  const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0e7490', '#be123c', '#0369a1', '#15803d', '#dc2626', '#6d28d9'];
  const sorted = [...tenders].sort((a, b) => (b.hps || 0) - (a.hps || 0));
  const top10 = sorted.slice(0, 10);
  const othersTotal = sorted.slice(10).reduce((s, t) => s + (t.hps || 0), 0);
  
  const segments = [
    ...top10.map((t, i) => ({ 
      label: (t.nama || '').length > 35 ? t.nama.slice(0, 35) + '...' : t.nama, 
      value: t.hps || 0, 
      color: PIE_COLORS[i % PIE_COLORS.length], 
      id: t.id 
    }))
  ];
  
  if (othersTotal > 0) {
    segments.push({ label: `${sorted.length - 10} tender lainnya`, value: othersTotal, color: '#94a3b8', id: null });
  }
  
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const portfolioRows = ['FLP', 'SDA', 'FITI'].map(portfolio => {
    const list = (tenders || []).filter(t => t.recommendation === portfolio);
    const value = list.reduce((sum, t) => sum + (t.hps || 0), 0);
    return { portfolio, count: list.length, value };
  });
  const maxPortfolioValue = Math.max(...portfolioRows.map(row => row.value), 1);

  let cumAngle = 0;
  const arcs = segments.map(seg => {
    const angle = total > 0 ? (seg.value / total) * 360 : 0;
    const startAngle = cumAngle;
    cumAngle += angle;
    return { ...seg, startAngle, angle };
  });

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const rad = a => (a - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div>
      <div className="flex justify-center mb-4">
        <svg width={220} height={220} viewBox="0 0 220 220">
          {arcs.map((arc, i) => (
            <path key={i} 
                  d={describeArc(110, 110, 100, arc.startAngle, arc.startAngle + arc.angle - 0.5)} 
                  fill={arc.color} 
                  stroke="#fff" 
                  strokeWidth={2} 
                  className={arc.id ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} 
                  onClick={() => arc.id && openTender(arc.id)}>
              <title>{arc.label}: {formatRupiah(arc.value)}</title>
            </path>
          ))}
          <circle cx={110} cy={110} r={45} fill="#fff" />
          <text x={110} y={106} textAnchor="middle" className="text-[11px] font-extrabold fill-slate-500">Total</text>
          <text x={110} y={122} textAnchor="middle" className="text-[13px] font-extrabold fill-slate-900">{formatRupiah(total)}</text>
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} 
               className={`flex items-center gap-2.5 px-2.5 py-2 border border-slate-200 rounded-lg bg-white ${seg.id ? 'cursor-pointer hover:bg-slate-50' : ''}`}
               onClick={() => seg.id && openTender(seg.id)}>
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: seg.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{seg.label}</div>
            </div>
            <div className="text-xs font-extrabold whitespace-nowrap">{formatRupiah(seg.value)}</div>
            <div className="text-slate-500 text-[11px] whitespace-nowrap">{total > 0 ? (seg.value / total * 100).toFixed(1) : 0}%</div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-200 pt-3.5">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
          Distribusi Potensi per Portofolio
        </div>
        <div className="flex flex-col gap-2">
          {portfolioRows.map(row => (
            <div key={row.portfolio} className="grid grid-cols-[42px_1fr_105px] gap-2 items-center">
              <div className="text-xs font-extrabold text-slate-700">{row.portfolio}</div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.portfolio === 'SDA' ? 'bg-green-500' : row.portfolio === 'FLP' ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${(row.value / maxPortfolioValue) * 100}%` }}
                />
              </div>
              <div className="text-[11px] font-bold text-right text-slate-700">{row.count} tender</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
