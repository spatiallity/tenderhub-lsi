import React from 'react';

/**
 * Card Component - Enhanced with variants and sub-components
 * 
 * @param {Object} props
 * @param {'default'|'elevated'|'outlined'|'interactive'} props.variant - Card style variant
 * @param {boolean} props.loading - Show loading skeleton
 * @param {Function} props.onClick - Click handler (makes card interactive)
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
  children,
  variant = 'default',
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const isInteractive = !!onClick || variant === 'interactive';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white border-2 border-slate-200 shadow-sm',
    elevated: 'bg-white border-2 border-slate-200 shadow-md',
    outlined: 'bg-white border-2 border-slate-300',
    interactive: 'bg-white border-2 border-slate-200 shadow-sm',
  };
  
  // Interactive styles
  const interactiveStyles = isInteractive
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'
    : '';
  
  if (loading) {
    return (
      <div
        className={`rounded-lg p-4 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`rounded-lg p-4 ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * CardHeader - Header section of card
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-3 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * CardTitle - Title in card header
 */
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-base font-bold text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
);

/**
 * CardDescription - Description in card header
 */
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

/**
 * CardBody - Main content section of card
 */
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

/**
 * CardFooter - Footer section of card
 */
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t-2 border-slate-200 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * KpiCard - Specialized card for KPI metrics
 */
export const KpiCard = ({
  title,
  label, // alias for title
  value,
  sub,   // alias for subtitle
  subtitle,
  icon: Icon,
  color = 'blue',
  bg,    // custom bg color
  onClick,
  className = '',
}) => {
  const displayTitle = title || label;
  const displaySub = subtitle || sub;

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  
  const iconStyle = bg ? { backgroundColor: bg, color: color } : {};
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border-2 border-slate-100/50 shadow-sm flex justify-between items-start ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 truncate">
          {displayTitle}
        </div>
        <div className="text-[32px] font-black tracking-tight leading-none text-slate-900">
          {value}
        </div>
        {displaySub && (
          <div className="text-[12px] font-medium text-slate-500 mt-2 truncate">
            {displaySub}
          </div>
        )}
      </div>
      {Icon && (
        <div 
          className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center shrink-0 shadow-sm ${!bg ? colorStyles[color] : ''}`}
          style={iconStyle}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

/**
 * MiniKpi - Compact KPI display
 */
export const MiniKpi = ({ label, value, color = 'blue', className = '' }) => {
  const colorStyles = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };
  
  return (
    <div className={`${className}`}>
      <p className="text-xs font-semibold text-slate-600 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${colorStyles[color]}`}>{value}</p>
    </div>
  );
};

export default Card;
