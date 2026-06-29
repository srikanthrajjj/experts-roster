import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type KPIColor = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'teal' | 'navy';

const colorStyles: Record<
  KPIColor,
  { icon: string; value: string; glow: string; accent: string }
> = {
  green: {
    icon: 'bg-emerald-500/15 text-emerald-600',
    value: 'text-emerald-600',
    glow: 'from-emerald-400/25 to-transparent',
    accent: 'bg-emerald-500',
  },
  orange: {
    icon: 'bg-amber-500/15 text-amber-600',
    value: 'text-amber-600',
    glow: 'from-amber-400/25 to-transparent',
    accent: 'bg-amber-500',
  },
  blue: {
    icon: 'bg-sky-500/15 text-sky-600',
    value: 'text-sky-600',
    glow: 'from-sky-400/25 to-transparent',
    accent: 'bg-sky-500',
  },
  red: {
    icon: 'bg-rose-500/15 text-rose-600',
    value: 'text-rose-600',
    glow: 'from-rose-400/25 to-transparent',
    accent: 'bg-rose-500',
  },
  purple: {
    icon: 'bg-violet-500/15 text-violet-600',
    value: 'text-violet-600',
    glow: 'from-violet-400/25 to-transparent',
    accent: 'bg-violet-500',
  },
  teal: {
    icon: 'bg-teal-500/15 text-teal-600',
    value: 'text-teal-600',
    glow: 'from-teal-400/25 to-transparent',
    accent: 'bg-teal-500',
  },
  navy: {
    icon: 'bg-[#0091F9]/15 text-[#0091F9]',
    value: 'text-[#0091F9]',
    glow: 'from-[#0091F9]/20 to-transparent',
    accent: 'bg-[#0091F9]',
  },
};

type KPICardProps = {
  label: string;
  value: number;
  color: KPIColor;
  compact?: boolean;
  suffix?: string;
};

export function KPICard({ label, value, color, compact, suffix = 'experts' }: KPICardProps) {
  const c = colorStyles[color];
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,145,249,0.12)]',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
      )}
    >
      <div className={cn('absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br blur-2xl', c.glow)} />
      <div className={cn('absolute left-0 top-0 h-1 w-full', c.accent, 'opacity-80')} />
      <div className="relative">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</div>
        <div className={cn('mt-1 font-black', c.value, compact ? 'text-xl' : 'text-2xl')}>
          {value}
          <span className="ml-1 text-[10px] font-bold text-slate-400">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

type KPIRowProps = {
  kpis: {
    availableNext30: number;
    partiallyAvailable: number;
    fullyBooked: number;
    onLeave: number;
    total?: number;
    availableThisWeek?: number;
  };
  variant?: 'planning' | 'home';
};

export default function KPICards({ kpis, variant = 'planning' }: KPIRowProps) {
  if (variant === 'home') {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Total Experts" value={kpis.total ?? 0} color="navy" suffix="" />
        <KPICard label="Available This Week" value={kpis.availableThisWeek ?? 0} color="green" />
        <KPICard label="Available in next 30 days" value={kpis.availableNext30} color="green" />
        <KPICard label="Partially available" value={kpis.partiallyAvailable} color="orange" />
        <KPICard label="Fully booked" value={kpis.fullyBooked} color="red" />
        <KPICard label="On leave" value={kpis.onLeave} color="purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 lg:gap-3">
      <KPICard label="Available in next 30 days" value={kpis.availableNext30} color="green" compact />
      <KPICard label="Partially available" value={kpis.partiallyAvailable} color="orange" compact />
      <KPICard label="Fully booked" value={kpis.fullyBooked} color="red" compact />
      <KPICard label="On leave" value={kpis.onLeave} color="purple" compact />
    </div>
  );
}

type ManagerCard = {
  label: string;
  value: number;
  color: KPIColor;
  detail: string;
  icon: LucideIcon;
};

export function ManagerKPICards({
  kpis,
}: {
  kpis: {
    availableThisWeek: number;
    availableNext30: number;
    partiallyAvailable: number;
    fullyBooked: number;
    onLeave: number;
    overallocated: number;
    underutilized: number;
    benchAvailable: number;
    total: number;
  };
}) {
  const cards: ManagerCard[] = [
    {
      label: 'Available Experts',
      value: kpis.availableThisWeek,
      color: 'green',
      detail: 'Ready for assignment this week',
      icon: UserCheck,
    },
    {
      label: 'Upcoming Capacity',
      value: kpis.availableNext30,
      color: 'teal',
      detail: 'Available within 30 days',
      icon: CalendarCheck,
    },
    {
      label: 'Talent Pool',
      value: kpis.total,
      color: 'navy',
      detail: `${kpis.benchAvailable} bench-ready now`,
      icon: Users,
    },
    {
      label: 'Overallocated',
      value: kpis.overallocated,
      color: 'orange',
      detail: 'Above 80% allocation',
      icon: AlertTriangle,
    },
    {
      label: 'Underutilized',
      value: kpis.underutilized,
      color: 'blue',
      detail: 'Below 30% utilization',
      icon: TrendingDown,
    },
    {
      label: 'Staffing Gaps',
      value: 3,
      color: 'purple',
      detail: 'Open requisitions unfilled',
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const c = colorStyles[card.color];
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(0,145,249,0.15)]"
          >
            <div className={cn('absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl', c.glow)} />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0091F9] via-[#00ADEF] to-[#0072CE] opacity-90" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#172554]">{card.label}</div>
                <div className={cn('mt-1 text-4xl font-black tabular-nums', c.value)}>{card.value}</div>
                <div className="mt-1.5 text-xs font-medium text-slate-500">{card.detail}</div>
              </div>
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', c.icon)}>
                <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0091F9] via-[#0072CE] to-[#0055A6] px-6 py-7 text-white shadow-[0_28px_80px_rgba(0,145,249,0.35)] sm:px-8 sm:py-9',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#00ADEF]/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm font-medium text-white/85 sm:text-base">{subtitle}</p>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>
    </section>
  );
}

export function UtilizationRing({
  value,
  size = 120,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const tone =
    value >= 80 ? 'text-rose-400' : value >= 50 ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-700', tone)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tabular-nums">{value}%</span>
          {label && <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</span>}
        </div>
      </div>
      {sublabel && <p className="mt-2 text-center text-xs font-medium text-white/75">{sublabel}</p>}
    </div>
  );
}

export function InsightPanel({
  title,
  icon: Icon,
  iconClassName,
  action,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', iconClassName ?? 'bg-[#0091F9]/10 text-[#0091F9]')}>
            <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </div>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#172554]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
