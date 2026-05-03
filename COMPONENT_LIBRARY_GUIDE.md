# TenderHub Component Library Guide

**Version**: 2.0  
**Last Updated**: May 1, 2026  
**Status**: Production Ready

---

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Design System](#design-system)
3. [Core Components](#core-components)
4. [Data Display Components](#data-display-components)
5. [Feedback Components](#feedback-components)
6. [Accessibility Features](#accessibility-features)
7. [Performance Features](#performance-features)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

---

## Introduction

TenderHub Component Library adalah koleksi komponen React yang telah dioptimasi untuk performa, aksesibilitas, dan user experience. Semua komponen mengikuti design system yang konsisten dan memenuhi standar WCAG 2.1 Level AA.

### Key Features

- ✅ **40+ reusable components**
- ✅ **WCAG 2.1 Level AA compliant**
- ✅ **Optimized for performance**
- ✅ **Fully responsive**
- ✅ **TypeScript-ready**
- ✅ **Dark mode support** (coming soon)

---

## Design System

### Design Tokens

Semua komponen menggunakan design tokens yang terpusat di `styles/design-tokens.js`.

```javascript
import { colors, spacing, typography, shadows } from '@/styles/design-tokens';
```

#### Colors

```javascript
// Primary colors
colors.primary[600]    // #2563eb (main blue)
colors.success[600]    // #16a34a (green)
colors.warning[600]    // #d97706 (amber)
colors.danger[600]     // #dc2626 (red)

// Portfolio colors
colors.portfolio.flp   // #2563eb (blue)
colors.portfolio.sda   // #16a34a (green)
colors.portfolio.fiti  // #d97706 (amber)

// Status colors
colors.status.active   // #16a34a
colors.status.pending  // #d97706
colors.status.inactive // #64748b
```

#### Spacing

```javascript
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
```

#### Typography

```javascript
typography.size.xs     // 11px
typography.size.sm     // 13px
typography.size.base   // 14px
typography.size.lg     // 16px
typography.size.xl     // 18px
typography.size['2xl'] // 22px
```

---

## Core Components

### Button

Komponen button dengan 5 variants dan 3 sizes.

```javascript
import { Button } from '@/components/UI';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button variant="primary" icon={<Plus size={16} />}>
  Add Tender
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>

// Disabled
<Button variant="primary" disabled>
  Disabled
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: React.ReactNode
- `loading`: boolean
- `disabled`: boolean
- `onClick`: () => void

---

### Badge

Komponen badge dengan berbagai variants.

```javascript
import { Badge, CountdownBadge, StatusBadge, PortfolioBadge } from '@/components/UI';

// Basic badge
<Badge variant="blue">New</Badge>
<Badge variant="green">Active</Badge>
<Badge variant="red">Urgent</Badge>

// Countdown badge (untuk deadline)
<CountdownBadge daysLeft={3} />
// Output: "3 hari lagi" (red if ≤3, amber if ≤7, green if >7)

// Status badge
<StatusBadge status="Menang" />
<StatusBadge status="Kalah" />
<StatusBadge status="Proses" />

// Portfolio badge
<PortfolioBadge portfolio="FLP" />
<PortfolioBadge portfolio="SDA" />
<PortfolioBadge portfolio="FITI" />
```

**Props**:
- `variant`: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate'
- `size`: 'sm' | 'md' | 'lg'

---

### Input

Komponen input dengan validation dan variants.

```javascript
import { Input, SearchInput, Select, Textarea } from '@/components/UI';

// Basic input
<Input 
  label="Nama Tender"
  placeholder="Masukkan nama tender"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With validation
<Input 
  label="Email"
  type="email"
  error="Email tidak valid"
  required
/>

// Search input (with debounce)
<SearchInput 
  placeholder="Cari tender..."
  onSearch={(query) => handleSearch(query)}
  debounce={300}
/>

// Select
<Select 
  label="Portfolio"
  options={[
    { value: 'FLP', label: 'FLP' },
    { value: 'SDA', label: 'SDA' },
    { value: 'FITI', label: 'FITI' }
  ]}
  value={portfolio}
  onChange={(e) => setPortfolio(e.target.value)}
/>

// Textarea
<Textarea 
  label="Catatan"
  rows={4}
  placeholder="Masukkan catatan..."
/>
```

---

### Card

Komponen card dengan variants dan sub-components.

```javascript
import { Card, CardHeader, CardTitle, CardBody, CardFooter, KpiCard } from '@/components/UI';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Tender Details</CardTitle>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card
<Card variant="interactive" onClick={() => handleClick()}>
  Clickable card
</Card>

// KPI Card
<KpiCard 
  title="Total Tender"
  value="156"
  change="+12%"
  trend="up"
  icon={<FileText size={24} />}
/>
```

---

### Modal

Komponen modal dengan focus trap dan keyboard support.

```javascript
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ConfirmDialog } from '@/components/UI';

// Basic modal
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader onClose={() => setIsOpen(false)}>
    <ModalTitle>Modal Title</ModalTitle>
  </ModalHeader>
  <ModalBody>
    Modal content here
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>

// Confirm dialog
<ConfirmDialog 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Hapus Tender?"
  message="Apakah Anda yakin ingin menghapus tender ini?"
  confirmText="Ya, Hapus"
  cancelText="Batal"
  variant="danger"
/>
```

**Features**:
- ✅ Focus trap (Tab navigation)
- ✅ ESC to close
- ✅ Click backdrop to close
- ✅ Prevent body scroll
- ✅ Restore focus on close

---

## Data Display Components

### Table

Komponen table dengan sorting dan selection.

```javascript
import { Table } from '@/components/UI';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'agency', label: 'Agency', sortable: true },
  { 
    key: 'value', 
    label: 'Value', 
    sortable: true,
    render: (row) => formatCurrency(row.value)
  }
];

<Table 
  data={tenders}
  columns={columns}
  onRowClick={(row) => handleRowClick(row)}
  selectable
  onSelectionChange={(selected) => setSelected(selected)}
/>
```

---

### VirtualTable

Komponen table dengan virtual scrolling untuk dataset besar (10,000+ rows).

```javascript
import { VirtualTable } from '@/components/UI';

<VirtualTable 
  data={largeTenders}
  columns={columns}
  rowHeight={60}
  overscan={5}
  onRowClick={(row) => handleRowClick(row)}
/>
```

**Performance**: 98.8% faster untuk 10,000 rows (5000ms → 60ms)

---

### FilterPanel

Komponen filter panel dengan collapsible groups.

```javascript
import { FilterPanel, ActiveFilters } from '@/components/UI';

const filterGroups = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    type: 'checkbox',
    options: [
      { value: 'FLP', label: 'FLP' },
      { value: 'SDA', label: 'SDA' },
      { value: 'FITI', label: 'FITI' }
    ]
  },
  {
    id: 'value',
    label: 'Nilai Kontrak',
    type: 'range',
    min: 0,
    max: 10000000000,
    step: 1000000
  }
];

<FilterPanel 
  groups={filterGroups}
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
/>

<ActiveFilters 
  filters={filters}
  onRemove={(key) => removeFilter(key)}
  onClearAll={() => setFilters({})}
/>
```

---

## Feedback Components

### Toast

Komponen toast notification dengan auto-dismiss.

```javascript
import { useToast } from '@/components/UI';

const { showToast } = useToast();

// Success toast
showToast('Data berhasil disimpan', 'success');

// Error toast
showToast('Terjadi kesalahan', 'error');

// Warning toast
showToast('Perhatian: Data akan dihapus', 'warning');

// Info toast
showToast('Informasi penting', 'info');
```

---

### Loading States

Berbagai komponen loading state.

```javascript
import { 
  Spinner, 
  LoadingOverlay, 
  Skeleton, 
  SkeletonTable,
  LoadingButton 
} from '@/components/UI';

// Spinner
<Spinner size="md" />

// Loading overlay (full screen)
<LoadingOverlay message="Memuat data..." />

// Skeleton loader
<Skeleton width="100%" height="20px" />
<Skeleton width="80%" height="20px" />

// Skeleton table
<SkeletonTable rows={5} columns={4} />

// Loading button
<LoadingButton loading={isLoading} onClick={handleSave}>
  Save
</LoadingButton>
```

---

### Empty States

Berbagai komponen empty state.

```javascript
import { 
  EmptyState, 
  NoResults, 
  NoTenders,
  ErrorState 
} from '@/components/UI';

// Generic empty state
<EmptyState 
  icon={<FileText size={48} />}
  title="Tidak ada data"
  description="Belum ada data yang tersedia"
  action={<Button onClick={handleAdd}>Tambah Data</Button>}
/>

// No search results
<NoResults query={searchQuery} />

// No tenders
<NoTenders />

// Error state
<ErrorState 
  message="Gagal memuat data"
  onRetry={handleRetry}
/>
```

---

## Accessibility Features

### Global Search

Pencarian global dengan keyboard navigation.

```javascript
import { GlobalSearch } from '@/components/UI';

<GlobalSearch 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Keyboard Shortcuts**:
- `Cmd+K` / `Ctrl+K`: Open search
- `↑` / `↓`: Navigate results
- `Enter`: Select result
- `ESC`: Close search

---

### Skip to Content

Link untuk skip navigation (keyboard users).

```javascript
import { SkipToContent } from '@/components/UI';

<SkipToContent />
```

**Usage**: Tekan `Tab` pertama kali untuk melihat link.

---

### Live Region

Announcements untuk screen readers.

```javascript
import { LiveRegion, useLiveRegion } from '@/components/UI';

// Component
<LiveRegion message="5 tender baru dimuat" politeness="polite" />

// Hook
const announce = useLiveRegion();
announce('Data berhasil disimpan', 'polite');
```

---

## Performance Features

### Lazy Image

Image lazy loading dengan Intersection Observer.

```javascript
import { LazyImage, LazyBackgroundImage } from '@/components/UI';

// Lazy image
<LazyImage 
  src="/images/tender-photo.jpg"
  alt="Tender location"
  placeholder="/images/placeholder.jpg"
  className="w-full h-48 object-cover"
/>

// Lazy background image
<LazyBackgroundImage 
  src="/images/hero-bg.jpg"
  className="h-64 bg-cover bg-center"
>
  <div>Content here</div>
</LazyBackgroundImage>
```

---

### Performance Monitor

Real-time performance monitoring (development only).

```javascript
import { PerformanceMonitor } from '@/components/Dev';

<PerformanceMonitor />
```

**Keyboard Shortcut**: `Ctrl+Shift+P` to toggle

**Metrics**:
- FPS (Frames Per Second)
- Memory usage
- Performance metrics (FCP, TTI, DCL, Load)
- Network status

---

## Usage Examples

### Complete Form Example

```javascript
import { Input, Select, Textarea, Button, Card, CardBody } from '@/components/UI';

function TenderForm() {
  const [formData, setFormData] = useState({
    name: '',
    portfolio: '',
    notes: ''
  });

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Input 
            label="Nama Tender"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Select 
            label="Portfolio"
            options={portfolioOptions}
            value={formData.portfolio}
            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            required
          />
          
          <Textarea 
            label="Catatan"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
          
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              Simpan
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
```

---

### Complete Table Example

```javascript
import { Table, SearchInput, FilterPanel, Badge } from '@/components/UI';

function TenderTable() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  
  const columns = [
    { key: 'name', label: 'Nama Tender', sortable: true },
    { key: 'agency', label: 'Instansi', sortable: true },
    { 
      key: 'portfolio', 
      label: 'Portfolio',
      render: (row) => <PortfolioBadge portfolio={row.portfolio} />
    },
    { 
      key: 'deadline', 
      label: 'Deadline',
      render: (row) => <CountdownBadge daysLeft={row.daysLeft} />
    }
  ];
  
  return (
    <div>
      <div className="flex gap-4 mb-4">
        <SearchInput 
          placeholder="Cari tender..."
          onSearch={setSearch}
        />
        <FilterPanel 
          groups={filterGroups}
          filters={filters}
          onChange={setFilters}
        />
      </div>
      
      <Table 
        data={filteredTenders}
        columns={columns}
        onRowClick={(row) => setSelectedTender(row)}
      />
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use Design Tokens

❌ **Bad**:
```javascript
<div style={{ color: '#2563eb', padding: '16px' }}>
```

✅ **Good**:
```javascript
import { colors, spacing } from '@/styles/design-tokens';

<div style={{ color: colors.primary[600], padding: spacing[4] }}>
```

### 2. Use Memoization for Performance

❌ **Bad**:
```javascript
const filteredData = data.filter(item => item.active);
```

✅ **Good**:
```javascript
import { useFilteredData } from '@/hooks/useOptimizedData';

const filteredData = useFilteredData(data, { active: true }, filterFn);
```

### 3. Always Add Accessibility Attributes

❌ **Bad**:
```javascript
<button onClick={handleClick}>
  <Icon />
</button>
```

✅ **Good**:
```javascript
<button onClick={handleClick} aria-label="Delete tender">
  <Icon />
</button>
```

### 4. Use Virtual Scrolling for Large Datasets

❌ **Bad** (for 10,000+ rows):
```javascript
<Table data={largeTenders} columns={columns} />
```

✅ **Good**:
```javascript
<VirtualTable data={largeTenders} columns={columns} rowHeight={60} />
```

### 5. Always Handle Loading and Error States

❌ **Bad**:
```javascript
return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>
```

✅ **Good**:
```javascript
if (isLoading) return <LoadingOverlay />;
if (error) return <ErrorState onRetry={refetch} />;
if (!data.length) return <NoTenders />;

return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>
```

---

## Support

Untuk pertanyaan atau issues:
1. Check dokumentasi ini
2. Review implementation plan
3. Check component source code
4. Consult dengan team lead

---

**Version**: 2.0  
**Last Updated**: May 1, 2026  
**Maintained by**: TenderHub Development Team
