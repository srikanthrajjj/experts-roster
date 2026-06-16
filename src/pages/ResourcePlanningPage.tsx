import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/roster/FilterSidebar';
import KPICards from '../components/roster/KPICards';
import RosterPlanningLayout from '../components/roster/RosterPlanningLayout';
import GanttView from '../components/roster/GanttView';
import ExpertDetailPanel from '../components/roster/ExpertDetailPanel';
import ExpertCard from '../components/roster/ExpertCard';
import ExpertListView from '../components/roster/ExpertListView';
import ExpertRosterToolbar from '../components/roster/ExpertRosterToolbar';
import CalendarView from '../components/roster/CalendarView';
import CapacityOverview from '../components/roster/CapacityOverview';
import SendEmailModal from '../components/roster/SendEmailModal';
import { useExpertProfileModal } from '../contexts/ExpertProfileModalContext';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import { DEFAULT_FILTERS, type DashboardView, type FilterState, type ITExpert } from '../types/expert';
import { countActiveFilters, filterExperts } from '../lib/filterExperts';
import { sortExperts, type SortOrder } from '../lib/expertDisplay';
import { DEFAULT_ROSTER_VIEW, parseRosterView } from '../lib/rosterView';
import type { RosterViewMode } from '../components/roster/ViewToggle';

export default function ResourcePlanningPage() {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const initialSearch = searchParams.get('search') ?? '';
  const layoutParam = searchParams.get('layout') as RosterViewMode | null;
  const parsedView = parseRosterView(viewParam);
  const initialView = parsedView ?? DEFAULT_ROSTER_VIEW;
  const initialListViewMode: RosterViewMode =
    layoutParam === 'cards' || layoutParam === 'list' ? layoutParam : 'list';

  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, search: initialSearch });
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>(initialView);
  const [selectedExpert, setSelectedExpert] = useState<ITExpert | null>(MOCK_IT_EXPERTS[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1));
  const [zoom, setZoom] = useState<'weekly' | 'monthly'>('weekly');
  const [emailExpert, setEmailExpert] = useState<ITExpert | null>(null);
  const [listViewMode, setListViewMode] = useState<RosterViewMode>(initialListViewMode);
  const [sortOrder, setSortOrder] = useState<SortOrder>('A-Z');
  const { openProfile } = useExpertProfileModal();

  const filteredExperts = useMemo(() => filterExperts(MOCK_IT_EXPERTS, filters), [filters]);
  const sortedExperts = useMemo(() => sortExperts(filteredExperts, sortOrder), [filteredExperts, sortOrder]);
  const kpis = useMemo(() => computeKPIs(MOCK_IT_EXPERTS), []);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    const nextView = parseRosterView(viewParam) ?? DEFAULT_ROSTER_VIEW;
    if (nextView !== activeView) {
      setActiveView(nextView);
    }
  }, [viewParam, activeView]);

  useEffect(() => {
    if (activeView === 'list' && listViewMode === 'list') {
      setSelectedExpert(null);
    }
  }, [activeView, listViewMode]);

  return (
    <RosterPlanningLayout
      activeView={activeView}
      title="Resource availability & planning"
      subtitle="View experts availability, plan engagements and manage allocations."
      kpis={<KPICards kpis={kpis} variant="planning" />}
      sidebar={
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          collapsed={filtersCollapsed}
          onToggleCollapse={() => setFiltersCollapsed((v) => !v)}
          activeCount={activeCount}
        />
      }
    >
      <div className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-xl rounded-tr-xl border border-t-0 border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.08)]">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3">
          <ExpertRosterToolbar
            searchValue={filters.search}
            onSearchChange={(v) => setFilters({ ...filters, search: v })}
            searchPlaceholder="Search experts..."
            filters={filters}
            onFiltersChange={setFilters}
            onClearAllFilters={() => setFilters(DEFAULT_FILTERS)}
            expertCount={sortedExperts.length}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            viewMode={listViewMode}
            onViewModeChange={setListViewMode}
            showViewToggle={activeView === 'list'}
          />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-hidden">
            {activeView === 'gantt' && (
              <GanttView
                experts={filteredExperts}
                selectedExpertId={selectedExpert?.id}
                onSelectExpert={setSelectedExpert}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            )}
            {activeView === 'list' && listViewMode === 'list' && (
              <div className="custom-scrollbar h-full overflow-auto">
                <ExpertListView
                  experts={sortedExperts}
                  onContact={(expert) => setEmailExpert(expert)}
                  onViewProfile={(expert) => openProfile(expert.id)}
                />
              </div>
            )}
            {activeView === 'list' && listViewMode === 'cards' && (
              <div className="custom-scrollbar h-full overflow-auto p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sortedExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      selected={selectedExpert?.id === expert.id}
                      onSelect={() => setSelectedExpert(expert)}
                      onContact={() => setEmailExpert(expert)}
                      onViewProfile={() => setSelectedExpert(expert)}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
            {activeView === 'calendar' && (
              <CalendarView
                experts={filteredExperts}
                selectedExpertId={selectedExpert?.id}
                onSelectExpert={(expert) => setSelectedExpert(expert)}
              />
            )}
            {activeView === 'capacity' && <CapacityOverview experts={filteredExperts} />}
          </div>

          {selectedExpert &&
            (activeView === 'gantt' ||
              activeView === 'calendar' ||
              (activeView === 'list' && listViewMode === 'cards')) && (
            <ExpertDetailPanel
              expert={selectedExpert}
              onClose={() => setSelectedExpert(null)}
              onViewProfile={() => openProfile(selectedExpert.id)}
              managerMode
            />
          )}
        </div>
      </div>

      <SendEmailModal expert={emailExpert} onClose={() => setEmailExpert(null)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.32); border-radius: 999px; }
      `}</style>
    </RosterPlanningLayout>
  );
}
