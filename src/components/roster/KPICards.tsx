import React from 'react';
import { cn } from '../../lib/utils';

type KPICardProps = {
  label: string;
  value: number;
  color: 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'teal' | 'navy';
  compact?: boolean;
};

const colorMap = {
  green: { dot: 'bg-emerald-500', value: 'text-emerald-600' },
  orange: { dot: 'bg-amber-500', value: 'text-amber-600' },
  blue: { dot: 'bg-sky-500', value: 'text-sky-600' },
  red: { dot: 'bg-red-500', value: 'text-red-600' },
  purple: { dot: 'bg-violet-500', value: 'text-violet-600' },
  teal: { dot: 'bg-teal-500', value: 'text-teal-600' },
  navy: { dot: 'bg-[#0072CE]', value: 'text-[#0072CE]' },
};

export function KPICard({ label, value, color, compact }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', compact ? 'px-3 py-2' : 'px-4 py-3')}>
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', c.dot)} />
        <span className="text-[11px] font-bold text-slate-500">{label}</span>
      </div>
      <div className={cn('mt-0.5 font-black', c.value, compact ? 'text-xl' : 'text-2xl')}>
        {value}
        <span className="ml-1 text-[11px] font-bold text-slate-400">experts</span>
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
        <KPICard label="Total Experts" value={kpis.total ?? 0} color="navy" />
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
  const cards = [
    { label: 'Available Experts', value: kpis.availableThisWeek, color: 'green' as const, detail: 'Ready for assignment this week' },
    { label: 'Upcoming Capacity', value: kpis.availableNext30, color: 'teal' as const, detail: 'Available within 30 days' },
    { label: 'High Demand Skills', value: 5, color: 'navy' as const, detail: 'Cloud, ServiceNow, Security' },
    { label: 'Overallocated Resources', value: kpis.overallocated, color: 'orange' as const, detail: 'Above 80% allocation' },
    { label: 'Underutilized Experts', value: kpis.underutilized, color: 'blue' as const, detail: 'Below 30% utilization' },
    { label: 'Staffing Gaps', value: 3, color: 'purple' as const, detail: 'Open requisitions unfilled' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-white/80 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0072CE] via-teal-400 to-[#1F7A8C]" />
          <div className="text-[11px] font-black uppercase text-[#172554]">{card.label}</div>
          <div className={cn('mt-1 text-3xl font-black', colorMap[card.color].value)}>{card.value}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">{card.detail}</div>
        </div>
      ))}
    </div>
  );
}
