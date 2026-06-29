import { Award, BadgeCheck, Building2, Leaf, Rocket, Zap } from 'lucide-react';
import type { ITExpert } from '../../types/expert';
import { cn } from '../../lib/utils';

/** TeamOne / DIT ONE brand tokens used in certified + overflow chips */
const BADGE_CHIP_STYLES = {
  available: 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  partially_allocated: 'bg-amber-50 border-amber-200 text-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  fully_booked: 'bg-sky-50 border-sky-200 text-[#0072CE] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  on_leave: 'bg-violet-50 border-violet-200 text-violet-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  unicef: 'border-[#0091F9]/30 bg-[#0091F9]/10 text-[#0091F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
  emergency: 'bg-rose-50 border-rose-200 text-rose-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  certified: 'border-[#00ADEF]/30 bg-[#00ADEF]/10 text-[#0072CE] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
  verified: 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
  bench: 'bg-lime-50 border-lime-200 text-lime-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
} as const;

const BADGE_CHIP_STYLES_ON_DARK = {
  available: 'bg-emerald-400/20 border-emerald-300/35 text-emerald-100',
  partially_allocated: 'bg-amber-400/20 border-amber-300/35 text-amber-100',
  fully_booked: 'bg-sky-300/20 border-sky-200/35 text-sky-100',
  on_leave: 'bg-violet-400/20 border-violet-300/35 text-violet-100',
  unicef: 'bg-white/15 border-white/30 text-white',
  emergency: 'bg-rose-400/20 border-rose-300/35 text-rose-100',
  certified: 'bg-[#00ADEF]/25 border-[#00ADEF]/40 text-white',
  verified: 'bg-indigo-300/20 border-indigo-200/35 text-indigo-100',
  bench: 'bg-lime-400/20 border-lime-300/35 text-lime-100',
} as const;

export type LeafTone = keyof typeof BADGE_CHIP_STYLES;

const STATUS_LABELS: Record<ITExpert['availabilityStatus'], string> = {
  available: 'Available',
  partially_allocated: 'Partially available',
  fully_booked: 'Fully booked',
  on_leave: 'On leave',
};

export const BADGE_LEGEND: { tone: LeafTone; label: string }[] = [
  { tone: 'available', label: 'Available' },
  { tone: 'partially_allocated', label: 'Partial' },
  { tone: 'fully_booked', label: 'Fully booked' },
  { tone: 'on_leave', label: 'On leave' },
  { tone: 'verified', label: 'Verified' },
  { tone: 'unicef', label: 'UNICEF exp.' },
  { tone: 'emergency', label: 'Emergency' },
  { tone: 'certified', label: 'Certified' },
  { tone: 'bench', label: 'Bench ready' },
];

const ICON_BY_TONE: Record<LeafTone, typeof Leaf> = {
  available: Leaf,
  partially_allocated: Leaf,
  fully_booked: Leaf,
  on_leave: Leaf,
  verified: BadgeCheck,
  unicef: Building2,
  emergency: Zap,
  certified: Award,
  bench: Rocket,
};

export type ResourceBadge = { key: string; tone: LeafTone; title: string };

export function resourceBadgesForExpert(expert: ITExpert): ResourceBadge[] {
  const badges: ResourceBadge[] = [];

  let statusTitle = STATUS_LABELS[expert.availabilityStatus];
  if (expert.allocationPercent > 0 && expert.availabilityStatus !== 'on_leave') {
    statusTitle = `${statusTitle} (${expert.allocationPercent}% allocated)`;
  }
  badges.push({ key: 'status', tone: expert.availabilityStatus, title: statusTitle });

  if (expert.verified) {
    badges.push({ key: 'verified', tone: 'verified', title: 'Verified expert' });
  }
  if (expert.previousUnicef) {
    badges.push({ key: 'unicef', tone: 'unicef', title: 'Previous UNICEF experience' });
  }
  if (expert.emergencyExperience) {
    badges.push({ key: 'emergency', tone: 'emergency', title: 'Emergency response experience' });
  }
  if (expert.certifications.length > 0) {
    badges.push({
      key: 'certified',
      tone: 'certified',
      title: `Certified professional (${expert.certifications.length} credential${expert.certifications.length === 1 ? '' : 's'})`,
    });
  }
  if (expert.benchAvailable && expert.availabilityStatus === 'available') {
    badges.push({ key: 'bench', tone: 'bench', title: 'Bench available — ready for immediate deployment' });
  }

  return badges;
}

export function LeafBadge({
  tone,
  title,
  size = 'sm',
  variant = 'default',
  className,
}: {
  tone: LeafTone;
  title: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'onDark';
  className?: string;
}) {
  const iconClass = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  const chipClass = size === 'md' ? 'h-6 w-6 rounded-md' : 'h-5 w-5 rounded';
  const chipStyles = variant === 'onDark' ? BADGE_CHIP_STYLES_ON_DARK : BADGE_CHIP_STYLES;
  const Icon = ICON_BY_TONE[tone];

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex shrink-0 cursor-default items-center justify-center border',
        chipClass,
        chipStyles[tone],
        className,
      )}
    >
      <Icon className={iconClass} strokeWidth={2.25} aria-hidden />
    </span>
  );
}

export function ExpertResourceBadges({
  expert,
  max = 4,
  size = 'sm',
  variant = 'default',
  className,
}: {
  expert: ITExpert;
  max?: number;
  size?: 'sm' | 'md';
  variant?: 'default' | 'onDark';
  className?: string;
}) {
  const badges = resourceBadgesForExpert(expert);
  const visible = badges.slice(0, max);
  const overflow = badges.length - visible.length;

  return (
    <span className={cn('inline-flex items-center gap-1', className)} role="list" aria-label="Expert attributes">
      {visible.map((badge) => (
        <span key={badge.key} role="listitem">
          <LeafBadge tone={badge.tone} title={badge.title} size={size} variant={variant} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex h-5 items-center rounded border px-1 text-[9px] font-black',
            variant === 'onDark'
              ? 'border-white/25 bg-white/10 text-white/90'
              : 'border-[#0091F9]/25 bg-[#0091F9]/8 text-[#0072CE]',
          )}
          title={badges.slice(max).map((b) => b.title).join(' · ')}
          aria-label={`${overflow} more attributes`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

/** @deprecated Use ExpertResourceBadges — kept as alias showing all attribute badges */
export function ExpertStatusLeaf({
  expert,
  size = 'sm',
  variant = 'default',
  className,
}: {
  expert: ITExpert;
  size?: 'sm' | 'md';
  variant?: 'default' | 'onDark';
  className?: string;
}) {
  return <ExpertResourceBadges expert={expert} size={size} variant={variant} className={className} />;
}

function LegendChip({ tone, label }: { tone: LeafTone; label: string }) {
  const Icon = ICON_BY_TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5',
        BADGE_CHIP_STYLES[tone],
      )}
      title={label}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="text-[10px] font-bold leading-none">{label}</span>
    </span>
  );
}

export function ResourceBadgeLegend({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const items = compact
    ? BADGE_LEGEND.filter((b) => !['partially_allocated', 'fully_booked'].includes(b.tone))
    : BADGE_LEGEND;

  return (
    <div
      className={cn(
        'rounded-lg border border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-[#00ADEF]/5 shadow-[inset_3px_0_0_0_#0091F9]',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
        className,
      )}
      aria-label="Badge legend"
    >
      {!compact && (
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-wider text-[#0091F9]">
          TeamOne resource indicators
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map(({ tone, label }) => (
          <LegendChip key={tone} tone={tone} label={label} />
        ))}
      </div>
    </div>
  );
}
