import { X } from 'lucide-react';
import type { FilterState } from '../../types/expert';
import { buildActiveFilterChips, clearActiveFilterChip } from '../../lib/activeFilterChips';

type ActiveFilterChipsProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearAll?: () => void;
};

export default function ActiveFilterChips({ filters, onFiltersChange, onClearAll }: ActiveFilterChipsProps) {
  const chips = buildActiveFilterChips(filters);

  if (chips.length === 0) return null;

  const handleClear = (chipKey: string) => {
    onFiltersChange(clearActiveFilterChip(filters, chipKey));
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => handleClear(chip.key)}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#0072CE]/20 bg-sky-50 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#0072CE]/40 hover:bg-sky-100"
          title={`Remove ${chip.label}: ${chip.value}`}
        >
          <span className="shrink-0 text-[#0072CE]">{chip.label}:</span>
          <span className="truncate">{chip.value}</span>
          <X className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
        </button>
      ))}
      {onClearAll && chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex h-7 shrink-0 items-center rounded-lg px-2 text-xs font-black text-[#0072CE] transition hover:bg-sky-50"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
