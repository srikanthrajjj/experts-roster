import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AllocationBlock, ITExpert } from '../../types/expert';
import { blockShortLabel, blockTypeColors } from '../../lib/availability';
import { formatWeekLabel, getGanttWeeks } from '../../data/itExperts';
import Avatar, { StatusBadge } from './SharedUI';
import { cn } from '../../lib/utils';

type CalendarViewProps = {
  experts: ITExpert[];
  selectedExpertId?: string;
  onSelectExpert?: (expert: ITExpert, weekIndex?: number) => void;
  compact?: boolean;
};

function WeekCell({
  block,
  expert,
  weekIndex,
  onSelect,
  selected,
}: {
  block: AllocationBlock;
  expert: ITExpert;
  weekIndex: number;
  onSelect?: (expert: ITExpert, weekIndex: number) => void;
  selected?: boolean;
  key?: React.Key;
}) {
  const colors = blockTypeColors(block.type);
  return (
    <button
      type="button"
      onClick={() => onSelect?.(expert, weekIndex)}
      title={`${expert.name}: ${block.label} (${block.percentage}%)`}
      className={cn(
        'group relative flex min-h-[52px] flex-col items-center justify-center rounded-lg border p-1.5 transition hover:scale-[1.02] hover:shadow-sm',
        colors.bg,
        colors.border,
        selected && 'ring-2 ring-[#0072CE] ring-offset-1',
      )}
    >
      <span className={cn('text-[10px] font-black', colors.text)}>{block.percentage}%</span>
      <span className={cn('mt-0.5 line-clamp-2 text-center text-[8px] font-semibold leading-tight', colors.text, 'opacity-80')}>
        {blockShortLabel(block)}
      </span>
    </button>
  );
}

export default function CalendarView({
  experts,
  selectedExpertId,
  onSelectExpert,
  compact = false,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [weekOffset, setWeekOffset] = useState(0);

  const allWeeks = useMemo(() => (experts.length > 0 ? getGanttWeeks(experts) : []), [experts]);
  const visibleWeekCount = viewMode === 'weekly' ? 4 : allWeeks.length;
  const weeks = useMemo(
    () => allWeeks.slice(weekOffset, weekOffset + visibleWeekCount),
    [allWeeks, weekOffset, visibleWeekCount],
  );

  const canPrev = weekOffset > 0;
  const canNext = weekOffset + visibleWeekCount < allWeeks.length;

  if (experts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
        No experts match your filters.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!compact && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <div className="text-sm font-black text-[#0F1B3D]">Team availability calendar</div>
            <div className="text-xs font-medium text-slate-500">Who is available when — click any cell for details</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => { setViewMode('weekly'); setWeekOffset(0); }}
                className={cn('rounded-md px-3 py-1 text-xs font-black transition', viewMode === 'weekly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50')}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('monthly'); setWeekOffset(0); }}
                className={cn('rounded-md px-3 py-1 text-xs font-black transition', viewMode === 'monthly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50')}
              >
                Monthly
              </button>
            </div>
            {viewMode === 'weekly' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="custom-scrollbar min-h-0 flex-1 overflow-auto p-4">
        <div className="min-w-[720px]">
          <div
            className="sticky top-0 z-10 mb-2 grid gap-2 rounded-lg bg-slate-50 px-2 py-2 text-[10px] font-black uppercase text-[#172554]"
            style={{ gridTemplateColumns: compact ? `140px repeat(${weeks.length}, 1fr)` : `200px repeat(${weeks.length}, 1fr)` }}
          >
            <div className="flex items-center">Expert</div>
            {weeks.map((week) => (
              <div key={week} className="text-center">{formatWeekLabel(week)}</div>
            ))}
          </div>

          <div className="space-y-2">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className={cn(
                  'grid gap-2 rounded-lg border border-slate-100 bg-white p-2 transition',
                  selectedExpertId === expert.id && 'border-[#0072CE]/30 bg-sky-50/30',
                )}
                style={{ gridTemplateColumns: compact ? `140px repeat(${weeks.length}, 1fr)` : `200px repeat(${weeks.length}, 1fr)` }}
              >
                <button
                  type="button"
                  onClick={() => onSelectExpert?.(expert)}
                  className="flex items-center gap-2 rounded-lg p-1 text-left transition hover:bg-slate-50"
                >
                  <Avatar expert={expert} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-black text-[#0F1B3D]">{expert.name}</div>
                    {!compact && (
                      <>
                        <div className="truncate text-[10px] text-slate-500">{expert.role}</div>
                        <div className="mt-1"><StatusBadge status={expert.availabilityStatus} /></div>
                      </>
                    )}
                  </div>
                </button>
                {expert.allocations.slice(weekOffset, weekOffset + weeks.length).map((block, wi) => (
                  <WeekCell
                    key={block.weekStart}
                    block={block}
                    expert={expert}
                    weekIndex={weekOffset + wi}
                    onSelect={onSelectExpert}
                    selected={selectedExpertId === expert.id}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-slate-200 px-4 py-2 text-[10px] font-bold text-slate-600">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Partially available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Fully booked</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-violet-500" /> On leave</span>
        </div>
      )}
    </div>
  );
}
