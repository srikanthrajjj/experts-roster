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
  getAllocationBlockForDate,
} from '../../lib/availability';
import { cn } from '../../lib/utils';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MonthlyCalendarViewProps = {
  expert: ITExpert;
  selectedWeekStart?: string;
  onSelectWeekStart?: (weekStart: string) => void;
  selectedDateKeys?: string[];
  onSelectDateKey?: (dateKey: string) => void;
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
        <span className="h-2.5 w-2.5 rounded bg-rose-500" />
        Fully booked
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded bg-violet-500" />
        On leave
      </span>
    </div>
  );
}

export default function MonthlyCalendarView({
  expert,
  selectedWeekStart,
  onSelectWeekStart,
  selectedDateKeys = [],
  onSelectDateKey,
}: MonthlyCalendarViewProps) {
  const defaultMonth = getDefaultCalendarMonth(expert);
  const [viewYear, setViewYear] = useState(defaultMonth.year);
  const [viewMonth, setViewMonth] = useState(defaultMonth.month);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

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
          <div className="text-sm font-black text-[#0F1B3D]">Monthly assignment calendar</div>
          <div className="text-xs font-medium text-slate-500">Click any day to schedule/update projects for that week</div>
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
          <div className="mb-1 grid grid-cols-5 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label) => (
              <div
                key={label}
                className="py-1 text-center text-[10px] font-black uppercase text-slate-400"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-1">
            {days.filter(d => d.getDay() !== 0 && d.getDay() !== 6).map((date) => {
              const dateKey = toDateKey(date);
              const inMonth = date.getMonth() === viewMonth;
              const isToday = isSameDay(date, today);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayAvail = getDayAvailability(expert, date);
              
              const colors = isWeekend
                ? {
                    bg: 'bg-slate-50',
                    text: 'text-slate-400',
                    border: 'border-slate-200',
                    dot: 'bg-slate-350',
                    solid: 'bg-slate-300'
                  }
                : blockTypeColors(dayAvail.type);
                
              const tooltip = isWeekend
                ? `${expert.name} — ${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}: Weekend (Non-working day)`
                : dayTooltipText(expert, date, dayAvail);
              
              const block = getAllocationBlockForDate(expert, date);
              const isSelectedWeek = block && selectedWeekStart === block.weekStart;
              const isSelectedDay = selectedDateKeys.includes(dateKey);
              const isClickedDay = clickedDate && isSameDay(date, clickedDate);

              const handleClick = () => {
                if (isWeekend) return;
                setClickedDate(date);
                if (block && onSelectWeekStart) {
                  onSelectWeekStart(block.weekStart);
                }
                if (onSelectDateKey) {
                  onSelectDateKey(dateKey);
                }
              };

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={handleClick}
                  title={tooltip}
                  disabled={!inMonth || isWeekend}
                  className={cn(
                    'group relative flex min-h-[66px] flex-col rounded-lg border p-1 text-left transition select-text w-full focus:outline-none',
                    inMonth ? colors.bg : 'bg-slate-50/50',
                    inMonth ? colors.border : 'border-transparent',
                    (!inMonth || isWeekend) && 'opacity-65 cursor-not-allowed',
                    inMonth && !isWeekend && 'cursor-pointer hover:shadow-sm hover:scale-[1.01]',
                    isToday && 'ring-2 ring-indigo-500 ring-offset-1',
                    inMonth && !isWeekend && isSelectedWeek && 'border-[#0072CE] ring-2 ring-[#0072CE]/30 z-10 shadow-sm',
                    inMonth && !isWeekend && isSelectedDay && 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/70 z-20 shadow-md scale-[1.01]',
                    inMonth && !isWeekend && isClickedDay && 'ring-2 ring-[#0072CE] ring-offset-1 z-30 shadow-md scale-[1.01]'
                  )}
                >
                  <div className="flex items-center justify-between gap-0.5 w-full">
                    <span
                      className={cn(
                        'text-[10px] font-black leading-none flex items-center justify-center h-4 w-4 rounded-full',
                        isToday ? 'bg-[#0072CE] text-white font-extrabold' : inMonth ? colors.text : 'text-slate-300',
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {inMonth && !isWeekend && (
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colors.dot)} aria-hidden />
                    )}
                  </div>
                  
                  {inMonth && (
                    <div className="mt-1 w-full overflow-hidden flex-1 flex flex-col justify-end">
                      {isWeekend ? (
                        <span className="truncate w-full text-[8px] font-black bg-slate-100 text-slate-400 border border-slate-200/50 px-1 py-0.5 rounded leading-none text-center block font-sans">
                          Weekend
                        </span>
                      ) : dayAvail.type === 'project' ? (
                        <span className="truncate w-full text-[8px] font-black bg-white/60 text-sky-800 border border-sky-200/50 px-1 py-0.5 rounded leading-none text-center block font-sans" title={dayAvail.projectName || dayAvail.label}>
                          {dayAvail.projectName || dayAvail.label}
                        </span>
                      ) : dayAvail.type === 'leave' ? (
                        <span className="truncate w-full text-[8px] font-black bg-white/60 text-violet-800 border border-violet-200/50 px-1 py-0.5 rounded leading-none text-center block font-sans">
                          Leave
                        </span>
                      ) : dayAvail.type === 'partial' ? (
                        <span className="truncate w-full text-[8px] font-black bg-white/60 text-amber-800 border border-amber-200/50 px-1 py-0.5 rounded leading-none text-center block font-sans">
                          Partial ({dayAvail.percentage}%)
                        </span>
                      ) : (
                        <span className="truncate w-full text-[8px] font-black bg-white/60 text-emerald-800 border border-emerald-200/50 px-1 py-0.5 rounded leading-none text-center block font-sans">
                          Available
                        </span>
                      )}
                    </div>
                  )}

                  {inMonth && !isWeekend && isSelectedDay && (
                    <span className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-extrabold text-[8px] leading-none shadow-sm z-20">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {clickedDate && (
        <div className="mx-4 mb-4 rounded-xl border border-blue-100 bg-[#EEF5FC]/40 p-3.5 flex flex-col gap-1.5 animate-fade-in shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-[#0F1B3D]">
              Assignment Details &middot; {clickedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setClickedDate(null)}
              className="text-[10px] font-bold text-[#0072CE] hover:text-[#0055A6] cursor-pointer underline"
            >
              Clear Selection
            </button>
          </div>
          <div className="text-xs font-semibold text-slate-600 flex flex-col gap-1 mt-1 leading-relaxed">
            {(() => {
              const dayAvail = getDayAvailability(expert, clickedDate);
              if (dayAvail.type === 'project' && dayAvail.projectName) {
                return (
                  <div>
                    <span className="font-black text-rose-600 uppercase tracking-wider bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                      Project Allocation
                    </span>
                    Working on project <strong className="text-slate-900 font-extrabold">{dayAvail.projectName}</strong> at <strong className="text-slate-900 font-extrabold">{dayAvail.percentage}%</strong> allocation rate.
                  </div>
                );
              } else if (dayAvail.type === 'partial') {
                return (
                  <div>
                    <span className="font-black text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                      Partial Availability
                    </span>
                    Partially available (<strong className="text-slate-900 font-extrabold">{dayAvail.percentage}%</strong> free)
                    {dayAvail.projectName && (
                      <span> while working on <strong className="text-slate-900 font-extrabold">{dayAvail.projectName}</strong></span>
                    )}.
                  </div>
                );
              } else if (dayAvail.type === 'leave') {
                return (
                  <div>
                    <span className="font-black text-violet-600 uppercase tracking-wider bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                      On Leave
                    </span>
                    Expert is on annual leave.
                  </div>
                );
              } else {
                return (
                  <div>
                    <span className="font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                      Available
                    </span>
                    Fully available (<strong className="text-slate-900 font-extrabold">100%</strong> bench capacity).
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 px-4 py-3">
        <CalendarLegend />
      </div>
    </div>
  );
}