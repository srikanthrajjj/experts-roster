export type AvailabilityStatus = 'available' | 'partially_allocated' | 'fully_booked' | 'on_leave';

export type AllocationBlockType = 'available' | 'partial' | 'project' | 'leave' | 'unavailable';

export type AllocationBlock = {
  weekStart: string;
  type: AllocationBlockType;
  label: string;
  percentage: number;
  projectName?: string;
  hasConflict?: boolean;
};

export type UpcomingCommitment = {
  date: string;
  label: string;
  type: 'project' | 'leave' | 'available';
  allocation?: number;
};

export type ExpertiseLevel = { skill: string; level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner' };

export type PastMission = {
  title: string;
  organization: string;
  role: string;
  rating: number;
  technologies?: string[];
  impact?: string;
  completedDate?: string;
};

export type ITExpert = {
  id: string;
  initials: string;
  name: string;
  title: string;
  role: string;
  location: string;
  country: string;
  timezone: string;
  team: string;
  bio: string;
  skills: string[];
  technologyStack: string[];
  functionalArea: string;
  businessUnit: string;
  contractType: string;
  experienceLevel: string;
  certificationLevel: string;
  languages: string[];
  regions: string[];
  emergencyExperience: boolean;
  previousUnicef: boolean;
  verified: boolean;
  trustRating: number;
  reviewsCount: number;
  yearsExperience: number;
  availability: string;
  availabilityStatus: AvailabilityStatus;
  allocationPercent: number;
  nextAvailableDate: string;
  activeProjectsCount: number;
  dailyFee: string;
  summary: string;
  expertiseLevels: ExpertiseLevel[];
  pastMissions: PastMission[];
  certifications: (string | { name: string; attachmentName?: string })[];
  contact: { email: string; phone: string };
  assignmentDetails: {
    feeRange: string;
    previousAssignments: number;
    homeBase: string;
    duration: string;
  };
  specialCapabilities: string[];
  references: { name: string; title: string; email: string }[];
  allocations: AllocationBlock[];
  upcomingCommitments: UpcomingCommitment[];
  utilizationPercent: number;
  benchAvailable: boolean;
  skillsLastUpdated?: string;
  dailyAllocations?: Record<string, {
    type: AllocationBlockType;
    percentage: number;
    label: string;
    projectName?: string;
  }>;
};

export type FilterState = {
  search: string;
  availabilityStatus: string;
  allocationRange: string;
  skillGroups: string[];
  functionalArea: string;
  businessUnit: string;
  region: string;
  timezone: string;
  contractType: string;
  experienceLevel: string;
  certificationLevel: string;
  language: string;
};

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  availabilityStatus: 'All',
  allocationRange: 'All',
  skillGroups: [],
  functionalArea: 'All',
  businessUnit: 'All',
  region: 'All',
  timezone: 'All',
  contractType: 'All',
  experienceLevel: 'All',
  certificationLevel: 'All',
  language: 'All',
};

export type DashboardView = 'list' | 'gantt' | 'calendar' | 'capacity';
