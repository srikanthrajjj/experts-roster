import React from 'react';
import type { DashboardView } from '../../types/expert';
import AppHeader from './AppHeader';
import { RosterViewTabs } from './ViewTabs';

type AppHeaderProps = React.ComponentProps<typeof AppHeader>;

type RosterPlanningLayoutProps = {
  children: React.ReactNode;
  activeView?: DashboardView | null;
  title?: string;
  subtitle?: string;
  kpis?: React.ReactNode;
  sidebar?: React.ReactNode;
  appHeaderProps?: AppHeaderProps;
};

export default function RosterPlanningLayout({
  children,
  activeView,
  title,
  subtitle,
  kpis,
  sidebar,
  appHeaderProps,
}: RosterPlanningLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EEF5FC] text-slate-800">
      <AppHeader {...appHeaderProps} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <section className="flex min-h-0 flex-1 flex-col px-3 py-4 lg:px-4 xl:px-5">
            {(title || kpis) && (
              <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                {title && (
                  <div className="min-w-0">
                    <h1 className="text-2xl font-black text-[#0F1B3D] md:text-3xl">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
                  </div>
                )}
                {kpis}
              </div>
            )}

            <RosterViewTabs active={activeView} />

            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
