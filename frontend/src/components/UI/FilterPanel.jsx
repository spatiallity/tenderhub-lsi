import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter as FilterIcon } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

/**
 * FilterPanel Component - Collapsible filter panel with groups
 * 
 * @param {Object} props
 * @param {Array} props.filterGroups - Array of filter group objects
 * @param {Object} props.activeFilters - Active filter values
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Function} props.onClearAll - Clear all filters handler
 * @param {boolean} props.collapsible - Enable collapsible groups
 * @param {boolean} props.showActiveCount - Show active filter count
 * @param {string} props.className - Additional CSS classes
 */
const FilterPanel = ({
  filterGroups = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  collapsible = true,
  showActiveCount = true,
  className = '',
}) => {
  const [expandedGroups, setExpandedGroups] = useState(
    new Set(filterGroups.map((g) => g.id))
  );
  
  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(
    (value) => value && value !== 'Semua' && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;
  
  // Toggle group expansion
  const toggleGroup = (groupId) => {
    if (!collapsible) return;
    
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };
  
  // Handle filter change
  const handleFilterChange = (filterId, value) => {
    onFilterChange?.({ ...activeFilters, [filterId]: value });
  };
  
  // Handle clear all
  const handleClearAll = () => {
    const clearedFilters = {};
    filterGroups.forEach((group) => {
      group.filters.forEach((filter) => {
        clearedFilters[filter.id] = filter.type === 'checkbox' ? [] : 'Semua';
      });
    });
    onClearAll?.(clearedFilters);
  };
  
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Filter</h3>
          {showActiveCount && activeFilterCount > 0 && (
            <Badge color="blue" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Hapus Semua
          </button>
        )}
      </div>
      
      {/* Filter Groups */}
      <div className="divide-y divide-slate-200">
        {filterGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          
          return (
            <div key={group.id}>
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between p-4 text-left ${collapsible ? 'hover:bg-slate-50' : ''} transition-colors`}
                disabled={!collapsible}
              >
                <span className="text-sm font-semibold text-slate-900">
                  {group.label}
                </span>
                {collapsible && (
                  <span className="text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </button>
              
              {/* Group Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {group.filters.map((filter) => (
                    <FilterInput
                      key={filter.id}
                      filter={filter}
                      value={activeFilters[filter.id]}
                      onChange={(value) => handleFilterChange(filter.id, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * FilterInput - Individual filter input component
 */
const FilterInput = ({ filter, value, onChange }) => {
  switch (filter.type) {
    case 'select':
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {filter.label}
          </label>
          <select
            value={value || 'Semua'}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Semua">Semua</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    
    case 'checkbox':
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            {filter.label}
          </label>
          <div className="space-y-2">
            {filter.options?.map((option) => {
              const isChecked = Array.isArray(value) && value.includes(option.value);
              
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        newValue.push(option.value);
                      } else {
                        const index = newValue.indexOf(option.value);
                        if (index > -1) newValue.splice(index, 1);
                      }
                      onChange(newValue);
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    
    case 'range':
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {filter.label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) => onChange({ ...value, min: e.target.value })}
              className="flex-1 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) => onChange({ ...value, max: e.target.value })}
              className="flex-1 h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );
    
    case 'toggle':
      return (
        <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
          <span className="text-sm font-semibold text-slate-700">{filter.label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={value || false}
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      );
    
    default:
      return null;
  }
};

/**
 * ActiveFilters - Display active filters as removable badges
 */
export const ActiveFilters = ({ 
  filters = {}, 
  filterGroups = [],
  onRemove,
  onClearAll,
  className = '' 
}) => {
  const activeFilters = [];
  
  filterGroups.forEach((group) => {
    group.filters.forEach((filter) => {
      const value = filters[filter.id];
      
      if (!value || value === 'Semua' || value === '' || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      
      if (filter.type === 'checkbox' && Array.isArray(value)) {
        value.forEach((v) => {
          const option = filter.options?.find((o) => o.value === v);
          if (option) {
            activeFilters.push({
              id: filter.id,
              value: v,
              label: `${filter.label}: ${option.label}`,
            });
          }
        });
      } else if (filter.type === 'range') {
        if (value.min || value.max) {
          activeFilters.push({
            id: filter.id,
            value: value,
            label: `${filter.label}: ${value.min || '0'} - ${value.max || '∞'}`,
          });
        }
      } else if (filter.type === 'toggle') {
        if (value) {
          activeFilters.push({
            id: filter.id,
            value: value,
            label: filter.label,
          });
        }
      } else {
        const option = filter.options?.find((o) => o.value === value);
        if (option) {
          activeFilters.push({
            id: filter.id,
            value: value,
            label: `${filter.label}: ${option.label}`,
          });
        }
      }
    });
  });
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-slate-600">Filter Aktif:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.id}-${filter.value}-${index}`}
          color="blue"
          removable
          onRemove={() => onRemove?.(filter.id, filter.value)}
        >
          {filter.label}
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Hapus Semua
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
