import React from 'react';
import type { AllocationBlock, ITExpert } from '../../types/expert';
import {
  blockTooltipLabel,
  blockTypeColors,
  formatCardAvailabilitySummary,
  weekShortDate,
} from '../../lib/availability';
import { cn } from '../../lib/utils';

type SimpleGanttPreviewProps = {
  expert: ITExpert;
  weeks?: number;
  showSummary?: boolean;
  className?: string;
};

function WeekBar({ block }: { block: AllocationBlock }) {
  const colors = blockTypeColors(block.type);

  return (
    <div
      role="listitem"
      aria-label={blockTooltipLabel(block, block.weekStart)}
      title={blockTooltipLabel(block, block.weekStart)}
      className={cn('h-2.5 w-full rounded-sm', colors.solid)}
    />
  );
}

export default function SimpleGanttPreview({
  expert,
  weeks = 4,
  showSummary = true,
  className,
}: SimpleGanttPreviewProps) {
  const slice = expert.allocations.slice(0, weeks);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="list"
        aria-label={`Availability for the next ${weeks} weeks`}
        className="flex gap-1.5"
      >
        {slice.map((block) => (
          <div key={block.weekStart} className="flex min-w-0 flex-1 flex-col gap-1">
            <WeekBar block={block} />
            <span className="truncate text-center text-[9px] font-medium text-slate-400">
              {weekShortDate(block.weekStart)}
            </span>
          </div>
        ))}
      </div>

      {showSummary && (
        <p className="text-[11px] font-medium text-slate-500">
          {formatCardAvailabilitySummary(expert)}
        </p>
      )}
    </div>
  );
}
