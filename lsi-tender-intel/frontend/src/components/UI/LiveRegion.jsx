import React, { useEffect, useRef } from 'react';

/**
 * LiveRegion Component - Accessibility feature for screen readers
 * Announces dynamic content changes to screen reader users
 * 
 * @param {Object} props
 * @param {string} props.message - Message to announce
 * @param {'polite'|'assertive'|'off'} props.politeness - Announcement priority
 * @param {boolean} props.clearOnUnmount - Clear message when component unmounts
 * 
 * @example
 * // Polite announcement (waits for user to finish current task)
 * <LiveRegion message="5 new tenders loaded" politeness="polite" />
 * 
 * // Assertive announcement (interrupts current task)
 * <LiveRegion message="Error: Failed to save" politeness="assertive" />
 */
const LiveRegion = ({ 
  message, 
  politeness = 'polite',
  clearOnUnmount = true 
}) => {
  const regionRef = useRef(null);
  
  useEffect(() => {
    if (regionRef.current && message) {
      // Clear and re-set message to trigger announcement
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);
  
  useEffect(() => {
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = '';
      }
    };
  }, [clearOnUnmount]);
  
  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
};

/**
 * useLiveRegion Hook - Programmatic live region announcements
 * 
 * @returns {Function} announce - Function to announce messages
 * 
 * @example
 * const announce = useLiveRegion();
 * 
 * // Announce a message
 * announce('Data loaded successfully');
 * 
 * // Announce with custom politeness
 * announce('Error occurred', 'assertive');
 */
export const useLiveRegion = () => {
  const regionRef = useRef(null);
  
  useEffect(() => {
    // Create live region if it doesn't exist
    if (!regionRef.current) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      document.body.appendChild(region);
      regionRef.current = region;
    }
    
    return () => {
      if (regionRef.current && document.body.contains(regionRef.current)) {
        document.body.removeChild(regionRef.current);
      }
    };
  }, []);
  
  const announce = (message, politeness = 'polite') => {
    if (!regionRef.current) return;
    
    // Update politeness level
    regionRef.current.setAttribute('aria-live', politeness);
    
    // Clear and re-set message to trigger announcement
    regionRef.current.textContent = '';
    setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = message;
      }
    }, 100);
  };
  
  return announce;
};

export default LiveRegion;
