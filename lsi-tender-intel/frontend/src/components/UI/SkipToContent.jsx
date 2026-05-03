import React from 'react';

/**
 * SkipToContent Component - Accessibility feature for keyboard navigation
 * Allows keyboard users to skip navigation and jump directly to main content
 * 
 * This link is visually hidden but becomes visible when focused via keyboard (Tab key)
 */
const SkipToContent = () => {
  const handleClick = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem 1.5rem',
        backgroundColor: '#2563eb',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      onFocus={(e) => {
        e.target.style.left = '1rem';
        e.target.style.top = '1rem';
      }}
      onBlur={(e) => {
        e.target.style.left = '-9999px';
      }}
    >
      Lewati ke konten utama
    </a>
  );
};

export default SkipToContent;
