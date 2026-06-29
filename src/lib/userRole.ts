export type UserRole = 'manager' | 'normal_user' | 'expert';

export function isManagerLike(role: string | null): role is 'manager' | 'normal_user' {
  return role === 'manager' || role === 'normal_user';
}

export function isExpertRole(role: string | null): role is 'expert' {
  return role === 'expert';
}

export function getRoleLabel(role: string | null): string {
  if (role === 'manager') return 'Primary Digital Advisor';
  if (role === 'normal_user') return 'Normal User';
  if (role === 'expert') return 'Tech Expert';
  return '';
}

export function getRoleDotClass(role: string | null): string {
  if (role === 'manager') return 'bg-amber-300';
  if (role === 'normal_user') return 'bg-sky-300';
  if (role === 'expert') return 'bg-emerald-300';
  return 'bg-white';
}

export function getNextRole(role: string | null): UserRole {
  if (role === 'expert') return 'manager';
  if (role === 'manager') return 'normal_user';
  return 'expert';
}

export function getRoleHomePath(role: string | null): string {
  if (role === 'expert') return '/roster/expert-dashboard';
  return '/roster/planning';
}
