import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/roster/AppHeader';
import FilterSidebar from '../components/roster/FilterSidebar';
import KPICards from '../components/roster/KPICards';
import ExpertCard from '../components/roster/ExpertCard';
import ExpertDetailPanel from '../components/roster/ExpertDetailPanel';
import ExpertListView from '../components/roster/ExpertListView';
import ExpertRosterToolbar from '../components/roster/ExpertRosterToolbar';
import SendEmailModal from '../components/roster/SendEmailModal';
import { useExpertProfileModal } from '../contexts/ExpertProfileModalContext';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import { DEFAULT_FILTERS, type FilterState, type ITExpert } from '../types/expert';
import { countActiveFilters, filterExperts } from '../lib/filterExperts';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { sortExperts, type SortOrder } from '../lib/expertDisplay';
import type { RosterViewMode } from '../components/roster/ViewToggle';

const VALID_LAYOUTS: RosterViewMode[] = ['list', 'cards'];

export default function ExpertDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const layoutParam = searchParams.get('layout') as RosterViewMode | null;
  const initialLayout = layoutParam && VALID_LAYOUTS.includes(layoutParam) ? layoutParam : 'list';

  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, search: initialSearch });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 250);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ITExpert | null>(null);
  const [emailExpert, setEmailExpert] = useState<ITExpert | null>(null);
  const [viewMode, setViewMode] = useState<RosterViewMode>(initialLayout);
  const [sortOrder, setSortOrder] = useState<SortOrder>('A-Z');
  const { openProfile } = useExpertProfileModal();

  // Read expert data from localStorage so discovery page sees expert edits
  const [expertsData, setExpertsData] = useState<ITExpert[]>(() => {
    const saved = localStorage.getItem('expert_dashboard_data');
    return saved ? JSON.parse(saved) : MOCK_IT_EXPERTS;
  });

  useEffect(() => {
    const syncData = () => {
      const saved = localStorage.getItem('expert_dashboard_data');
      if (saved) setExpertsData(JSON.parse(saved));
    };
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, []);

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

  const filteredExperts = useMemo(() => filterExperts(expertsData, filters), [expertsData, filters]);
  const sortedExperts = useMemo(() => sortExperts(filteredExperts, sortOrder), [filteredExperts, sortOrder]);
  const kpis = useMemo(() => computeKPIs(expertsData), [expertsData]);
  const activeCount = countActiveFilters(filters);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    if (next.search !== searchInput) setSearchInput(next.search);
  };

  const handleViewModeChange = (mode: RosterViewMode) => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('layout', mode);
      return next;
    });
  };

  useEffect(() => {
    if (viewMode === 'list') {
      setSelectedExpert(null);
    }
  }, [viewMode]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EEF5FC] text-slate-800">
      <AppHeader />

      <div className="flex min-h-0 flex-1 overflow-hidden">
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-4 lg:px-4 xl:px-5">
            <div className="mb-6 shrink-0">
              <h1 className="text-2xl font-black text-[#0F1B3D] md:text-3xl">Discover IT & Technology Experts</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">Find, evaluate, and engage technical talent across UNICEF</p>
            </div>

            <div className="mb-6 shrink-0">
              <KPICards kpis={kpis} variant="home" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="shrink-0 border-b border-slate-200 p-4">
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
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  showSuggestions
                  showTypeahead
                  experts={expertsData}
                  onSelectExpert={(id) => openProfile(id)}
                />
              </div>

              <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="custom-scrollbar min-w-0 flex-1 overflow-auto p-4">
                  {viewMode === 'cards' ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {sortedExperts.map((expert) => (
                        <ExpertCard
                          key={expert.id}
                          expert={expert}
                          selected={selectedExpert?.id === expert.id}
                          onSelect={() => setSelectedExpert(expert)}
                          onContact={() => setEmailExpert(expert)}
                          onViewProfile={() => setSelectedExpert(expert)}
                        />
                      ))}
                    </div>
                  ) : (
                    <ExpertListView
                      experts={sortedExperts}
                      onContact={(expert) => setEmailExpert(expert)}
                      onViewProfile={(expert) => openProfile(expert.id)}
                    />
                  )}

                  {sortedExperts.length === 0 && (
                    <div className="flex flex-col items-center py-20 text-center">
                      <h3 className="text-lg font-black text-[#0F1B3D]">No experts found</h3>
                      <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                      <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-4 rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-black text-white">
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>

                {selectedExpert && viewMode === 'cards' && (
                  <ExpertDetailPanel
                    expert={selectedExpert}
                    onClose={() => setSelectedExpert(null)}
                    onViewProfile={() => openProfile(selectedExpert.id)}
                  />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <SendEmailModal
        expert={emailExpert}
        onClose={() => setEmailExpert(null)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(100,116,139,0.32); border-radius: 999px; }
      `}</style>
    </div>
  );
}
