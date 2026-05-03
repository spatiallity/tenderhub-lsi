import React from 'react';
import { Star } from 'lucide-react';

const badgeColors = {
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

// Badge component
export function Badge({ color = 'gray', children, className = '', style }) {
  const colorClass = badgeColors[color] || badgeColors.gray;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap border ${colorClass} ${className}`} style={style}>
      {children}
    </span>
  );
}

// Button
export function Btn({ children, className = '', ...props }) {
  // Determine variant based on className for backward compatibility during transition
  const isPrimary = className.includes('primary');
  const isGhost = className.includes('ghost');
  const isSmall = className.includes('small');

  let baseClass = 'inline-flex items-center justify-center gap-2 font-bold border transition-all duration-200 ';
  
  if (isSmall) {
    baseClass += 'min-h-[30px] px-2.5 py-1.5 rounded-lg text-xs ';
  } else {
    baseClass += 'min-h-[38px] px-3.5 py-2 rounded-lg text-sm ';
  }

  if (isPrimary) {
    baseClass += 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 ';
  } else if (isGhost) {
    baseClass += 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100 ';
  } else {
    baseClass += 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 ';
  }

  return <button className={`${baseClass} ${className.replace(/primary|ghost|small|btn/g, '').trim()}`} {...props}>{children}</button>;
}

// Card
export function Card({ children, className = '', ...props }) {
  const isClickable = className.includes('clickable') || props.onClick;
  return (
    <div 
      className={`bg-white border border-slate-200 rounded-lg shadow-sm p-4 ${isClickable ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md' : ''} ${className.replace('clickable', '').trim()}`} 
      {...props}
    >
      {children}
    </div>
  );
}

// Stars rating
export function Stars({ rating, size = 14, onRate }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'}
          className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          onClick={() => onRate?.(i)}
        />
      ))}
    </span>
  );
}

// KPI Card
export function KpiCard({ label, value, sub, icon: Icon, color = '#2563eb', bg = '#dbeafe', onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start gap-3 h-full">
        <div className="flex-1 flex flex-col justify-between h-full min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">{label}</div>
          <div>
            <div className="text-[32px] font-black tracking-tight leading-none text-slate-900">{value}</div>
            {sub && <div className="text-[12px] font-medium text-slate-500 mt-1.5">{sub}</div>}
          </div>
        </div>
        <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: bg, color }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// MiniKpi
export function MiniKpi({ label, value, color = '#0e1726' }) {
  return (
    <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-2.5">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[17px] font-extrabold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}

// Relevance Bar
export function RelevanceBar({ score }) {
  const color = score < 40 ? '#dc2626' : score < 70 ? '#d97706' : '#16a34a';
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg,${color},${color}aa)` }} />
      </div>
      <span className="text-[11px] font-extrabold min-w-[32px]" style={{ color }}>{score}%</span>
    </div>
  );
}

// Countdown Badge
import { daysFromNow } from '../../utils/helpers';
export function CountdownBadge({ dateStr, days: daysProp, expired = false }) {
  const days = typeof daysProp === 'number' ? daysProp : daysFromNow(dateStr);
  if (expired || days < 0) return <Badge color="red">{`${Math.abs(days)} hari lewat`}</Badge>;
  if (days === 0) return <Badge color="red">Hari ini</Badge>;
  const color = days <= 3 ? 'red' : days <= 7 ? 'amber' : 'green';
  return <Badge color={color}>{`${days} hari lagi`}</Badge>;
}

// PageTitle
export function PageTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
