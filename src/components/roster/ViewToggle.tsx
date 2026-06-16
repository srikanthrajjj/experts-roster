import { LayoutGrid, LayoutList } from 'lucide-react';
import { cn } from '../../lib/utils';

export type RosterViewMode = 'list' | 'cards';

type ViewToggleProps = {
  viewMode: RosterViewMode;
  onViewModeChange: (mode: RosterViewMode) => void;
};

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        title="List view"
        onClick={() => onViewModeChange('list')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition',
          viewMode === 'list'
            ? 'bg-[#0072CE] text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <LayoutList className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Card view"
        onClick={() => onViewModeChange('cards')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition',
          viewMode === 'cards'
            ? 'bg-[#0072CE] text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
