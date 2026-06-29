import React from 'react';
import type { DashboardView } from '../../types/expert';
import AppHeader from './AppHeader';
import BackLink from './BackLink';
import { cn } from '../../lib/utils';

type RosterPlanningLayoutProps = {
  children: React.ReactNode;
  activeView?: DashboardView | null;
  title?: string;
  subtitle?: string;
  kpis?: React.ReactNode;
  sidebar?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
};

export default function RosterPlanningLayout({
  children,
  title,
  subtitle,
  kpis,
  sidebar,
  backTo,
  backLabel = 'Back',
}: RosterPlanningLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <section className="flex min-h-0 flex-1 flex-col px-3 py-4 lg:px-4 xl:px-5">
            {(title || kpis) && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-end xl:justify-between xl:p-5">
                  {title && (
                    <div className="min-w-0">
                      {backTo && (
                        <BackLink to={backTo} label={backLabel} className="mb-2" />
                      )}
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0091F9]">TeamOne Roster</p>
                      <h1 className="mt-1 text-2xl font-black text-[#0F1B3D] md:text-3xl">{title}</h1>
                      {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
                    </div>
                  )}
                  {kpis && <div className={cn('min-w-0', title && 'xl:max-w-[55%]')}>{kpis}</div>}
                </div>
              </div>
            )}

            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
