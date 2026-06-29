import type { ITExpert } from '../types/expert';

export type SearchSuggestion = {
  type: 'expert';
  label: string;
  sublabel: string;
  expertId: string;
  matchHint?: string;
};

export function getExpertSearchableText(expert: ITExpert): string {
  return [
    expert.name,
    expert.title,
    expert.role,
    expert.country,
    expert.location,
    expert.team,
    expert.timezone,
    expert.bio,
    expert.summary,
    expert.functionalArea,
    expert.businessUnit,
    expert.contractType,
    expert.experienceLevel,
    expert.certificationLevel,
    ...(expert.skills ?? []),
    ...(expert.technologyStack ?? []),
    ...(expert.languages ?? []),
    ...(expert.regions ?? []),
    ...(expert.specialCapabilities ?? []),
    ...(expert.certifications ?? []).map((c) => (typeof c === 'string' ? c : c.name)),
    ...(expert.expertiseLevels ?? []).map((e) => e.skill),
  ]
    .join(' ')
    .toLowerCase();
}

export function expertMatchesSearch(expert: ITExpert, query: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const searchable = getExpertSearchableText(expert);
  return tokens.every((token) => searchable.includes(token));
}

function findMatchHint(expert: ITExpert, query: string): string | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;

  const skill = expert.skills.find((s) => s.toLowerCase().includes(q));
  if (skill) return skill;

  const cert = expert.certifications.find((c) => {
    const name = typeof c === 'string' ? c : c.name;
    return name.toLowerCase().includes(q);
  });
  if (cert) return typeof cert === 'string' ? cert : cert.name;

  if (expert.country.toLowerCase().includes(q)) return expert.country;
  if (expert.functionalArea.toLowerCase().includes(q)) return expert.functionalArea;
  if (expert.role.toLowerCase().includes(q)) return expert.role;

  return undefined;
}

export function getSearchSuggestions(
  experts: ITExpert[],
  query: string,
  limit = 8,
): SearchSuggestion[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return experts
    .filter((expert) => expertMatchesSearch(expert, trimmed))
    .slice(0, limit)
    .map((expert) => ({
      type: 'expert' as const,
      label: expert.name,
      sublabel: [expert.role, expert.country].filter(Boolean).join(' · '),
      expertId: expert.id,
      matchHint: findMatchHint(expert, trimmed),
    }));
}
