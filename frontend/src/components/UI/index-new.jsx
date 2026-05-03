/**
 * Enhanced UI Component Library
 * 
 * This is the new component library with improved design system.
 * Import from this file to use the enhanced components.
 * 
 * Usage:
 * import { Button, Badge, Input, Card, Modal } from '@/components/UI/index-new';
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
  Spinner,
  LoadingOverlay,
  LoadingCard,
  Skeleton,
  TableSkeleton,
  ListSkeleton,
  CardGridSkeleton,
  PageLoader,
  InlineLoader,
  ButtonLoader,
} from './LoadingState';
export {
  default as EmptyState,
  NoResults,
  NoData,
  ErrorState,
  NoTenders,
  NoExperts,
  NoRUP,
  NoActivity,
  NoFilters,
  ComingSoon,
} from './EmptyState';

// Data Display Components
export { default as Table, TableActions, MobileCard } from './Table';
export { default as FilterPanel, ActiveFilters, MobileFilterDrawer } from './FilterPanel';

// Design Tokens
export { default as designTokens } from '../../styles/design-tokens';

/**
 * Component Usage Examples:
 * 
 * // Button
 * <Button variant="primary" size="md" loading={false}>
 *   Click Me
 * </Button>
 * 
 * // Badge
 * <Badge color="blue" size="md" dot removable onRemove={() => {}}>
 *   Label
 * </Badge>
 * 
 * // Input
 * <Input
 *   label="Email"
 *   error="Invalid email"
 *   hint="Enter your email address"
 *   leftIcon={<Mail />}
 * />
 * 
 * // Card
 * <Card variant="elevated">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 *   <CardFooter>Footer</CardFooter>
 * </Card>
 * 
 * // Modal
 * <Modal isOpen={true} onClose={() => {}} size="md">
 *   <ModalHeader onClose={() => {}}>
 *     <ModalTitle>Title</ModalTitle>
 *   </ModalHeader>
 *   <ModalBody>Content</ModalBody>
 *   <ModalFooter>
 *     <Button>Action</Button>
 *   </ModalFooter>
 * </Modal>
 * 
 * // Toast
 * const { success, error, warning, info } = useToast();
 * success('Success!', 'Operation completed successfully');
 * 
 * // Table
 * <Table
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email' },
 *   ]}
 *   data={data}
 *   loading={false}
 *   selectable
 *   onRowClick={(row) => {}}
 * />
 * 
 * // FilterPanel
 * <FilterPanel
 *   filterGroups={[
 *     {
 *       id: 'basic',
 *       label: 'Basic Filters',
 *       filters: [
 *         { id: 'search', type: 'search', label: 'Search' },
 *         { id: 'status', type: 'select', label: 'Status', options: [...] },
 *       ],
 *     },
 *   ]}
 *   activeFilters={{}}
 *   onFilterChange={(filters) => {}}
 * />
 */
