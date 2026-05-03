import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Modal Component - Enhanced with accessibility and animations
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {Function} props.onClose - Close callback
 * @param {'sm'|'md'|'lg'|'xl'|'full'} props.size - Modal size
 * @param {boolean} props.closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} props.closeOnEsc - Close when pressing ESC
 * @param {boolean} props.showCloseButton - Show close button in header
 * @param {string} props.className - Additional CSS classes
 */
const Modal = ({
  children,
  isOpen = false,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Save current active element
    previousActiveElement.current = document.activeElement;
    
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Focus modal
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => {
      document.body.style.overflow = originalOverflow;
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);
  
  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };
  
  return createPortal(
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeStyles[size]} max-h-[90vh] flex flex-col animate-slideUp ${className}`}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/**
 * ModalHeader - Header section with title and close button
 */
export const ModalHeader = ({
  children,
  onClose,
  showCloseButton = true,
  className = '',
}) => (
  <div className={`flex items-center justify-between p-6 border-b border-slate-200 ${className}`}>
    <div className="flex-1 pr-4">{children}</div>
    {showCloseButton && onClose && (
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Close modal"
      >
        <X size={20} />
      </button>
    )}
  </div>
);

/**
 * ModalTitle - Title in modal header
 */
export const ModalTitle = ({ children, className = '' }) => (
  <h2 className={`text-xl font-bold text-slate-900 ${className}`}>
    {children}
  </h2>
);

/**
 * ModalDescription - Description in modal header
 */
export const ModalDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-600 mt-1 ${className}`}>
    {children}
  </p>
);

/**
 * ModalBody - Main content section with scroll
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto p-6 ${className}`}>
    {children}
  </div>
);

/**
 * ModalFooter - Footer section with actions
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 p-6 border-t border-slate-200 ${className}`}>
    {children}
  </div>
);

/**
 * ConfirmDialog - Specialized modal for confirmations
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}) => {
  const variantStyles = {
    danger: 'danger',
    primary: 'primary',
    success: 'success',
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader onClose={onClose}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <p className="text-sm text-slate-700">{message}</p>
      </ModalBody>
      
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="h-10 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`h-10 px-4 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50 ${
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : variant === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </span>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Add animations to global CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 200ms ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 300ms ease-out;
  }
`;
document.head.appendChild(style);

export default Modal;
