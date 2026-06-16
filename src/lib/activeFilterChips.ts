import { SKILL_GROUPS } from '../data/skillGroups';
import type { FilterState } from '../types/expert';

export type ActiveFilterChip = {
  key: string;
  label: string;
  value: string;
};

const SELECT_FILTER_LABELS: Partial<Record<keyof FilterState, string>> = {
  availabilityStatus: 'Availability',
  allocationRange: 'Allocation',
  functionalArea: 'Functional area',
  businessUnit: 'Business unit',
  region: 'Region',
  timezone: 'Time zone',
  contractType: 'Contract',
  experienceLevel: 'Experience',
  certificationLevel: 'Certification',
  language: 'Language',
};

const SELECT_FILTER_KEYS = Object.keys(SELECT_FILTER_LABELS) as (keyof FilterState)[];

export function buildActiveFilterChips(filters: FilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: 'search',
      label: 'Search',
      value: filters.search.trim(),
    });
  }

  for (const key of SELECT_FILTER_KEYS) {
    const value = filters[key];
    if (typeof value === 'string' && value !== 'All') {
      chips.push({
        key,
        label: SELECT_FILTER_LABELS[key] ?? key,
        value,
      });
    }
  }

  for (const groupId of filters.skillGroups) {
    const group = SKILL_GROUPS.find((g) => g.id === groupId);
    chips.push({
      key: `skillGroup-${groupId}`,
      label: 'Skill group',
      value: group?.name ?? groupId,
    });
  }

  return chips;
}

export function clearActiveFilterChip(filters: FilterState, chipKey: string): FilterState {
  if (chipKey === 'search') {
    return { ...filters, search: '' };
  }

  if (chipKey.startsWith('skillGroup-')) {
    const groupId = chipKey.slice('skillGroup-'.length);
    return {
      ...filters,
      skillGroups: filters.skillGroups.filter((id) => id !== groupId),
    };
  }

  if (SELECT_FILTER_KEYS.includes(chipKey as keyof FilterState)) {
    return { ...filters, [chipKey]: 'All' };
  }

  return filters;
}
