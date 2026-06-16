import type { DashboardView } from '../types/expert';

export const VALID_ROSTER_VIEWS: DashboardView[] = ['list', 'gantt', 'calendar', 'capacity'];
export const DEFAULT_ROSTER_VIEW: DashboardView = 'gantt';

export function parseRosterView(param: string | null): DashboardView | null {
  if (param && VALID_ROSTER_VIEWS.includes(param as DashboardView)) {
    return param as DashboardView;
  }
  return null;
}

export function rosterPlanningPath(view: DashboardView, extraParams?: Record<string, string>): string {
  const params = new URLSearchParams({ view });
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  return `/roster/planning?${params.toString()}`;
}
