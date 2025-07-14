'use client';

import { Search, Filter } from 'lucide-react';

interface TaskFiltersProps {
  filters: {
    status: string;
    priority: string;
    completed: boolean | undefined;
    search: string;
  };
  onFiltersChange: (filters: {
    status: string;
    priority: string;
    completed: boolean | undefined;
    search: string;
  }) => void;
}

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    try {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Completion Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Completion
          </label>
          <select
            value={filters.completed === undefined ? '' : filters.completed.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('completed', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white cursor-pointer"
          >
            <option value="">All Tasks</option>
            <option value="false">Incomplete</option>
            <option value="true">Completed</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFiltersChange({
            status: '',
            priority: '',
            completed: undefined,
            search: '',
          })}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
