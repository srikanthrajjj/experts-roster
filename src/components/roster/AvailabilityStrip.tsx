import React from 'react';
import type { AllocationBlock, ITExpert } from '../../types/expert';
import {
  blockStatusLabel,
  blockTooltipLabel,
  blockTypeColors,
  weekCompactLabel,
  weekShortDate,
} from '../../lib/availability';
import { formatWeekLabel } from '../../data/itExperts';
import { cn } from '../../lib/utils';

type AvailabilityStripProps = {
  allocations: AllocationBlock[];
  weeks?: number;
  size?: 'sm' | 'md';
  highlightCurrent?: boolean;
  showWeekDates?: boolean;
  className?: string;
};

function WeekCell({
  block,
  index,
  size,
  highlightCurrent,
  showWeekDates,
}: {
  block: AllocationBlock;
  index: number;
  size: 'sm' | 'md';
  highlightCurrent?: boolean;
  showWeekDates?: boolean;
  key?: string;
}) {
  const colors = blockTypeColors(block.type);
  const status = blockStatusLabel(block);
  const isCurrent = highlightCurrent && index === 0;
  const weekLabel = showWeekDates && index >= 2
    ? weekShortDate(block.weekStart)
    : weekCompactLabel(block.weekStart, index);

  return (
    <div
      role="listitem"
      aria-label={`${weekLabel}: ${status}`}
      title={blockTooltipLabel(block, block.weekStart)}
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-md border px-1 py-1',
        colors.bg,
        colors.border,
        isCurrent && 'ring-1 ring-[#0072CE]/50',
        block.hasConflict && 'ring-1 ring-red-400',
      )}
    >
      <span
        className={cn(
          'truncate font-bold uppercase tracking-wide text-slate-500',
          size === 'sm' ? 'text-[7px]' : 'text-[8px]',
          isCurrent && 'text-[#0072CE]',
        )}
      >
        {weekLabel}
      </span>
      <div
        className={cn('mt-0.5 rounded-full', size === 'sm' ? 'h-0.5' : 'h-1', colors.solid)}
        aria-hidden="true"
      />
      <span
        className={cn(
          'mt-0.5 truncate font-bold leading-tight',
          colors.text,
          size === 'sm' ? 'text-[7px]' : 'text-[9px]',
        )}
      >
        {status}
      </span>
    </div>
  );
}

export default function AvailabilityStrip({
  allocations,
  weeks = 4,
  size = 'sm',
  highlightCurrent = false,
  showWeekDates = false,
  className,
}: AvailabilityStripProps) {
  const slice = allocations.slice(0, weeks);

  return (
    <div
      role="list"
      aria-label="Weekly availability for the next four weeks"
      className={cn('grid gap-1', size === 'sm' ? 'grid-cols-4 gap-0.5' : 'grid-cols-4 gap-1', className)}
    >
      {slice.map((block, index) => (
        <WeekCell
          key={block.weekStart}
          block={block}
          index={index}
          size={size}
          highlightCurrent={highlightCurrent}
          showWeekDates={showWeekDates}
        />
      ))}
    </div>
  );
}

type ExpertAvailabilityPreviewProps = {
  expert: ITExpert;
  variant?: 'default' | 'detailed';
  compact?: boolean;
};

export function ExpertAvailabilityPreview({
  expert,
  variant = 'default',
  compact = false,
}: ExpertAvailabilityPreviewProps) {
  const currentBlock = expert.allocations[0];
  const nowLabel = currentBlock ? blockStatusLabel(currentBlock) : `${expert.allocationPercent}% allocated`;

  return (
    <div
      className={cn(
        !compact && 'rounded-lg border border-slate-100 bg-slate-50/80 p-2',
        compact && 'space-y-1',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 font-bold text-slate-500',
          compact ? 'text-[9px]' : 'text-[10px]',
        )}
      >
        <span>Next 4 weeks</span>
        <span className="font-black text-[#0072CE]">Now · {nowLabel}</span>
      </div>
      <AvailabilityStrip
        allocations={expert.allocations}
        weeks={4}
        size={compact ? 'sm' : 'md'}
        highlightCurrent
        showWeekDates={variant === 'detailed'}
      />
      {variant === 'detailed' && (
        <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
          {expert.allocations.slice(0, 4).map((block, index) => {
            const colors = blockTypeColors(block.type);
            return (
              <li
                key={block.weekStart}
                className="flex items-center justify-between gap-2 text-[10px]"
              >
                <span className="font-semibold text-slate-500">
                  {index === 0 ? 'This week' : index === 1 ? 'Next week' : formatWeekLabel(block.weekStart)}
                </span>
                <span className={cn('font-black', colors.text)}>{blockStatusLabel(block)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
