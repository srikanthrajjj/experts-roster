import GlobalSearch from './GlobalSearch';
import ViewToggle, { type RosterViewMode } from './ViewToggle';
import ActiveFilterChips from './ActiveFilterChips';
import { SORT_OPTIONS, type SortOrder } from '../../lib/expertDisplay';
import type { FilterState, ITExpert } from '../../types/expert';

type ExpertRosterToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearAllFilters?: () => void;
  expertCount?: number;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  viewMode: RosterViewMode;
  onViewModeChange: (mode: RosterViewMode) => void;
  showSuggestions?: boolean;
  showTypeahead?: boolean;
  experts?: ITExpert[];
  onSelectExpert?: (expertId: string) => void;
  showViewToggle?: boolean;
};

export default function ExpertRosterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search roster...',
  filters,
  onFiltersChange,
  onClearAllFilters,
  expertCount,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  showSuggestions = false,
  showTypeahead = false,
  experts,
  onSelectExpert,
  showViewToggle = true,
}: ExpertRosterToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <GlobalSearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            showSuggestions={showSuggestions}
            showTypeahead={showTypeahead}
            experts={experts}
            onSelectExpert={onSelectExpert}
            className="max-w-md flex-1"
          />
          {expertCount !== undefined && (
            <span className="shrink-0 text-sm font-bold text-slate-500">
              {expertCount} experts
            </span>
          )}
        </div>
        <ActiveFilterChips
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearAll={onClearAllFilters}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="h-10 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {showViewToggle && <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />}
      </div>
    </div>
  );
}
