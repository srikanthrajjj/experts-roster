import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/roster/FilterSidebar';
import KPICards from '../components/roster/KPICards';
import RosterPlanningLayout from '../components/roster/RosterPlanningLayout';
import ExpertCard from '../components/roster/ExpertCard';
import ExpertListView from '../components/roster/ExpertListView';
import ExpertRosterToolbar from '../components/roster/ExpertRosterToolbar';
import { Mail, Send, X } from 'lucide-react';
import SendEmailModal from '../components/roster/SendEmailModal';
import SendMultiEmailModal from '../components/roster/SendMultiEmailModal';
import { useExpertProfileModal } from '../contexts/ExpertProfileModalContext';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import { DEFAULT_FILTERS, type FilterState, type ITExpert } from '../types/expert';
import { countActiveFilters, filterExperts } from '../lib/filterExperts';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { isExpertRole } from '../lib/userRole';
import { sortExperts, type SortOrder } from '../lib/expertDisplay';
import type { RosterViewMode } from '../components/roster/ViewToggle';
import { cn } from '../lib/utils';

export default function ResourcePlanningPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const layoutParam = searchParams.get('layout') as RosterViewMode | null;
  const initialListViewMode: RosterViewMode =
    layoutParam === 'cards' || layoutParam === 'list' ? layoutParam : 'list';

  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, search: initialSearch });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));

  useEffect(() => {
    if (isExpertRole(localStorage.getItem('userRole'))) {
      navigate('/roster/expert-dashboard', { replace: true });
    }

    const handleStorageChange = () => {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      if (isExpertRole(role)) {
        navigate('/roster/expert-dashboard', { replace: true });
      }
      
      const savedData = localStorage.getItem('expert_dashboard_data');
      if (savedData) {
        setExpertsData(JSON.parse(savedData));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  useEffect(() => {
    setFilters((prev) => (prev.search === debouncedSearch ? prev : { ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== debouncedSearch) {
      setSearchInput(urlSearch);
      setFilters((prev) => ({ ...prev, search: urlSearch }));
    }
  }, [searchParams, debouncedSearch]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim());
        else next.delete('search');
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, setSearchParams]);

  const [expertsData, setExpertsData] = useState<ITExpert[]>(() => {
    const saved = localStorage.getItem('expert_dashboard_data');
    return saved ? JSON.parse(saved) : MOCK_IT_EXPERTS;
  });

  const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([]);
  const [isMultiEmailOpen, setIsMultiEmailOpen] = useState(false);

  const handleToggleSelectExpert = (id: string) => {
    setSelectedExpertIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [emailExpert, setEmailExpert] = useState<ITExpert | null>(null);
  const [listViewMode, setListViewMode] = useState<RosterViewMode>(initialListViewMode);
  const [sortOrder, setSortOrder] = useState<SortOrder>('A-Z');
  const { openProfile } = useExpertProfileModal();

  const filteredExperts = useMemo(() => filterExperts(expertsData, filters), [expertsData, filters]);
  const sortedExperts = useMemo(() => sortExperts(filteredExperts, sortOrder), [filteredExperts, sortOrder]);
  const kpis = useMemo(() => computeKPIs(expertsData), [expertsData]);
  const activeCount = countActiveFilters(filters);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    if (next.search !== searchInput) setSearchInput(next.search);
  };

  return (
    <RosterPlanningLayout
      title="Resource availability & planning"
      subtitle="View experts availability, plan engagements and manage allocations."
      kpis={<KPICards kpis={kpis} variant="planning" />}
      sidebar={
        <FilterSidebar
          filters={filters}
          onChange={handleFiltersChange}
          onClear={() => {
            setSearchInput('');
            setFilters(DEFAULT_FILTERS);
          }}
          collapsed={filtersCollapsed}
          onToggleCollapse={() => setFiltersCollapsed((v) => !v)}
          activeCount={activeCount}
        />
      }
    >
      <div className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-xl rounded-tr-xl border border-t-0 border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.08)]">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3">
          <ExpertRosterToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Search by name, skill, country..."
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearAllFilters={() => {
              setSearchInput('');
              setFilters(DEFAULT_FILTERS);
            }}
            expertCount={sortedExperts.length}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            viewMode={listViewMode}
            onViewModeChange={setListViewMode}
            showViewToggle={true}
            showSuggestions
            showTypeahead
            experts={expertsData}
            onSelectExpert={(id) => openProfile(id)}
          />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-hidden">
            {sortedExperts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 py-20 text-center">
                <h3 className="text-lg font-black text-[#0F1B3D]">No experts found</h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Try a different name, skill, country, or certification — or clear your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setFilters(DEFAULT_FILTERS);
                  }}
                  className="mt-4 rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-black text-white"
                >
                  Reset filters
                </button>
              </div>
            ) : listViewMode === 'list' ? (
              <div className="custom-scrollbar h-full overflow-auto pb-16">
                <ExpertListView
                  experts={sortedExperts}
                  onContact={(expert) => setEmailExpert(expert)}
                  onViewProfile={(expert) => openProfile(expert.id)}
                  selectedExpertIds={selectedExpertIds}
                  onToggleSelectExpert={handleToggleSelectExpert}
                  onToggleSelectAll={setSelectedExpertIds}
                />
              </div>
            ) : (
              <div className="custom-scrollbar h-full overflow-auto p-4 pb-16">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sortedExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      onSelect={() => openProfile(expert.id)}
                      onContact={() => setEmailExpert(expert)}
                      onViewProfile={() => openProfile(expert.id)}
                      compact
                      selectedExpertIds={selectedExpertIds}
                      onToggleSelectExpert={handleToggleSelectExpert}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SendEmailModal expert={emailExpert} onClose={() => setEmailExpert(null)} />

      {isMultiEmailOpen && (
        <SendMultiEmailModal
          experts={expertsData.filter((ex) => selectedExpertIds.includes(ex.id))}
          onClose={() => setIsMultiEmailOpen(false)}
          onSent={() => setSelectedExpertIds([])}
        />
      )}

      {selectedExpertIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.15)] flex items-center gap-6 animate-slide-up max-w-[90vw] md:max-w-2xl">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-2.5 overflow-hidden shrink-0">
              {expertsData
                .filter((ex) => selectedExpertIds.includes(ex.id))
                .slice(0, 5)
                .map((ex) => {
                  const palette = [
                    'bg-rose-100 text-rose-700 border-rose-200',
                    'bg-emerald-100 text-emerald-700 border-emerald-200',
                    'bg-sky-100 text-sky-700 border-sky-200',
                    'bg-violet-100 text-violet-700 border-violet-200',
                    'bg-amber-100 text-amber-800 border-amber-200'
                  ][Number(ex.id) % 5];
                  return (
                    <div
                      key={ex.id}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black border border-white ring-1 ring-slate-200/50 shadow-sm",
                        palette
                      )}
                      title={ex.name}
                    >
                      {ex.initials}
                    </div>
                  );
                })}
              {selectedExpertIds.length > 5 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-white text-[9px] font-black text-slate-600 ring-1 ring-slate-200/50 shadow-sm shrink-0">
                  +{selectedExpertIds.length - 5}
                </div>
              )}
            </div>
            
            {/* Text details */}
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 leading-none">
                {selectedExpertIds.length} {selectedExpertIds.length === 1 ? 'expert' : 'experts'} selected
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-none">
                Batch outreach ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 border-l border-slate-150 pl-4">
            <button
              type="button"
              onClick={() => setIsMultiEmailOpen(true)}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0072CE] hover:bg-[#0055A6] px-4 text-xs font-black text-white transition shadow-sm cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Email selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedExpertIds([])}
              title="Clear selection"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.32); border-radius: 999px; }
      `}</style>
    </RosterPlanningLayout>
  );
}
