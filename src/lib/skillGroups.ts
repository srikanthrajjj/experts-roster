import { SKILL_GROUPS } from '../data/skillGroups';
import type { ITExpert } from '../types/expert';

function getExpertSearchableText(expert: ITExpert): string {
  return [
    expert.name,
    expert.title,
    expert.role,
    expert.functionalArea,
    expert.team,
    ...expert.skills,
    ...expert.technologyStack,
    ...expert.certifications,
    ...expert.expertiseLevels.map((e) => e.skill),
    ...expert.specialCapabilities,
    ...expert.pastMissions.flatMap((m) => [m.title, m.role, ...(m.technologies ?? [])]),
  ]
    .join(' ')
    .toLowerCase();
}

export function expertMatchesSkillGroup(expert: ITExpert, groupId: string): boolean {
  const group = SKILL_GROUPS.find((g) => g.id === groupId);
  if (!group) return false;

  const searchable = getExpertSearchableText(expert);
  return group.keywords.some((keyword) => searchable.includes(keyword.toLowerCase()));
}

export function getExpertSkillGroupIds(expert: ITExpert): string[] {
  return SKILL_GROUPS.filter((group) => expertMatchesSkillGroup(expert, group.id)).map((g) => g.id);
}

export function countExpertsInSkillGroup(experts: ITExpert[], groupId: string): number {
  return experts.filter((expert) => expertMatchesSkillGroup(expert, groupId)).length;
}
