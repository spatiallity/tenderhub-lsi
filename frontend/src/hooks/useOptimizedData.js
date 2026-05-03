import { useMemo, useCallback } from 'react';

/**
 * useOptimizedData Hook - Memoize expensive data transformations
 * Prevents unnecessary recalculations and re-renders
 * 
 * @param {Array} data - Raw data array
 * @param {Function} transformer - Function to transform data
 * @param {Array} dependencies - Dependencies for memoization
 * 
 * @returns {Array} Transformed data
 * 
 * @example
 * const enrichedTenders = useOptimizedData(
 *   tenders,
 *   (data) => data.map(t => ({ ...t, enriched: true })),
 *   [tenders]
 * );
 */
export const useOptimizedData = (data, transformer, dependencies = []) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return transformer(data);
  }, [data, ...dependencies]);
};

/**
 * useFilteredData Hook - Optimized filtering with memoization
 * 
 * @param {Array} data - Data to filter
 * @param {Object} filters - Filter criteria
 * @param {Function} filterFn - Custom filter function
 * 
 * @returns {Array} Filtered data
 * 
 * @example
 * const filteredTenders = useFilteredData(
 *   tenders,
 *   { portfolio: 'FLP', minValue: 1000000 },
 *   (item, filters) => {
 *     if (filters.portfolio && item.recommendation !== filters.portfolio) return false;
 *     if (filters.minValue && item.hps < filters.minValue) return false;
 *     return true;
 *   }
 * );
 */
export const useFilteredData = (data, filters, filterFn) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter((item) => filterFn(item, filters));
  }, [data, filters, filterFn]);
};

/**
 * useSortedData Hook - Optimized sorting with memoization
 * 
 * @param {Array} data - Data to sort
 * @param {string} sortKey - Key to sort by
 * @param {string} sortDirection - 'asc' or 'desc'
 * 
 * @returns {Array} Sorted data
 * 
 * @example
 * const sortedTenders = useSortedData(tenders, 'hps', 'desc');
 */
export const useSortedData = (data, sortKey, sortDirection = 'asc') => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!sortKey) return data;
    
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [data, sortKey, sortDirection]);
};

/**
 * usePaginatedData Hook - Optimized pagination
 * 
 * @param {Array} data - Data to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} pageSize - Items per page
 * 
 * @returns {Object} { data, totalPages, hasNext, hasPrev }
 * 
 * @example
 * const { data: pageData, totalPages, hasNext } = usePaginatedData(tenders, 1, 20);
 */
export const usePaginatedData = (data, page = 1, pageSize = 20) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return { data: [], totalPages: 0, hasNext: false, hasPrev: false };
    }
    
    const totalPages = Math.ceil(data.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = data.slice(start, end);
    
    return {
      data: paginatedData,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      currentPage: page,
      totalItems: data.length,
    };
  }, [data, page, pageSize]);
};

/**
 * useGroupedData Hook - Group data by key with memoization
 * 
 * @param {Array} data - Data to group
 * @param {string|Function} groupBy - Key or function to group by
 * 
 * @returns {Object} Grouped data
 * 
 * @example
 * const groupedByPortfolio = useGroupedData(tenders, 'recommendation');
 * // Returns: { FLP: [...], SDA: [...], FITI: [...] }
 * 
 * const groupedByValue = useGroupedData(tenders, (t) => t.hps > 1000000 ? 'high' : 'low');
 * // Returns: { high: [...], low: [...] }
 */
export const useGroupedData = (data, groupBy) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    
    const grouped = {};
    const getKey = typeof groupBy === 'function' ? groupBy : (item) => item[groupBy];
    
    data.forEach((item) => {
      const key = getKey(item);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return grouped;
  }, [data, groupBy]);
};

/**
 * useSearchData Hook - Optimized search with debouncing
 * 
 * @param {Array} data - Data to search
 * @param {string} query - Search query
 * @param {Array} searchKeys - Keys to search in
 * 
 * @returns {Array} Filtered data
 * 
 * @example
 * const searchResults = useSearchData(
 *   tenders,
 *   searchQuery,
 *   ['name', 'agency', 'location']
 * );
 */
export const useSearchData = (data, query, searchKeys = []) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!query || query.trim() === '') return data;
    
    const lowerQuery = query.toLowerCase();
    
    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (!value) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, query, searchKeys]);
};

/**
 * useAggregatedData Hook - Calculate aggregations with memoization
 * 
 * @param {Array} data - Data to aggregate
 * @param {Object} aggregations - Aggregation definitions
 * 
 * @returns {Object} Aggregated results
 * 
 * @example
 * const stats = useAggregatedData(tenders, {
 *   total: (data) => data.length,
 *   totalValue: (data) => data.reduce((sum, t) => sum + t.hps, 0),
 *   avgValue: (data) => data.reduce((sum, t) => sum + t.hps, 0) / data.length,
 * });
 * // Returns: { total: 100, totalValue: 50000000, avgValue: 500000 }
 */
export const useAggregatedData = (data, aggregations) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    
    const results = {};
    
    Object.entries(aggregations).forEach(([key, aggregateFn]) => {
      results[key] = aggregateFn(data);
    });
    
    return results;
  }, [data, aggregations]);
};

/**
 * useOptimizedCallback Hook - Memoize callbacks to prevent re-renders
 * 
 * @param {Function} callback - Callback function
 * @param {Array} dependencies - Dependencies
 * 
 * @returns {Function} Memoized callback
 * 
 * @example
 * const handleClick = useOptimizedCallback(
 *   (id) => setSelectedId(id),
 *   [setSelectedId]
 * );
 */
export const useOptimizedCallback = (callback, dependencies = []) => {
  return useCallback(callback, dependencies);
};

export default {
  useOptimizedData,
  useFilteredData,
  useSortedData,
  usePaginatedData,
  useGroupedData,
  useSearchData,
  useAggregatedData,
  useOptimizedCallback,
};
