import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreVertical } from 'lucide-react';
import { Skeleton } from './LoadingState';
import EmptyState from './EmptyState';

/**
 * Table Component - Enhanced reusable table with sorting, selection, and mobile view
 * 
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.sortable - Enable sorting
 * @param {boolean} props.selectable - Enable row selection
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {React.ReactNode} props.emptyState - Custom empty state
 * @param {boolean} props.stickyHeader - Sticky header on scroll
 * @param {boolean} props.mobileCards - Show as cards on mobile
 * @param {string} props.className - Additional CSS classes
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  sortable = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  emptyState,
  stickyHeader = true,
  mobileCards = true,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showScrollShadow, setShowScrollShadow] = useState({ left: false, right: false });
  const tableRef = useRef(null);
  
  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);
  
  // Handle row selection
  const handleSelectRow = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };
  
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(data.map((row, i) => row.id || i));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  };
  
  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setShowScrollShadow({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1,
      });
    };
    
    const table = tableRef.current;
    if (table) {
      handleScroll();
      table.addEventListener('scroll', handleScroll);
      return () => table.removeEventListener('scroll', handleScroll);
    }
  }, [data]);
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton width="80%" height="1rem" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton width="90%" height="1rem" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg">
        {emptyState || <EmptyState title="Tidak Ada Data" description="Belum ada data untuk ditampilkan." />}
      </div>
    );
  }
  
  return (
    <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}>
      {/* Desktop Table View */}
      <div className={`hidden md:block relative ${showScrollShadow.left ? 'shadow-scroll-left' : ''} ${showScrollShadow.right ? 'shadow-scroll-right' : ''}`}>
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-slate-50 border-b border-slate-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider ${col.sortable !== false && sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sortable !== false && sortable && (
                        <span className="text-slate-400">
                          {sortConfig.key === col.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData.map((row, rowIndex) => {
                const rowId = row.id || rowIndex;
                const isSelected = selectedRows.has(rowId);
                
                return (
                  <tr
                    key={rowId}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${isSelected ? 'bg-blue-50' : ''} transition-colors`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(rowId);
                          }}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-sm text-slate-900">
                        {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile Card View */}
      {mobileCards && (
        <div className="md:hidden divide-y divide-slate-200">
          {sortedData.map((row, rowIndex) => {
            const rowId = row.id || rowIndex;
            const isSelected = selectedRows.has(rowId);
            
            return (
              <div
                key={rowId}
                className={`p-4 ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <div className="mb-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(rowId);
                      }}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {columns.map((col, colIndex) => (
                    <div key={colIndex}>
                      <div className="text-xs font-semibold text-slate-600 mb-0.5">
                        {col.label}
                      </div>
                      <div className="text-sm text-slate-900">
                        {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Add scroll shadow styles
const style = document.createElement('style');
style.textContent = `
  .shadow-scroll-left::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
    pointer-events: none;
    z-index: 1;
  }
  
  .shadow-scroll-right::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to left, rgba(0,0,0,0.1), transparent);
    pointer-events: none;
    z-index: 1;
  }
`;
if (!document.querySelector('style[data-table-styles]')) {
  style.setAttribute('data-table-styles', 'true');
  document.head.appendChild(style);
}

export default Table;
