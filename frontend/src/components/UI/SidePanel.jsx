import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * SidePanel Component - Enhanced with accessibility features
 * 
 * @param {boolean} open - Control panel visibility
 * @param {Function} onClose - Close callback
 * @param {string} title - Panel title
 * @param {React.ReactNode} children - Panel content
 */
export default function SidePanel({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Prevent body scroll and manage focus
  useEffect(() => {
    if (open) {
      // Save current active element
      previousActiveElement.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus panel after animation
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [open]);
  
  // Handle ESC key
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);
  
  // Focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
    
    const panel = panelRef.current;
    const focusableElements = panel.querySelectorAll(
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
    
    panel.addEventListener('keydown', handleTab);
    return () => panel.removeEventListener('keydown', handleTab);
  }, [open]);

  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <aside 
        ref={panelRef}
        className="relative w-full max-w-[500px] h-full bg-white shadow-[-10px_0_40px_rgba(15,23,42,0.16)] flex flex-col sm:rounded-l-2xl overflow-hidden animate-[slideIn_0.25s_cubic-bezier(0.34,1.4,0.64,1)]"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
          <h3 
            id="panel-title"
            className="font-extrabold text-[13px] text-slate-500 uppercase tracking-wide"
          >
            {title || 'Detail'}
          </h3>
          <button 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
            onClick={onClose} 
            aria-label="Tutup panel"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 pb-20">
          {children}
        </div>
      </aside>
    </div>
  );
}
