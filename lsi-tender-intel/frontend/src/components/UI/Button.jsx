import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component - Enhanced with better variants, sizes, and states
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'success'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Make button full width
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {string} props.className - Additional CSS classes
 */
const Button = forwardRef(({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 active:bg-slate-100',
    ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100 focus:ring-slate-500 active:bg-slate-200',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 focus:ring-red-500 active:bg-red-800',
    success: 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 focus:ring-green-500 active:bg-green-800',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-6 text-base rounded-xl',
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Icon size based on button size
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 18,
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 size={iconSize[size]} className="animate-spin" />
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
