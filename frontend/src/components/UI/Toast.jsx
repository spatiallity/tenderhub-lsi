import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast Component - Enhanced notifications with variants and animations
 * 
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} props.variant - Toast variant
 * @param {string} props.title - Toast title
 * @param {string} props.message - Toast message
 * @param {number} props.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {Function} props.onClose - Close callback
 * @param {React.ReactNode} props.action - Action button
 * @param {boolean} props.showProgress - Show progress bar
 */
const Toast = ({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  // Variant config
  const variantConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      progressColor: 'bg-green-600',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      progressColor: 'bg-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-700',
      progressColor: 'bg-amber-600',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      progressColor: 'bg-blue-600',
    },
  };
  
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  // Auto-dismiss with progress
  useEffect(() => {
    if (duration === 0) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        handleClose();
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [duration]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation
  };
  
  if (!isVisible) return null;
  
  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-md animate-slideInRight ${config.bgColor} ${config.borderColor}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <Icon size={20} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-bold mb-0.5 ${config.titleColor}`}>
            {title}
          </p>
        )}
        {message && (
          <p className={`text-sm ${config.messageColor}`}>
            {message}
          </p>
        )}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
      
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className={`flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${config.iconColor}`}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
      
      {/* Progress bar */}
      {showProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${config.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * ToastContainer - Container for managing multiple toasts
 */
export const ToastContainer = ({ toasts = [], onRemove }) => {
  if (toasts.length === 0) return null;
  
  return createPortal(
    <div
      className="fixed top-4 right-4 z-[1080] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => onRemove?.(toast.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

/**
 * useToast Hook - Manage toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = (options) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...options };
    
    setToasts((prev) => [...prev, toast]);
    
    return id;
  };
  
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  
  const success = (title, message, options = {}) => {
    return showToast({ variant: 'success', title, message, ...options });
  };
  
  const error = (title, message, options = {}) => {
    return showToast({ variant: 'error', title, message, ...options });
  };
  
  const warning = (title, message, options = {}) => {
    return showToast({ variant: 'warning', title, message, ...options });
  };
  
  const info = (title, message, options = {}) => {
    return showToast({ variant: 'info', title, message, ...options });
  };
  
  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

// Add animation to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slideInRight {
    animation: slideInRight 300ms ease-out;
  }
`;
if (!document.querySelector('style[data-toast-styles]')) {
  style.setAttribute('data-toast-styles', 'true');
  document.head.appendChild(style);
}

export default Toast;
