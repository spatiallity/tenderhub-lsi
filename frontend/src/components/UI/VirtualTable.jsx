import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * VirtualTable Component - High-performance table with virtual scrolling
 * Only renders visible rows, dramatically improving performance for large datasets
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Column definitions
 * @param {number} props.rowHeight - Height of each row in pixels (default: 60)
 * @param {number} props.overscan - Number of extra rows to render (default: 5)
 * @param {Function} props.onRowClick - Callback when row is clicked
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * const columns = [
 *   { key: 'name', label: 'Name', width: '40%' },
 *   { key: 'agency', label: 'Agency', width: '30%' },
 *   { key: 'value', label: 'Value', width: '30%', render: (row) => formatCurrency(row.value) }
 * ];
 * 
 * <VirtualTable 
 *   data={tenders} 
 *   columns={columns} 
 *   rowHeight={60}
 *   onRowClick={(row) => console.log(row)}
 * />
 */
const VirtualTable = ({
  data = [],
  columns = [],
  rowHeight = 60,
  overscan = 5,
  onRowClick,
  className = '',
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Calculate visible range
  const { visibleStart, visibleEnd, totalHeight, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const end = Math.min(data.length, start + visibleCount + overscan * 2);
    
    return {
      visibleStart: start,
      visibleEnd: end,
      totalHeight: data.length * rowHeight,
      offsetY: start * rowHeight,
    };
  }, [scrollTop, containerHeight, rowHeight, data.length, overscan]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [data, sortConfig]);
  
  // Get visible rows
  const visibleRows = useMemo(() => {
    return sortedData.slice(visibleStart, visibleEnd);
  }, [sortedData, visibleStart, visibleEnd]);
  
  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Measure container height
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return (
    <div className={`flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-xs text-slate-700 uppercase tracking-wide ${
              column.sortable !== false ? 'cursor-pointer hover:bg-slate-100' : ''
            }`}
            style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <span>{column.label}</span>
            {column.sortable !== false && sortConfig.key === column.key && (
              <span className="text-blue-600">
                {sortConfig.direction === 'asc' ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* Virtual scroll container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ height: '600px', maxHeight: '70vh' }}
      >
        {/* Spacer for total height */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {/* Visible rows */}
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleRows.map((row, index) => {
              const actualIndex = visibleStart + index;
              
              return (
                <div
                  key={row.id || actualIndex}
                  className={`flex items-center border-b border-slate-100 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''
                  }`}
                  style={{ height: `${rowHeight}px` }}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-3 text-sm text-slate-700 truncate"
                      style={{ width: column.width || 'auto', flex: column.flex || 'none' }}
                      title={column.render ? undefined : row[column.key]}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <span>
          Menampilkan {visibleStart + 1}-{Math.min(visibleEnd, data.length)} dari {data.length} baris
        </span>
        <span className="text-slate-500">
          Virtual scrolling aktif
        </span>
      </div>
    </div>
  );
};

export default VirtualTable;
