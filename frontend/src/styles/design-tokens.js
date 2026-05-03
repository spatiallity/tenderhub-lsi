/**
 * Design Tokens - Single Source of Truth for Design System
 * All colors, spacing, typography, and other design values centralized here
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Portfolio Colors
  portfolio: {
    FLP: {
      light: '#dbeafe',
      main: '#2563eb',
      dark: '#1d4ed8',
      text: '#1e40af',
    },
    SDA: {
      light: '#dcfce7',
      main: '#16a34a',
      dark: '#15803d',
      text: '#166534',
    },
    FITI: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      text: '#b45309',
    },
  },
  
  // Status Colors
  status: {
    success: {
      light: '#dcfce7',
      main: '#16a34a',
      dark: '#15803d',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#fee2e2',
      main: '#dc2626',
      dark: '#b91c1c',
    },
    info: {
      light: '#dbeafe',
      main: '#2563eb',
      dark: '#1d4ed8',
    },
  },
  
  // Internal Status Colors
  internalStatus: {
    'Dipantau': {
      bg: '#f1f5f9',
      text: '#64748b',
      border: '#cbd5e1',
    },
    'Akan Diikuti': {
      bg: '#fef3c7',
      text: '#b45309',
      border: '#fde68a',
    },
    'Sudah Diikuti': {
      bg: '#dcfce7',
      text: '#166534',
      border: '#bbf7d0',
    },
    'Menang': {
      bg: '#dcfce7',
      text: '#15803d',
      border: '#86efac',
    },
    'Kalah': {
      bg: '#fee2e2',
      text: '#b91c1c',
      border: '#fecaca',
    },
    'Tidak Relevan': {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#fca5a5',
    },
  },
  
  // Stage Colors
  stage: {
    gray: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    green: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    amber: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    red: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    cyan: { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
    indigo: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
    teal: { bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
  },
  
  // Level Colors
  level: {
    'K/L': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    'Provinsi': { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    'Kab/Kota': { bg: '#f0fdfa', text: '#115e59', border: '#99f6e4' },
  },
  
  // Availability Colors
  availability: {
    'Tersedia': { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    'Sedang Bertugas': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    'Tidak Tersedia': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic Colors
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  overlay: 'rgba(15, 23, 42, 0.5)',
  
  // Avatar Colors
  avatar: [
    '#2563eb', '#16a34a', '#d97706', '#7c3aed', 
    '#0e7490', '#be123c', '#0369a1', '#15803d'
  ],
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const typography = {
  fontFamily: {
    sans: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

// Helper function to get color with opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper function to get responsive value
export const responsive = (mobile, tablet, desktop) => ({
  base: mobile,
  md: tablet || mobile,
  lg: desktop || tablet || mobile,
});

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  breakpoints,
  zIndex,
  withOpacity,
  responsive,
};
