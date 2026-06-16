import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import {
  blockTypeColors,
  buildMonthGrid,
  dayTooltipText,
  formatMonthTitle,
  getDayAvailability,
  getDefaultCalendarMonth,
  isSameDay,
  toDateKey,
} from '../../lib/availability';
import { cn } from '../../lib/utils';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MonthlyCalendarViewProps = {
  expert: ITExpert;
};

function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-600">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
        Available
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded bg-amber-500" />
        Partially available
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded bg-sky-500" />
        Fully booked
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded bg-violet-500" />
        On leave
      </span>
    </div>
  );
}

export default function MonthlyCalendarView({ expert }: MonthlyCalendarViewProps) {
  const defaultMonth = getDefaultCalendarMonth(expert);
  const [viewYear, setViewYear] = useState(defaultMonth.year);
  const [viewMonth, setViewMonth] = useState(defaultMonth.month);

  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToMonth = (year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
  };

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    goToMonth(d.getFullYear(), d.getMonth());
  };

  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    goToMonth(d.getFullYear(), d.getMonth());
  };

  const goToToday = () => {
    goToMonth(today.getFullYear(), today.getMonth());
  };

  const monthTitle = formatMonthTitle(viewYear, viewMonth);
  const viewingCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-sm font-black text-[#0F1B3D]">Monthly availability</div>
          <div className="text-xs font-medium text-slate-500">Day-level status from allocations and commitments</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            disabled={viewingCurrentMonth}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-[#0072CE] transition hover:bg-sky-50 disabled:opacity-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 transition hover:bg-slate-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-black text-[#0F1B3D]">{monthTitle}</span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 transition hover:bg-slate-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[280px]">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_HEADERS.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-[10px] font-black uppercase text-slate-400"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const inMonth = date.getMonth() === viewMonth;
              const isToday = isSameDay(date, today);
              const dayAvail = getDayAvailability(expert, date);
              const colors = blockTypeColors(dayAvail.type);
              const tooltip = dayTooltipText(expert, date, dayAvail);
              const showPct =
                inMonth &&
                dayAvail.type !== 'leave' &&
                dayAvail.percentage > 0 &&
                dayAvail.percentage < 100;

              return (
                <div
                  key={toDateKey(date)}
                  title={tooltip}
                  className={cn(
                    'group relative flex min-h-[52px] flex-col rounded-lg border p-1 transition',
                    inMonth ? colors.bg : 'bg-slate-50/50',
                    inMonth ? colors.border : 'border-transparent',
                    !inMonth && 'opacity-40',
                    isToday && 'ring-2 ring-[#0072CE] ring-offset-1',
                  )}
                >
                  <div className="flex items-center justify-between gap-0.5">
                    <span
                      className={cn(
                        'text-[10px] font-black leading-none',
                        isToday ? 'rounded bg-[#0072CE] px-1 text-white' : inMonth ? colors.text : 'text-slate-300',
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {inMonth && (
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} aria-hidden />
                    )}
                  </div>
                  {inMonth && showPct && (
                    <span className={cn('mt-1 text-[9px] font-black leading-tight', colors.text)}>
                      {dayAvail.percentage}%
                    </span>
                  )}
                  {inMonth && dayAvail.type === 'leave' && (
                    <span className={cn('mt-1 text-[8px] font-bold leading-tight', colors.text)}>Leave</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-3">
        <CalendarLegend />
      </div>
    </div>
  );
}