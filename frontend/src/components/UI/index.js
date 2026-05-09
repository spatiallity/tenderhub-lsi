/**
 * UI Component Library - Enhanced Design System
 * 
 * This file exports all reusable UI components for the TenderHub application.
 * All components follow consistent design tokens and accessibility standards.
 */

// Core Components
export { default as Button } from './Button';
export { default as Badge, CountdownBadge, StatusBadge, PortfolioBadge, LevelBadge } from './Badge';
export { default as Input, SearchInput, Select, Textarea } from './Input';
export { default as Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter, KpiCard, MiniKpi } from './Card';
export { default as Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ConfirmDialog } from './Modal';

// Feedback Components
export { default as Toast, ToastContainer, useToast } from './Toast';
export { 
  default as Spinner,
  LoadingOverlay,
  LoadingCard,
  Skeleton,
  SkeletonTable,
  SkeletonCard,
  LoadingButton,
  LoadingSection,
  InlineLoader
} from './LoadingState';
export {
  default as EmptyState,
  NoResults,
  NoData,
  ErrorState,
  NoTenders,
  NoExperts,
  NoRup,
  NoActivity,
  NoChartData,
  ComingSoon
} from './EmptyState';

// Data Display Components
export { default as Table } from './Table';
export { default as FilterPanel, ActiveFilters } from './FilterPanel';
export { default as SidePanel } from './SidePanel';
export { default as GlobalSearch } from './GlobalSearch';
export { default as SkipToContent } from './SkipToContent';
export { default as VirtualTable } from './VirtualTable';
export { default as ClaimBadge } from './ClaimBadge';
export { default as LazyImage, LazyBackgroundImage } from './LazyImage';
export { default as LiveRegion, useLiveRegion } from './LiveRegion';

// Legacy Components - Import from separate file
export { Btn, OldCard, Stars, RelevanceBar, PageTitle } from './legacy';

// Re-export design tokens for convenience
export { colors, spacing, borderRadius, shadows, typography, transitions, breakpoints, zIndex } from '../../styles/design-tokens';
