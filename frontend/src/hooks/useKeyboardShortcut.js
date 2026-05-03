import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * 
 * @param {string} key - Key to listen for (e.g., 'k', 'Escape')
 * @param {Function} callback - Function to call when shortcut is triggered
 * @param {Object} options - Options for the shortcut
 * @param {boolean} options.ctrl - Require Ctrl key (Windows/Linux)
 * @param {boolean} options.meta - Require Cmd key (Mac)
 * @param {boolean} options.shift - Require Shift key
 * @param {boolean} options.alt - Require Alt key
 * @param {boolean} options.enabled - Enable/disable the shortcut
 * 
 * @example
 * // Global search with Cmd+K or Ctrl+K
 * useKeyboardShortcut('k', openSearch, { meta: true, ctrl: true });
 * 
 * // Close modal with ESC
 * useKeyboardShortcut('Escape', closeModal);
 */
const useKeyboardShortcut = (key, callback, options = {}) => {
  const {
    ctrl = false,
    meta = false,
    shift = false,
    alt = false,
    enabled = true,
  } = options;
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (event) => {
      // Check if the key matches
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      
      // Check if modifiers match
      const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
      const metaMatch = meta ? (event.metaKey || event.ctrlKey) : !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;
      
      // For Cmd+K or Ctrl+K, we want either Cmd OR Ctrl
      const modifierMatch = (ctrl || meta) 
        ? (event.ctrlKey || event.metaKey) && shiftMatch && altMatch
        : ctrlMatch && metaMatch && shiftMatch && altMatch;
      
      if (keyMatch && modifierMatch) {
        event.preventDefault();
        callback(event);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, meta, shift, alt, enabled]);
};

export default useKeyboardShortcut;
