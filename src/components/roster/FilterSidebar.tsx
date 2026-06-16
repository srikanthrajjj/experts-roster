import React from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import type { FilterState } from '../../types/expert';
import {
  ALLOCATION_RANGES,
  AVAILABILITY_STATUSES,
  BUSINESS_UNITS,
  CERTIFICATION_LEVELS,
  CONTRACT_TYPES,
  EXPERIENCE_LEVELS,
  FUNCTIONAL_AREAS,
  LANGUAGES,
  REGIONS,
  TIMEZONES,
} from '../../data/constants';
import { SKILL_GROUPS } from '../../data/skillGroups';
import { MOCK_IT_EXPERTS } from '../../data/itExperts';
import { countExpertsInSkillGroup } from '../../lib/skillGroups';
import { FilterSelect, FilterMultiSelect } from './SharedUI';
import { cn } from '../../lib/utils';

type FilterSidebarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeCount: number;
};

function SectionHeader({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-2 text-xs font-black uppercase text-[#172554]">
      {title}
      <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen ? 'rotate-0' : '-rotate-90')} />
    </button>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  collapsed = false,
  onToggleCollapse,
  activeCount,
}: FilterSidebarProps) {
  const [openGroups, setOpenGroups] = React.useState({ basic: true, skillGroups: true, advanced: false, experience: false });

  const skillGroupOptions = React.useMemo(
    () =>
      SKILL_GROUPS.map((group) => ({
        value: group.id,
        label: group.name,
        count: countExpertsInSkillGroup(MOCK_IT_EXPERTS, group.id),
      })),
    [],
  );

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const toggle = (group: keyof typeof openGroups) => {
    setOpenGroups((g) => ({ ...g, [group]: !g[group] }));
  };

  if (collapsed) {
    return (
      <aside className="hidden h-full min-h-0 w-[76px] shrink-0 border-r border-slate-200 bg-white/95 shadow-[10px_0_35px_rgba(15,23,42,0.06)] xl:flex xl:flex-col">
        <div className="flex justify-center border-b border-slate-100 px-3 py-3">
          <button
            type="button"
            title="Expand filters"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0072CE]/40 hover:text-[#0072CE]"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-4 px-4 py-5">
          <SlidersHorizontal className="h-5 w-5 text-[#0072CE]" />
          <div className="rounded-full bg-[#0072CE] px-2.5 py-1 text-xs font-black text-white">{activeCount}</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden h-full min-h-0 w-[304px] shrink-0 border-r border-slate-200 bg-white/95 shadow-[10px_0_35px_rgba(15,23,42,0.06)] xl:flex xl:flex-col">
      <div className="shrink-0 border-b border-slate-100 bg-white/95 px-3 py-2">
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 flex-1 text-lg font-black text-[#0F1B3D]">Add filters</h2>
          <button
            type="button"
            title="Collapse filters"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0072CE]/40 hover:text-[#0072CE]"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <SectionHeader title="Basic Filters" isOpen={openGroups.basic} onToggle={() => toggle('basic')} />
            {openGroups.basic && (
              <div className="mt-3 space-y-3">
                <FilterSelect label="Availability Status" value={filters.availabilityStatus} options={AVAILABILITY_STATUSES} onChange={(v) => update('availabilityStatus', v)} />
                <FilterSelect label="Current Allocation %" value={filters.allocationRange} options={ALLOCATION_RANGES} onChange={(v) => update('allocationRange', v)} />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <SectionHeader title="Skills Groups" isOpen={openGroups.skillGroups} onToggle={() => toggle('skillGroups')} />
            {openGroups.skillGroups && (
              <div className="mt-3 space-y-3">
                <FilterSelect label="Functional Area" value={filters.functionalArea} options={FUNCTIONAL_AREAS} onChange={(v) => update('functionalArea', v)} />
                <FilterMultiSelect
                  label="Technology skill groups"
                  options={skillGroupOptions}
                  selected={filters.skillGroups}
                  onChange={(skillGroups) => onChange({ ...filters, skillGroups })}
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <SectionHeader title="Organization" isOpen={openGroups.advanced} onToggle={() => toggle('advanced')} />
            {openGroups.advanced && (
              <div className="mt-3 space-y-3">
                <FilterSelect label="Business Unit" value={filters.businessUnit} options={BUSINESS_UNITS} onChange={(v) => update('businessUnit', v)} />
                <FilterSelect label="Region" value={filters.region} options={REGIONS} onChange={(v) => update('region', v)} />
                <FilterSelect label="Time Zone" value={filters.timezone} options={TIMEZONES} onChange={(v) => update('timezone', v)} />
                <FilterSelect label="Contract Type" value={filters.contractType} options={CONTRACT_TYPES} onChange={(v) => update('contractType', v)} />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <SectionHeader title="Experience & Language" isOpen={openGroups.experience} onToggle={() => toggle('experience')} />
            {openGroups.experience && (
              <div className="mt-3 space-y-3">
                <FilterSelect label="Experience Level" value={filters.experienceLevel} options={EXPERIENCE_LEVELS} onChange={(v) => update('experienceLevel', v)} />
                <FilterSelect label="Certification Level" value={filters.certificationLevel} options={CERTIFICATION_LEVELS} onChange={(v) => update('certificationLevel', v)} />
                <FilterSelect label="Language" value={filters.language} options={LANGUAGES} onChange={(v) => update('language', v)} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClear}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-[#0072CE] shadow-sm transition hover:border-[#0072CE]/40 hover:bg-sky-50"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      </div>
    </aside>
  );
}
