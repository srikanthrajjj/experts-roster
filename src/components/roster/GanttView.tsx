import React from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AllocationBlock, ITExpert } from '../../types/expert';
import { blockShortLabel, blockTypeColors } from '../../lib/availability';
import { formatWeekLabel, getGanttWeeks } from '../../data/itExperts';
import Avatar, { Badge } from './SharedUI';
import { ExpertResourceBadges, ResourceBadgeLegend } from './LeafBadges';
import { cn } from '../../lib/utils';

type GanttViewProps = {
  experts: ITExpert[];
  selectedExpertId?: string;
  onSelectExpert: (expert: ITExpert) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  zoom: 'weekly' | 'monthly';
  onZoomChange: (zoom: 'weekly' | 'monthly') => void;
  compact?: boolean;
};

function GanttBlock({ block }: { block: AllocationBlock }) {
  const colors = blockTypeColors(block.type);
  return (
    <div
      className={cn(
        'relative flex min-h-[36px] flex-col items-center justify-center rounded border px-1 py-0.5 text-center leading-tight',
        colors.bg,
        colors.text,
        colors.border,
        block.hasConflict && 'ring-2 ring-red-400 ring-offset-1',
      )}
      title={block.hasConflict ? 'Resource conflict detected' : block.label}
    >
      {block.hasConflict && (
        <AlertTriangle className="absolute -right-1 -top-1 h-3 w-3 text-red-500" />
      )}
      <span className="text-[9px] font-black">{block.percentage}%</span>
      <span className="line-clamp-1 text-[8px] font-semibold opacity-80">{blockShortLabel(block)}</span>
    </div>
  );
}

export default function GanttView({
  experts,
  selectedExpertId,
  onSelectExpert,
  currentMonth,
  onMonthChange,
  zoom,
  onZoomChange,
  compact = false,
}: GanttViewProps) {
  const allWeeks = experts.length > 0 ? getGanttWeeks(experts) : [];
  const weeks = zoom === 'monthly' ? allWeeks : allWeeks.slice(0, 4);
  const todayMarkerWeek = 1;

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  const monthLabel = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!compact && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-[#0072CE] hover:bg-sky-50">
              Today
            </button>
            <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-sm font-black text-[#0F1B3D]">{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => onZoomChange('weekly')}
              className={cn('rounded-md px-3 py-1 text-xs font-black transition', zoom === 'weekly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => onZoomChange('monthly')}
              className={cn('rounded-md px-3 py-1 text-xs font-black transition', zoom === 'monthly' ? 'bg-[#0072CE] text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              Monthly
            </button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
        <div className={cn('min-w-[900px]', compact && 'min-w-0')}>
          <div
            className="sticky top-0 z-10 grid items-center border-b border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase text-[#172554]"
            style={{ gridTemplateColumns: compact ? `180px repeat(${weeks.length}, minmax(80px, 1fr))` : `220px 180px repeat(${weeks.length}, minmax(100px, 1fr))` }}
          >
            <div>Expert</div>
            {!compact && <div>Role / Skills</div>}
            {weeks.map((week) => (
              <div key={week} className="text-center">{formatWeekLabel(week)}</div>
            ))}
          </div>

          {experts.map((expert) => (
            <button
              key={expert.id}
              type="button"
              onClick={() => onSelectExpert(expert)}
              className={cn(
                'grid w-full items-stretch border-b border-slate-100 px-4 py-2 text-left transition hover:bg-sky-50/50',
                selectedExpertId === expert.id && 'bg-sky-50/80 ring-1 ring-inset ring-[#0072CE]/20',
              )}
              style={{ gridTemplateColumns: compact ? `180px repeat(${weeks.length}, minmax(80px, 1fr))` : `220px 180px repeat(${weeks.length}, minmax(100px, 1fr))` }}
            >
              <div className="flex items-center gap-2 py-1">
                <Avatar expert={expert} size="sm" />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-1">
                    <div className="truncate text-xs font-black text-[#0F1B3D]">{expert.name}</div>
                    <ExpertResourceBadges expert={expert} max={compact ? 2 : 3} />
                  </div>
                  {!compact && <div className="truncate text-[10px] text-slate-500">{expert.country}</div>}
                </div>
              </div>
              {!compact && (
                <div className="py-1">
                  <p className="truncate text-[10px] font-semibold text-slate-700">{expert.role}</p>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {expert.technologyStack.slice(0, 2).map((s) => (
                      <Badge key={s} className="h-5 border-sky-100 bg-sky-50 px-1 text-[9px] text-sky-700">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {expert.allocations.slice(0, weeks.length).map((block, wi) => (
                <div key={block.weekStart} className="relative px-0.5 py-1">
                  {wi === todayMarkerWeek && !compact && (
                    <div className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-[#0072CE]" style={{ left: '50%' }} />
                  )}
                  <GanttBlock block={block} />
                </div>
              ))}
            </button>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="shrink-0 space-y-2 border-t border-slate-200 bg-slate-50/40 px-4 py-2">
          <ResourceBadgeLegend />
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600">
            <span className="mr-1 text-[9px] font-black uppercase tracking-wider text-[#0072CE]">Timeline</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Available</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Booked</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-violet-500" /> Leave</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-red-500" /> Conflict</span>
          </div>
        </div>
      )}
    </div>
  );
}
