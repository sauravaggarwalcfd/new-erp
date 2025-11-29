import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Group, X
} from "lucide-react";

/**
 * Reusable Table Controls Component
 * Provides filtering, sorting, and grouping for any data table
 * 
 * Usage:
 * import TableControls from "@/components/TableControls";
 * 
 * const { 
 *   processedData, 
 *   renderControls 
 * } = TableControls({
 *   data: yourDataArray,
 *   columns: [
 *     { name: 'fieldName', label: 'Field Label', type: 'text' },
 *     { name: 'status', label: 'Status', type: 'dropdown' }
 *   ]
 * });
 */

export default function TableControls({ data, columns }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: null, direction: null });
  const [groupBy, setGroupBy] = useState(null);
  const [subGroupBy, setSubGroupBy] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Apply search filter
  const applySearch = (items) => {
    if (!searchTerm) return items;

    return items.filter(item => {
      return columns.some(column => {
        const value = item[column.name];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  // Apply column filters
  const applyFilters = (items) => {
    let filtered = items;

    Object.keys(filters).forEach(fieldName => {
      const filterValue = filters[fieldName];
      if (filterValue) {
        filtered = filtered.filter(item => {
          const value = item[fieldName];
          if (value === undefined || value === null) return false;
          return value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  };

  // Apply sorting
  const applySorting = (items) => {
    if (!sortConfig.field) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.field] || "";
      const bValue = b[sortConfig.field] || "";

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Apply grouping with sub-grouping support
  const applyGrouping = (items) => {
    if (!groupBy) return { ungrouped: items };

    const grouped = items.reduce((acc, item) => {
      const groupValue = item[groupBy] || "Ungrouped";
      if (!acc[groupValue]) {
        acc[groupValue] = [];
      }
      acc[groupValue].push(item);
      return acc;
    }, {});

    // Apply sub-grouping if enabled
    if (subGroupBy) {
      const nestedGrouped = {};
      Object.keys(grouped).forEach(mainGroup => {
        nestedGrouped[mainGroup] = grouped[mainGroup].reduce((subAcc, item) => {
          const subGroupValue = item[subGroupBy] || "Ungrouped";
          if (!subAcc[subGroupValue]) {
            subAcc[subGroupValue] = [];
          }
          subAcc[subGroupValue].push(item);
          return subAcc;
        }, {});
      });
      return nestedGrouped;
    }

    return grouped;
  };

  // Handle filter change
  const handleFilterChange = (fieldName, value) => {
    setFilters({
      ...filters,
      [fieldName]: value
    });
  };

  // Handle sorting
  const handleSort = (fieldName) => {
    let direction = 'asc';
    if (sortConfig.field === fieldName) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({
      field: direction ? fieldName : null,
      direction: direction
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortConfig({ field: null, direction: null });
    setGroupBy(null);
    setSubGroupBy(null);
  };

  // Process data through all filters
  const searchedData = applySearch(data);
  const filteredData = applyFilters(searchedData);
  const sortedData = applySorting(filteredData);
  const groupedData = applyGrouping(sortedData);

  // Active filter count
  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length;
  
  // Check if using nested grouping
  const isNestedGrouping = groupBy && subGroupBy;

  // Get available sub-group columns (exclude the main group field)
  const subGroupColumns = columns.filter(c => 
    (c.type === 'dropdown' || c.type === 'text') && 
    c.name !== groupBy
  );

  // Render controls UI
  const renderControls = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={showFilterPanel ? "bg-blue-50 text-blue-600" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {columns.slice(0, 6).map(column => (
                  <div key={column.name} className="space-y-1">
                    <Label className="text-xs text-slate-600">{column.label}</Label>
                    <Input
                      placeholder={`Filter by ${column.label.toLowerCase()}...`}
                      value={filters[column.name] || ""}
                      onChange={(e) => handleFilterChange(column.name, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort and Group Controls */}
          <div className="flex items-center gap-4 pt-2 border-t flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <Label className="text-sm text-slate-600">Sort By:</Label>
              <select
                className="flex h-8 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={sortConfig.field || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSortConfig({ field: e.target.value, direction: 'asc' });
                  } else {
                    setSortConfig({ field: null, direction: null });
                  }
                }}
              >
                <option value="">None</option>
                {columns.map(column => (
                  <option key={column.name} value={column.name}>{column.label}</option>
                ))}
              </select>
              {sortConfig.field && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortConfig({
                    ...sortConfig,
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                  })}
                >
                  {sortConfig.direction === 'asc' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Group className="w-4 h-4 text-slate-400" />
              <Label className="text-sm text-slate-600">Group By:</Label>
              <select
                className="flex h-8 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={groupBy || ""}
                onChange={(e) => {
                  setGroupBy(e.target.value || null);
                  if (!e.target.value) {
                    setSubGroupBy(null); // Clear sub-group if main group is cleared
                  }
                }}
              >
                <option value="">None</option>
                {columns.filter(c => c.type === 'dropdown' || c.type === 'text').map(column => (
                  <option key={column.name} value={column.name}>{column.label}</option>
                ))}
              </select>
            </div>

            {/* Sub-Grouping Control */}
            {groupBy && (
              <div className="flex items-center gap-2">
                <Group className="w-4 h-4 text-slate-400" />
                <Label className="text-sm text-slate-600">Then By:</Label>
                <select
                  className="flex h-8 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  value={subGroupBy || ""}
                  onChange={(e) => setSubGroupBy(e.target.value || null)}
                >
                  <option value="">None</option>
                  {subGroupColumns.map(column => (
                    <option key={column.name} value={column.name}>{column.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="ml-auto text-sm text-slate-600">
              {sortedData.length} {sortedData.length === 1 ? 'record' : 'records'}
              {searchTerm || activeFilterCount > 0 ? ` (filtered from ${data.length})` : ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Return processed data and render function
  return {
    processedData: sortedData,
    groupedData: groupedData,
    isGrouped: !!groupBy,
    sortConfig,
    handleSort,
    renderControls
  };
}
