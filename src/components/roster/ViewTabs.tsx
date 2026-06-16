import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { DashboardView } from '../../types/expert';
import { cn } from '../../lib/utils';
import { rosterPlanningPath } from '../../lib/rosterView';

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: 'list', label: 'Expert list' },
  { id: 'gantt', label: 'Gantt view' },
  { id: 'calendar', label: 'Calendar view' },
  { id: 'capacity', label: 'Capacity overview' },
];

type ViewTabsProps = {
  active?: DashboardView | null;
  onChange: (view: DashboardView) => void;
  className?: string;
};

export default function ViewTabs({ active, onChange, className }: ViewTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1 border-b border-slate-200', className)}>
      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'border-b-[3px] px-4 py-3 text-sm font-black transition',
            active === id ? 'border-[#0072CE] text-[#0072CE]' : 'border-transparent text-slate-600 hover:text-slate-800',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function RosterViewTabs({ active, className }: { active?: DashboardView | null; className?: string }) {
  const navigate = useNavigate();

  const handleChange = (view: DashboardView) => {
    navigate(rosterPlanningPath(view));
  };

  return <ViewTabs active={active} onChange={handleChange} className={className} />;
}
