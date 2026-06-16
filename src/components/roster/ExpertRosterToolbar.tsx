import { ListFilter } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import ViewToggle, { type RosterViewMode } from './ViewToggle';
import { SORT_OPTIONS, type SortOrder } from '../../lib/expertDisplay';

type ExpertRosterToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  activeFilterCount: number;
  expertCount?: number;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  viewMode: RosterViewMode;
  onViewModeChange: (mode: RosterViewMode) => void;
  showSuggestions?: boolean;
  showViewToggle?: boolean;
};

export default function ExpertRosterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search roster...',
  activeFilterCount,
  expertCount,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  showSuggestions = false,
  showViewToggle = true,
}: ExpertRosterToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <GlobalSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          showSuggestions={showSuggestions}
          className="max-w-md flex-1"
        />
        <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-slate-500">
          <ListFilter className="h-4 w-4 text-[#0072CE]" />
          <span>
            {activeFilterCount} active filters
            {expertCount !== undefined && ` · ${expertCount} experts`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
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
