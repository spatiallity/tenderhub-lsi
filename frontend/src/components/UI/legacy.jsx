/**
 * Legacy UI Components
 * 
 * @deprecated These components are kept for backward compatibility only.
 * Please use the new components from the design system instead.
 */

import React from 'react';
import { Star } from 'lucide-react';

/**
 * @deprecated Use new Button component instead
 */
export function Btn({ children, className = '', ...props }) {
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

/**
 * @deprecated Use new Card component instead
 */
export function OldCard({ children, className = '', ...props }) {
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

/**
 * Stars rating component
 */
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

/**
 * RelevanceBar component
 */
export function RelevanceBar({ score, className = '' }) {
  const getColor = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-blue-500';
    if (s >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };
  
  const getTextColor = (s) => {
    if (s >= 80) return 'text-green-700';
    if (s >= 60) return 'text-blue-700';
    if (s >= 40) return 'text-amber-700';
    return 'text-slate-700';
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${getTextColor(score)} min-w-[2.5rem] text-right`}>
        {score}%
      </span>
    </div>
  );
}

/**
 * PageTitle component
 * Supports both legacy props (children, action) and new props (title, right)
 */
export function PageTitle({ children, title, subtitle, action, right, className = '' }) {
  const heading = title || children;
  const actionContent = right || action;
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 ${className}`}>
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">{heading}</h1>
        {subtitle && <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actionContent && <div className="shrink-0">{actionContent}</div>}
    </div>
  );
}
