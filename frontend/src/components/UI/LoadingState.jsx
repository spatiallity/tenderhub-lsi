import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner Component - Loading spinner with sizes
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeStyles[size]} ${className}`}
    />
  );
};

/**
 * LoadingOverlay - Full-screen loading overlay
 */
export const LoadingOverlay = ({ message = 'Memuat...', transparent = false }) => (
  <div className={`fixed inset-0 z-[1040] flex items-center justify-center ${transparent ? 'bg-white/80' : 'bg-white'} backdrop-blur-sm`}>
    <div className="text-center">
      <Spinner size="xl" />
      <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p>
    </div>
  </div>
);

/**
 * LoadingCard - Loading state for cards
 */
export const LoadingCard = ({ className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm ${className}`}>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
);

/**
 * Skeleton - Generic skeleton loader
 */
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  variant = 'text' 
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  return (
    <div
      className={`bg-slate-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * SkeletonTable - Loading state for tables
 */
export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
    {/* Header */}
    <div className="border-b border-slate-200 bg-slate-50 p-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="100%" height="1rem" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-slate-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} width="100%" height="1rem" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * SkeletonCard - Loading state for card with avatar
 */
export const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
    <div className="animate-pulse">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.875rem" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height="0.75rem" />
        <Skeleton width="80%" height="0.75rem" />
      </div>
    </div>
  </div>
);

/**
 * LoadingButton - Button with loading state
 */
export const LoadingButton = ({ 
  loading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 ${className}`}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);

/**
 * LoadingSection - Loading state for page sections
 */
export const LoadingSection = ({ 
  title, 
  description,
  rows = 3,
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <div className="space-y-2">
        <Skeleton width="200px" height="1.5rem" />
        {description && <Skeleton width="300px" height="1rem" />}
      </div>
    )}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  </div>
);

/**
 * InlineLoader - Small inline loading indicator
 */
export const InlineLoader = ({ text = 'Memuat...', className = '' }) => (
  <div className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
    <Spinner size="sm" />
    <span>{text}</span>
  </div>
);

export default Spinner;
