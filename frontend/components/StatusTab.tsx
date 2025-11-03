'use client';

export type TabFilter = 'active' | 'past' | 'completed' | 'all';

interface StatusTabProps {
  activeFilter: TabFilter;
  onFilterChange: (filter: TabFilter) => void;
  activeCount: number;
  pastCount: number;
  completedCount: number;
  allCount: number;
}

export default function StatusTab({
  activeFilter,
  onFilterChange,
  activeCount,
  pastCount,
  completedCount,
  allCount,
}: StatusTabProps) {
  return (
    <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
      <button
        onClick={() => onFilterChange('active')}
        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
          activeFilter === 'active'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Active
        {activeCount > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
            {activeCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onFilterChange('past')}
        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
          activeFilter === 'past'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Past
        {pastCount > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
            {pastCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
          activeFilter === 'completed'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Completed
        {completedCount > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {completedCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
          activeFilter === 'all'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        All
        {allCount > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            {allCount}
          </span>
        )}
      </button>
    </div>
  );
}

