import React from 'react';
import type { ITExpert } from '../../types/expert';
import { STATUS_LABELS } from '../../data/constants';
import { cn } from '../../lib/utils';

export default function CapacityOverview({ experts }: { experts: ITExpert[] }) {
  const byStatus = {
    available: experts.filter((e) => e.availabilityStatus === 'available'),
    partially_allocated: experts.filter((e) => e.availabilityStatus === 'partially_allocated'),
    fully_booked: experts.filter((e) => e.availabilityStatus === 'fully_booked'),
    on_leave: experts.filter((e) => e.availabilityStatus === 'on_leave'),
  };

  const techDemand = TECH_COUNTS(experts);

  return (
    <div className="custom-scrollbar h-full overflow-auto p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Capacity by status</h3>
          <div className="space-y-3">
            {(Object.keys(byStatus) as Array<keyof typeof byStatus>).map((status) => {
              const count = byStatus[status].length;
              const pct = experts.length ? Math.round((count / experts.length) * 100) : 0;
              const colors = {
                available: 'bg-emerald-500',
                partially_allocated: 'bg-amber-500',
                fully_booked: 'bg-red-500',
                on_leave: 'bg-violet-500',
              };
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>{STATUS_LABELS[status]}</span>
                    <span className="text-slate-500">{count} experts ({pct}%)</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', colors[status])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Utilization distribution</h3>
          <div className="space-y-2">
            {experts.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <span className="w-28 truncate text-xs font-semibold text-slate-600">{e.name.split(' ')[0]}</span>
                <div className="min-w-0 flex-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full', e.utilizationPercent > 80 ? 'bg-red-400' : e.utilizationPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400')}
                    style={{ width: `${e.utilizationPercent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-black text-slate-500">{e.utilizationPercent}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">High demand skills</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {techDemand.map(({ tech, available, total }) => (
              <div key={tech} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <div className="text-xs font-black text-[#0F1B3D]">{tech}</div>
                <div className="mt-1 text-2xl font-black text-[#0072CE]">{available}/{total}</div>
                <div className="text-[10px] font-bold text-slate-400">available / total</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Staffing gaps</h3>
          <div className="space-y-2">
            {[
              { skill: 'ServiceNow Architect', gap: 2, urgency: 'High' },
              { skill: 'Cybersecurity Specialist', gap: 1, urgency: 'Critical' },
              { skill: 'Azure Cloud Engineer', gap: 3, urgency: 'Medium' },
            ].map((g) => (
              <div key={g.skill} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm font-bold text-[#0F1B3D]">{g.skill}</span>
                <span className="text-xs font-bold text-slate-500">{g.gap} open · {g.urgency}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function TECH_COUNTS(experts: ITExpert[]) {
  const techs = ['Azure', 'ServiceNow', 'Salesforce', 'Cybersecurity', 'AI/ML', 'DevOps'];
  return techs.map((tech) => {
    const matching = experts.filter((e) => e.technologyStack.includes(tech));
    const available = matching.filter((e) => e.availabilityStatus === 'available' || e.availabilityStatus === 'partially_allocated').length;
    return { tech, available, total: matching.length };
  }).filter((t) => t.total > 0);
}
