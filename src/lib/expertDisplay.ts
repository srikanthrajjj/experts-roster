export function countryFlagCode(country: string): string | null {
  const map: Record<string, string> = {
    "Cote d'Ivoire": 'ci',
    Ethiopia: 'et',
    Canada: 'ca',
    Pakistan: 'pk',
    Uganda: 'ug',
    Nigeria: 'ng',
    Kenya: 'ke',
    Senegal: 'sn',
    'South Africa': 'za',
    India: 'in',
    Bangladesh: 'bd',
    Brazil: 'br',
    France: 'fr',
    UK: 'gb',
    USA: 'us',
    Denmark: 'dk',
    Thailand: 'th',
    Switzerland: 'ch',
    Netherlands: 'nl',
  };

  return map[country] ?? null;
}

export function skillClass(index: number) {
  const classes = [
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-cyan-50 text-cyan-700 border-cyan-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
  ];
  return classes[index % classes.length];
}

export function languageClass(index: number) {
  const classes = [
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-rose-50 text-rose-700 border-rose-100',
    'bg-amber-50 text-amber-700 border-amber-100',
  ];
  return classes[index % classes.length];
}

export const SORT_OPTIONS = ['A-Z', 'Z-A'] as const;
export type SortOrder = typeof SORT_OPTIONS[number];

export function sortExperts<T extends { name: string }>(experts: T[], order: SortOrder): T[] {
  return [...experts].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return order === 'A-Z' ? cmp : -cmp;
  });
}
