import type { AllocationBlock, AllocationBlockType, AvailabilityStatus, ITExpert } from '../types/expert';

export function blockTypeColors(type: AllocationBlockType) {
  switch (type) {
    case 'available':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        solid: 'bg-emerald-500',
      };
    case 'partial':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        solid: 'bg-amber-500',
      };
    case 'project':
      return {
        bg: 'bg-sky-100',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        solid: 'bg-sky-500',
      };
    case 'leave':
      return {
        bg: 'bg-violet-100',
        text: 'text-violet-800',
        border: 'border-violet-200',
        dot: 'bg-violet-500',
        solid: 'bg-violet-500',
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        solid: 'bg-slate-400',
      };
  }
}

export function blockShortLabel(block: AllocationBlock): string {
  if (block.type === 'leave') return 'Leave';
  if (block.type === 'available') return `${block.percentage}% free`;
  if (block.type === 'partial') return `${block.percentage}% free`;
  return `${block.percentage}%`;
}

function projectAbbrev(name: string): string {
  const first = name.split(/\s+/)[0] ?? name;
  return first.length <= 8 ? first : first.slice(0, 6);
}

/** Ultra-short label for compact card mini-Gantt cells. */
export function blockMiniLabel(block: AllocationBlock): string {
  switch (block.type) {
    case 'leave':
      return 'Leave';
    case 'available':
      return block.percentage >= 100 ? 'Available' : `${block.percentage}%`;
    case 'partial':
      return `${block.percentage}%`;
    case 'project':
      if (block.percentage >= 100) return 'Booked';
      if (block.projectName) return `${block.percentage}% ${projectAbbrev(block.projectName)}`;
      return `${block.percentage}%`;
    default:
      return block.label;
  }
}

/** Hiring-manager-friendly status label — always text, never color-only. */
export function blockStatusLabel(block: AllocationBlock): string {
  switch (block.type) {
    case 'leave':
      return 'On leave';
    case 'available':
      return block.percentage >= 100 ? 'Available' : `${block.percentage}% available`;
    case 'partial':
      return `${block.percentage}% available`;
    case 'project':
      if (block.percentage >= 100) return 'Fully booked';
      if (block.projectName) return `${block.percentage}% ${projectAbbrev(block.projectName)}`;
      return `${block.percentage}% allocated`;
    case 'unavailable':
      return 'Unavailable';
    default:
      return block.label;
  }
}

export function weekCompactLabel(weekStart: string, index: number): string {
  if (index === 0) return 'Now';
  if (index === 1) return 'Next';
  return `W${index + 1}`;
}

export function weekShortDate(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function blockTooltipLabel(block: AllocationBlock, weekStart: string): string {
  const dateRange = new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const conflict = block.hasConflict ? ' · Scheduling conflict' : '';
  return `${dateRange}–${endStr}: ${blockStatusLabel(block)}${block.projectName ? ` (${block.projectName})` : ''}${conflict}`;
}

export function formatNextAvailable(date: string, status?: AvailabilityStatus): string {
  if (status === 'available') return 'Available now';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** One-line availability summary for compact expert cards. */
export function formatCardAvailabilitySummary(expert: ITExpert): string {
  if (expert.availabilityStatus === 'available') return 'Available now';
  const next = formatShortDate(expert.nextAvailableDate);
  const { allocationPercent } = expert;
  if (allocationPercent > 0 && allocationPercent < 100) {
    return `${allocationPercent}% allocated · Free ${next}`;
  }
  return `Available ${next}`;
}

export type DayAvailability = {
  type: AllocationBlockType;
  percentage: number;
  label: string;
  projectName?: string;
  hasConflict?: boolean;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function formatMonthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Six-row calendar grid (Sun–Sat) for the given month. */
export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function parseMonthToken(token: string): number {
  const idx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === token.slice(0, 3).toLowerCase());
  return idx >= 0 ? idx : 0;
}

function parseCommitmentPart(part: string, refYear: number, refMonth?: number): Date {
  const trimmed = part.trim();
  const full = trimmed.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (full) {
    return new Date(refYear, parseMonthToken(full[1]), parseInt(full[2], 10));
  }
  const dayOnly = trimmed.match(/^(\d+)$/);
  if (dayOnly && refMonth !== undefined) {
    return new Date(refYear, refMonth, parseInt(dayOnly[1], 10));
  }
  return new Date(refYear, refMonth ?? 0, 1);
}

function parseCommitmentRange(dateStr: string, refYear = 2025): { start: Date; end: Date } | null {
  const normalized = dateStr.replace(/\u2013/g, '–');
  const parts = normalized.split('–');
  if (parts.length === 1) {
    const start = parseCommitmentPart(parts[0], refYear);
    return { start, end: start };
  }
  const start = parseCommitmentPart(parts[0], refYear);
  const endMonth = parts[1].match(/^[A-Za-z]+/) ? undefined : start.getMonth();
  const end = parseCommitmentPart(parts[1], refYear, endMonth);
  return { start, end };
}

function dateInRange(date: Date, start: Date, end: Date): boolean {
  const key = toDateKey(date);
  return key >= toDateKey(start) && key <= toDateKey(end);
}

function commitmentToDayAvailability(
  type: 'project' | 'leave' | 'available',
  label: string,
  allocation?: number,
): DayAvailability {
  if (type === 'leave') {
    return { type: 'leave', percentage: 0, label };
  }
  if (type === 'available') {
    const pct = allocation ?? 100;
    return {
      type: pct >= 100 ? 'available' : 'partial',
      percentage: pct,
      label,
    };
  }
  const pct = allocation ?? 100;
  if (pct >= 100) {
    return { type: 'project', percentage: pct, label };
  }
  if (pct <= 0) {
    return { type: 'available', percentage: 100, label };
  }
  return {
    type: 'partial',
    percentage: 100 - pct,
    label,
    projectName: label.replace(/\s*\(\d+%\)\s*$/, ''),
  };
}

export function getAllocationBlockForDate(expert: ITExpert, date: Date): AllocationBlock | null {
  const key = toDateKey(date);
  for (const block of expert.allocations) {
    const start = parseDateKey(block.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (key >= toDateKey(start) && key <= toDateKey(end)) {
      return block;
    }
  }
  return null;
}

export function getDayAvailability(expert: ITExpert, date: Date): DayAvailability {
  const refYear = date.getFullYear();
  for (const commitment of expert.upcomingCommitments) {
    const range = parseCommitmentRange(commitment.date, refYear);
    if (range && dateInRange(date, range.start, range.end)) {
      return commitmentToDayAvailability(commitment.type, commitment.label, commitment.allocation);
    }
  }

  const block = getAllocationBlockForDate(expert, date);
  if (block) {
    return {
      type: block.type,
      percentage: block.percentage,
      label: block.label,
      projectName: block.projectName,
      hasConflict: block.hasConflict,
    };
  }

  switch (expert.availabilityStatus) {
    case 'on_leave':
      return { type: 'leave', percentage: 0, label: 'On leave' };
    case 'fully_booked':
      return { type: 'project', percentage: 100, label: 'Fully booked' };
    case 'partially_allocated':
      return {
        type: 'partial',
        percentage: 100 - expert.allocationPercent,
        label: `${100 - expert.allocationPercent}% available`,
      };
    default:
      return { type: 'available', percentage: 100, label: 'Available' };
  }
}

export function dayAvailabilityLabel(day: DayAvailability): string {
  if (day.type === 'leave') return 'On leave';
  if (day.type === 'available') {
    return day.percentage >= 100 ? 'Available' : `${day.percentage}% available`;
  }
  if (day.type === 'partial') return `${day.percentage}% available`;
  if (day.type === 'project') {
    return day.percentage >= 100 ? 'Fully booked' : `${day.percentage}% allocated`;
  }
  return day.label;
}

export function dayTooltipText(expert: ITExpert, date: Date, day: DayAvailability): string {
  const dateLabel = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const status = dayAvailabilityLabel(day);
  const detail = day.projectName ? ` · ${day.projectName}` : '';
  const conflict = day.hasConflict ? ' · Scheduling conflict' : '';
  return `${expert.name} — ${dateLabel}: ${status}${detail}${conflict}`;
}

export function getDefaultCalendarMonth(expert: ITExpert): { year: number; month: number } {
  if (expert.allocations.length > 0) {
    const first = parseDateKey(expert.allocations[0].weekStart);
    return { year: first.getFullYear(), month: first.getMonth() };
  }
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}
