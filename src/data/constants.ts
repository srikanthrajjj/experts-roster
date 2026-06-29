export const SUGGESTED_SEARCHES = [
  'ServiceNow Architect',
  'Salesforce Consultant',
  'Cloud Engineer',
  'AI Specialist',
  'Security Expert',
];

export const AVAILABILITY_STATUSES = ['All', 'Available', 'Partially Allocated', 'Fully Booked', 'On Leave'];

export const ALLOCATION_RANGES = ['All', '0-25%', '26-50%', '51-75%', '76-100%'];

export const FUNCTIONAL_AREAS = [
  'All',
  'Enterprise Architecture',
  'Cloud Infrastructure',
  'Application Development',
  'Data & Analytics',
  'Cybersecurity',
  'IT Service Management',
  'Digital Transformation',
  'AI & Automation',
];

export const BUSINESS_UNITS = [
  'All',
  'ICTD',
  'Programme Division',
  'Operations',
  'Supply Division',
  'Private Fundraising',
  'Regional Office',
];

export const REGIONS = [
  'All',
  'East & Southern Africa',
  'South Asia',
  'East Asia & Pacific',
  'West & Central Africa',
  'Middle East & North Africa',
  'Latin America & Caribbean',
  'Headquarters',
];

export const TIMEZONES = ['All', 'UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+5', 'UTC+8', 'UTC-5', 'UTC-8'];

export const CONTRACT_TYPES = ['All', 'Staff', 'Consultant', 'Individual Contractor', 'Partner Secondment'];

export const EXPERIENCE_LEVELS = ['All', 'Junior (0-3 yrs)', 'Mid (4-7 yrs)', 'Senior (8-12 yrs)', 'Principal (13+ yrs)'];

export const CERTIFICATION_LEVELS = ['All', 'Foundation', 'Associate', 'Professional', 'Expert/Master'];

export const LANGUAGES = ['All', 'English', 'French', 'Spanish', 'Arabic', 'Portuguese', 'German'];

export const STATUS_COLORS = {
  available: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  partially_allocated: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', bar: 'bg-amber-500' },
  fully_booked: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', bar: 'bg-sky-500' },
  on_leave: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', bar: 'bg-violet-500' },
} as const;

export const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  partially_allocated: 'Partially available',
  fully_booked: 'Fully booked',
  on_leave: 'On leave',
};

export type QuickLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** Quick links for country offices seeking TeamOne support */
export const QUICK_LINKS_CO: QuickLink[] = [
  { label: 'New to TeamOne? → Frequently Asked Questions', href: '#faq-heading' },
  { label: 'TeamOne support process', href: 'https://www.unicef.org/digital-impact/teamone', external: true },
  { label: 'TeamOne support scope', href: 'https://www.unicef.org/digital-impact/teamone', external: true },
  { label: 'Submit a request now', href: '/roster/planning' },
];

/** Quick links for Digital Advisors */
export const QUICK_LINKS_ADVISORS: QuickLink[] = [
  { label: 'Catch up on TeamOne Events', href: 'https://www.unicef.org/digital-impact/teamone', external: true },
  { label: 'Just became a Digital Advisor? → Explore your role', href: '/roster/expert-dashboard' },
  { label: 'Advising on a specific topic? → Focus Areas', href: 'https://www.unicef.org/digital-impact/teamone', external: true },
  { label: 'Looking to contribute? → Service Gateway Training', href: 'https://www.unicef.org/digital-impact/teamone', external: true },
];
