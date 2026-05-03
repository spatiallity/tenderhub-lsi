import React, { forwardRef } from 'react';
import { AlertCircle, Search } from 'lucide-react';

/**
 * Input Component - Enhanced with validation, icons, and better states
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Helper text
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 * @param {boolean} props.fullWidth - Make input full width
 * @param {'sm'|'md'|'lg'} props.size - Input size
 * @param {string} props.className - Additional CSS classes
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };
  
  // Padding based on icons
  const paddingLeft = leftIcon ? 'pl-10' : 'pl-3';
  const paddingRight = rightIcon ? 'pr-10' : 'pr-3';
  
  // Base input styles
  const baseStyles = `w-full rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${paddingLeft} ${paddingRight}`;
  
  // State styles
  const stateStyles = hasError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 hover:border-slate-400';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${stateStyles}`}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        
        {rightIcon && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
        
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          className="mt-1.5 text-xs text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * SearchInput - Specialized input for search with debounce
 */
export const SearchInput = forwardRef(({
  value,
  onChange,
  onClear,
  placeholder = 'Cari...',
  debounce = 300,
  className = '',
  ...props
}, ref) => {
  const [localValue, setLocalValue] = React.useState(value || '');
  const timeoutRef = React.useRef(null);
  
  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounce);
  };
  
  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
  };
  
  return (
    <div className={`relative ${className}`}>
      <Input
        ref={ref}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={<Search size={18} />}
        {...props}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

/**
 * Select Component - Enhanced dropdown
 */
export const Select = forwardRef(({
  label,
  error,
  hint,
  fullWidth = false,
  size = 'md',
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };
  
  // Base select styles
  const baseStyles = `w-full rounded-lg border bg-white px-3 pr-10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${sizeStyles[size]}`;
  
  // State styles
  const stateStyles = hasError
    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500 hover:border-slate-400';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`${baseStyles} ${stateStyles}`}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          {...props}
        >
          {children}
        </select>
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p
          id={`${selectId}-hint`}
          className="mt-1.5 text-xs text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

/**
 * Textarea Component
 */
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  fullWidth = false,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Base textarea styles
  const baseStyles = 'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-y';
  
  // State styles
  const stateStyles = hasError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 hover:border-slate-400';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${baseStyles} ${stateStyles}`}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        {...props}
      />
      
      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1"
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p
          id={`${textareaId}-hint`}
          className="mt-1.5 text-xs text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
