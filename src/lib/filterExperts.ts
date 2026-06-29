import type { FilterState, ITExpert } from '../types/expert';
import { expertMatchesSkillGroup } from './skillGroups';

export function filterExperts(experts: ITExpert[], filters: FilterState): ITExpert[] {
  return experts.filter((expert) => {
    const keyword = filters.search.trim().toLowerCase();
    if (keyword) {
      const searchable = [
        expert.name,
        expert.title,
        expert.role,
        expert.country,
        expert.team,
        expert.timezone,
        ...expert.skills,
        ...expert.technologyStack,
        ...expert.certifications.map((c) => (typeof c === 'string' ? c : c.name)),
        ...expert.regions,
        expert.functionalArea,
        expert.businessUnit,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(keyword)) return false;
    }

    if (filters.availabilityStatus !== 'All') {
      const statusMap: Record<string, string> = {
        Available: 'available',
        'Partially Allocated': 'partially_allocated',
        'Fully Booked': 'fully_booked',
        'On Leave': 'on_leave',
      };
      if (expert.availabilityStatus !== statusMap[filters.availabilityStatus]) return false;
    }

    if (filters.allocationRange !== 'All') {
      const pct = expert.allocationPercent;
      if (filters.allocationRange === '0-25%' && pct > 25) return false;
      if (filters.allocationRange === '26-50%' && (pct < 26 || pct > 50)) return false;
      if (filters.allocationRange === '51-75%' && (pct < 51 || pct > 75)) return false;
      if (filters.allocationRange === '76-100%' && pct < 76) return false;
    }

    if (filters.skillGroups.length > 0) {
      const matchesAnyGroup = filters.skillGroups.some((groupId) => expertMatchesSkillGroup(expert, groupId));
      if (!matchesAnyGroup) return false;
    }

    if (filters.functionalArea !== 'All' && expert.functionalArea !== filters.functionalArea) return false;
    if (filters.businessUnit !== 'All' && expert.businessUnit !== filters.businessUnit) return false;
    if (filters.region !== 'All' && !expert.regions.includes(filters.region)) return false;
    if (filters.timezone !== 'All' && expert.timezone !== filters.timezone) return false;
    if (filters.contractType !== 'All' && expert.contractType !== filters.contractType) return false;
    if (filters.experienceLevel !== 'All' && expert.experienceLevel !== filters.experienceLevel) return false;
    if (filters.certificationLevel !== 'All' && expert.certificationLevel !== filters.certificationLevel) return false;
    if (filters.language !== 'All' && !expert.languages.includes(filters.language)) return false;

    return true;
  });
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.search.trim().length > 0) count += 1;
  if (filters.skillGroups.length > 0) count += 1;
  const selectKeys: (keyof FilterState)[] = [
    'availabilityStatus',
    'allocationRange',
    'functionalArea',
    'businessUnit',
    'region',
    'timezone',
    'contractType',
    'experienceLevel',
    'certificationLevel',
    'language',
  ];
  for (const key of selectKeys) {
    if (filters[key] !== 'All') count += 1;
  }
  return count;
}
