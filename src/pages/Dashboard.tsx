import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Globe,
  Grid3X3,
  Languages,
  List,
  ListFilter,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { MOCK_EXPERTS, Expert } from '../data/experts';
import { cn } from '../lib/utils';
import UnicefLogo from '../components/roster/UnicefLogo';

const PRACTICE_AREAS = [
  'All',
  'Early Childhood Development',
  'WASH',
  'Health',
  'Education',
  'Humanitarian Action',
  'Programme Design',
  'Policy Reform',
  'Child Protection',
  'Social & Behaviour Change',
  'Financing for Scale',
  'Digital Infrastructure',
];

const PROGRAMME_OFFERS = [
  'All',
  'Humanitarian Action',
  'WASH Specialised',
  'Programme Design',
  'Financing for SC',
  'Policy Reform',
  'Child Protection',
  'Programme Scaling',
];

const REGIONS = [
  'All',
  'East & Southern Africa',
  'South Asia',
  'East Asia & Pacific',
  'West & Central Africa',
];

const LANGUAGES = [
  'All',
  'English',
  'French',
  'Spanish',
  'Arabic',
  'German',
  'Swahili',
  'Bemba',
  'Hausa',
  'Sinhala',
];

const COUNTRIES = [
  'All',
  "Cote d'Ivoire",
  'Ethiopia',
  'Canada',
  'Pakistan',
  'Uganda',
  'Nigeria',
  'Kenya',
  'Senegal',
  'South Africa',
  'India',
  'Bangladesh',
  'Brazil',
  'France',
  'UK',
];

const DAILY_FEES = ['All', '$300-400', '$401-500', '$500-600', '$601-700', '$701-800', '$800+'];
const YEARS_EXPERIENCE = ['All', '0-5 years', '6-10 years', '11-15 years', '16-20 years', '21+ years'];
const SORT_OPTIONS = ['A-Z', 'Z-A', 'Most experience'];
const PAGE_SIZE = 9;

const avatarPalette = [
  'bg-sky-100 text-sky-700 ring-sky-200',
  'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'bg-amber-100 text-amber-800 ring-amber-200',
  'bg-violet-100 text-violet-700 ring-violet-200',
  'bg-rose-100 text-rose-700 ring-rose-200',
  'bg-cyan-100 text-cyan-700 ring-cyan-200',
];

function countryFlagCode(country: string) {
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
  };

  return map[country] ?? null;
}

function availabilityClass(value: string) {
  if (value === 'Immediate') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value === '1-3 months') return 'bg-sky-50 text-sky-700 border-sky-200';
  if (value === '3-6 months') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function languageClass(index: number) {
  const classes = [
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-rose-50 text-rose-700 border-rose-100',
    'bg-amber-50 text-amber-700 border-amber-100',
  ];
  return classes[index % classes.length];
}

function skillClass(index: number) {
  const classes = [
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-cyan-50 text-cyan-700 border-cyan-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
  ];
  return classes[index % classes.length];
}

function Avatar({ expert, size = 'md' }: { expert: Expert; size?: 'sm' | 'md' | 'lg' }) {
  const palette = avatarPalette[Number(expert.id) % avatarPalette.length];
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';

  return (
    <div className={cn('shrink-0 rounded-full ring-1 flex items-center justify-center font-bold', palette, sizeClass)}>
      {expert.initials}
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  key?: React.Key;
}) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-md border px-2 text-xs font-semibold', className)}>
      {children}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-[#172554]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

function FilterToggleGroup({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-[#172554]">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={cn(
              'h-9 rounded-md border px-3 text-xs font-bold transition',
              selected.includes(value)
                ? 'border-[#0072CE] bg-[#0072CE] text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-[#0072CE]/50 hover:text-[#0055A6]',
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  onClear,
  clearDisabled = false,
  isOpen,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClear?: () => void;
  clearDisabled?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#172554]">
        <Icon className="h-4 w-4 text-[#0072CE]" />
        {title}
      </div>
      <div className="flex items-center gap-2">
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={clearDisabled}
            className="rounded-md px-2 py-1 text-[11px] font-black uppercase text-[#0072CE] transition hover:bg-sky-50 disabled:pointer-events-none disabled:text-slate-300"
          >
            Clear
          </button>
        )}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            title={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#0072CE]"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-0' : '-rotate-90')} />
          </button>
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  detail: string;
  color: 'blue' | 'teal' | 'navy' | 'violet';
}) {
  const colorClass = {
    blue: 'bg-sky-50 text-[#0072CE]',
    teal: 'bg-teal-50 text-teal-700',
    navy: 'bg-blue-50 text-[#004C97]',
    violet: 'bg-violet-50 text-violet-700',
  }[color];

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/80 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,114,206,0.14)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0072CE] via-teal-400 to-[#1F7A8C]" />
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase text-[#172554]">{label}</div>
          <div className="mt-0.5 text-xl font-black text-[#0072CE]">{value}</div>
          <div className="mt-1 text-xs font-medium text-slate-500">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function ViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
}) {
  return (
    <div className="flex h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        title="Table view"
        onClick={() => setViewMode('table')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition',
          viewMode === 'table' ? 'bg-[#0072CE] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Grid view"
        onClick={() => setViewMode('grid')}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md transition',
          viewMode === 'grid' ? 'bg-[#0072CE] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterStudioTab({
  icon: Icon,
  title,
  count,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-between gap-2 rounded-lg border px-3 text-left transition',
        active
          ? 'border-[#0072CE] bg-[#0072CE] text-white shadow-sm'
          : 'border-slate-200 bg-white/80 text-[#0F1B3D] hover:border-[#0072CE]/35 hover:bg-white hover:shadow-sm',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition',
            active ? 'bg-white/20 text-white' : 'bg-sky-50 text-[#0072CE]',
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-xs font-bold">{title}</span>
      </span>
      <span
        className={cn(
          'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-black',
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function Dashboard() {
  const [dashboardVersion, setDashboardVersion] = useState<'v1' | 'v2'>('v1');
  const [v2ActivePanel, setV2ActivePanel] = useState<'basic' | 'experience' | 'languages' | 'working'>('basic');
  const [quickKeyword, setQuickKeyword] = useState('');
  const [globalPracticeArea, setGlobalPracticeArea] = useState('All');
  const [programmeOffer, setProgrammeOffer] = useState('All');
  const [country, setCountry] = useState('All');
  const [regionalExperience, setRegionalExperience] = useState('All');
  const [unLanguages, setUnLanguages] = useState('All');
  const [allLanguages, setAllLanguages] = useState('All');
  const [emergencyExperience, setEmergencyExperience] = useState<string[]>([]);
  const [previousUnicef, setPreviousUnicef] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('All');
  const [dailyFee, setDailyFee] = useState('All');
  const [workModality, setWorkModality] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [emailModalData, setEmailModalData] = useState<Expert | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([]);
  const [showRosterDropdown, setShowRosterDropdown] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [openFilterGroups, setOpenFilterGroups] = useState({
    basic: true,
    experience: false,
    languages: false,
    working: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExperts = useMemo(() => {
    return MOCK_EXPERTS.filter((expert) => {
      const keyword = quickKeyword.trim().toLowerCase();
      if (
        keyword &&
        !expert.name.toLowerCase().includes(keyword) &&
        !expert.title.toLowerCase().includes(keyword) &&
        !expert.country.toLowerCase().includes(keyword) &&
        !expert.skills.join(' ').toLowerCase().includes(keyword)
      ) {
        return false;
      }

      if (globalPracticeArea !== 'All' && !expert.skills.includes(globalPracticeArea)) return false;
      if (programmeOffer !== 'All' && !expert.skills.includes(programmeOffer) && !expert.title.includes(programmeOffer)) return false;
      if (country !== 'All' && expert.country !== country) return false;
      if (regionalExperience !== 'All' && !expert.regions.includes(regionalExperience)) return false;
      if (unLanguages !== 'All' && !expert.languages.includes(unLanguages)) return false;
      if (allLanguages !== 'All' && !expert.languages.includes(allLanguages)) return false;
      if (dailyFee !== 'All' && expert.dailyFee !== dailyFee) return false;
      if (workModality !== 'All' && expert.assignmentDetails.duration !== workModality) return false;
      if (yearsExperience === '0-5 years' && expert.yearsExperience > 5) return false;
      if (yearsExperience === '6-10 years' && (expert.yearsExperience < 6 || expert.yearsExperience > 10)) return false;
      if (yearsExperience === '11-15 years' && (expert.yearsExperience < 11 || expert.yearsExperience > 15)) return false;
      if (yearsExperience === '16-20 years' && (expert.yearsExperience < 16 || expert.yearsExperience > 20)) return false;
      if (yearsExperience === '21+ years' && expert.yearsExperience < 21) return false;

      if (emergencyExperience.length > 0) {
        if (expert.emergencyExperience && !emergencyExperience.includes('Yes')) return false;
        if (!expert.emergencyExperience && !emergencyExperience.includes('No')) return false;
      }

      if (previousUnicef.length > 0) {
        if (expert.previousUnicef && !previousUnicef.includes('Yes')) return false;
        if (!expert.previousUnicef && !previousUnicef.includes('No')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'A-Z') return a.name.localeCompare(b.name);
      if (sortOrder === 'Z-A') return b.name.localeCompare(a.name);
      if (sortOrder === 'Most experience') return b.yearsExperience - a.yearsExperience;
      return 0;
    });
  }, [
    allLanguages,
    country,
    dailyFee,
    emergencyExperience,
    globalPracticeArea,
    previousUnicef,
    programmeOffer,
    quickKeyword,
    regionalExperience,
    sortOrder,
    unLanguages,
    workModality,
    yearsExperience,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredExperts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = filteredExperts.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, filteredExperts.length);
  const paginatedExperts = filteredExperts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const visibleExpertIds = paginatedExperts.map((expert) => expert.id);
  const selectedExperts = MOCK_EXPERTS.filter((expert) => selectedExpertIds.includes(expert.id));

  const activeFilterCount = [
    quickKeyword.trim(),
    globalPracticeArea !== 'All',
    programmeOffer !== 'All',
    country !== 'All',
    regionalExperience !== 'All',
    unLanguages !== 'All',
    allLanguages !== 'All',
    yearsExperience !== 'All',
    dailyFee !== 'All',
    workModality !== 'All',
    sortOrder !== 'A-Z',
    emergencyExperience.length > 0,
    previousUnicef.length > 0,
  ].filter(Boolean).length;

  const toggleListValue = (current: string[], value: string, setter: (value: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setQuickKeyword('');
    setGlobalPracticeArea('All');
    setProgrammeOffer('All');
    setCountry('All');
    setRegionalExperience('All');
    setUnLanguages('All');
    setAllLanguages('All');
    setEmergencyExperience([]);
    setPreviousUnicef([]);
    setYearsExperience('All');
    setDailyFee('All');
    setWorkModality('All');
    setSortOrder('A-Z');
    setCurrentPage(1);
  };

  const clearQuickSearch = () => {
    setQuickKeyword('');
    setCurrentPage(1);
  };

  const clearBasicFilters = () => {
    setGlobalPracticeArea('All');
    setProgrammeOffer('All');
    setCountry('All');
    setRegionalExperience('All');
    setCurrentPage(1);
  };

  const clearExperienceFilters = () => {
    setYearsExperience('All');
    setEmergencyExperience([]);
    setPreviousUnicef([]);
    setCurrentPage(1);
  };

  const clearLanguageFilters = () => {
    setUnLanguages('All');
    setAllLanguages('All');
    setCurrentPage(1);
  };

  const clearWorkingFilters = () => {
    setDailyFee('All');
    setWorkModality('All');
    setSortOrder('A-Z');
    setCurrentPage(1);
  };

  const toggleFilterGroup = (group: keyof typeof openFilterGroups) => {
    setOpenFilterGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  };

  const basicFiltersActive = globalPracticeArea !== 'All' || programmeOffer !== 'All' || country !== 'All' || regionalExperience !== 'All';
  const experienceFiltersActive = yearsExperience !== 'All' || emergencyExperience.length > 0 || previousUnicef.length > 0;
  const languageFiltersActive = unLanguages !== 'All' || allLanguages !== 'All';
  const workingFiltersActive = dailyFee !== 'All' || workModality !== 'All' || sortOrder !== 'A-Z';
  const basicFilterCount = [globalPracticeArea !== 'All', programmeOffer !== 'All', country !== 'All', regionalExperience !== 'All'].filter(Boolean).length;
  const experienceFilterCount = [yearsExperience !== 'All', emergencyExperience.length > 0, previousUnicef.length > 0].filter(Boolean).length;
  const languageFilterCount = [unLanguages !== 'All', allLanguages !== 'All'].filter(Boolean).length;
  const workingFilterCount = [dailyFee !== 'All', workModality !== 'All', sortOrder !== 'A-Z'].filter(Boolean).length;

  const activeFilterChips: { key: string; label: string; value: string; onClear: () => void }[] = [];
  const addFilterChip = (key: string, label: string, value: string, onClear: () => void) => {
    activeFilterChips.push({ key, label, value, onClear });
  };

  if (quickKeyword.trim()) addFilterChip('keyword', 'Search', quickKeyword.trim(), clearQuickSearch);
  if (globalPracticeArea !== 'All') addFilterChip('globalPracticeArea', 'Practice', globalPracticeArea, () => { setGlobalPracticeArea('All'); setCurrentPage(1); });
  if (programmeOffer !== 'All') addFilterChip('programmeOffer', 'Offer', programmeOffer, () => { setProgrammeOffer('All'); setCurrentPage(1); });
  if (country !== 'All') addFilterChip('country', 'Country', country, () => { setCountry('All'); setCurrentPage(1); });
  if (regionalExperience !== 'All') addFilterChip('regionalExperience', 'Region', regionalExperience, () => { setRegionalExperience('All'); setCurrentPage(1); });
  if (yearsExperience !== 'All') addFilterChip('yearsExperience', 'Years', yearsExperience, () => { setYearsExperience('All'); setCurrentPage(1); });
  emergencyExperience.forEach((value) => addFilterChip(`emergencyExperience-${value}`, 'Emergency', value, () => {
    setEmergencyExperience((current) => current.filter((item) => item !== value));
    setCurrentPage(1);
  }));
  previousUnicef.forEach((value) => addFilterChip(`previousUnicef-${value}`, 'UNICEF', value, () => {
    setPreviousUnicef((current) => current.filter((item) => item !== value));
    setCurrentPage(1);
  }));
  if (unLanguages !== 'All') addFilterChip('unLanguages', 'UN language', unLanguages, () => { setUnLanguages('All'); setCurrentPage(1); });
  if (allLanguages !== 'All') addFilterChip('allLanguages', 'Language', allLanguages, () => { setAllLanguages('All'); setCurrentPage(1); });
  if (dailyFee !== 'All') addFilterChip('dailyFee', 'Fee', dailyFee, () => { setDailyFee('All'); setCurrentPage(1); });
  if (workModality !== 'All') addFilterChip('workModality', 'Modality', workModality, () => { setWorkModality('All'); setCurrentPage(1); });
  if (sortOrder !== 'A-Z') addFilterChip('sortOrder', 'Sort', sortOrder, () => setSortOrder('A-Z'));

  const toggleExpertSelection = (id: string, event: React.MouseEvent | React.ChangeEvent) => {
    event.stopPropagation();
    setSelectedExpertIds((prev) => (prev.includes(id) ? prev.filter((expertId) => expertId !== id) : [...prev, id]));
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedExpertIds((prev) => Array.from(new Set([...prev, ...visibleExpertIds])));
    } else {
      setSelectedExpertIds((prev) => prev.filter((id) => !visibleExpertIds.includes(id)));
    }
  };

  const handleSendEmailInit = (expert: Expert, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEmailModalData(expert);
    setEmailSubject('Invitation to discuss a potential assignment');
    setEmailBody(`Dear ${expert.name},\n\nWe are reaching out to discuss a potential assignment aligned with your ${expert.skills[0]} experience.\n\nBest regards,\nUNICEF Experts Roster Team`);
  };

  const handleSendMultiEmailInit = () => {
    setEmailModalData({
      id: 'multi',
      initials: 'MX',
      name: `${selectedExpertIds.length} selected experts`,
      title: 'Selected roster group',
      location: '',
      country: '',
      skills: [],
      languages: [],
      regions: [],
      emergencyExperience: false,
      previousUnicef: false,
      verified: true,
      trustRating: 0,
      reviewsCount: 0,
      yearsExperience: 0,
      availability: '',
      dailyFee: '',
      summary: '',
      expertiseLevels: [],
      pastMissions: [],
      certifications: [],
      contact: { email: 'selected.experts@unicef.org', phone: '' },
      assignmentDetails: { feeRange: '', previousAssignments: 0, homeBase: '', duration: '' },
      specialCapabilities: [],
      references: [],
    });
    setEmailSubject('Invitation to discuss a potential assignment');
    setEmailBody('Dear Experts,\n\nWe are reaching out to discuss a potential assignment aligned with your roster experience.\n\nBest regards,\nUNICEF Experts Roster Team');
  };

  const handleSendEmailConfirm = () => {
    if (!emailModalData) return;
    setToastMessage(`Email prepared for ${emailModalData.name}`);
    setEmailModalData(null);
    setSelectedExpertIds([]);
    window.setTimeout(() => setToastMessage(null), 3200);
  };

  const renderBasicFiltersCard = (className?: string) => (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <SectionHeader
        icon={BadgeCheck}
        title="Basic Filters"
        onClear={clearBasicFilters}
        clearDisabled={!basicFiltersActive}
        isOpen={openFilterGroups.basic}
        onToggle={() => toggleFilterGroup('basic')}
      />
      {openFilterGroups.basic && (
        <div className="mt-3 space-y-3">
          <FilterSelect label="Global Practice Area" value={globalPracticeArea} options={PRACTICE_AREAS} onChange={(value) => { setGlobalPracticeArea(value); setCurrentPage(1); }} />
          <FilterSelect label="Programme Offer" value={programmeOffer} options={PROGRAMME_OFFERS} onChange={(value) => { setProgrammeOffer(value); setCurrentPage(1); }} />
          <FilterSelect label="Country" value={country} options={COUNTRIES} onChange={(value) => { setCountry(value); setCurrentPage(1); }} />
          <FilterSelect label="Regional Experience" value={regionalExperience} options={REGIONS} onChange={(value) => { setRegionalExperience(value); setCurrentPage(1); }} />
        </div>
      )}
    </div>
  );

  const renderExperienceFiltersCard = (className?: string) => (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <SectionHeader
        icon={Award}
        title="Experience"
        onClear={clearExperienceFilters}
        clearDisabled={!experienceFiltersActive}
        isOpen={openFilterGroups.experience}
        onToggle={() => toggleFilterGroup('experience')}
      />
      {openFilterGroups.experience && (
        <div className="mt-3 space-y-3">
          <FilterSelect label="Years of Experience" value={yearsExperience} options={YEARS_EXPERIENCE} onChange={(value) => { setYearsExperience(value); setCurrentPage(1); }} />
          <FilterToggleGroup label="Emergency Experience" values={['Yes', 'No']} selected={emergencyExperience} onToggle={(value) => toggleListValue(emergencyExperience, value, setEmergencyExperience)} />
          <FilterToggleGroup label="Previous UNICEF" values={['Yes', 'No']} selected={previousUnicef} onToggle={(value) => toggleListValue(previousUnicef, value, setPreviousUnicef)} />
        </div>
      )}
    </div>
  );

  const renderLanguageFiltersCard = (className?: string) => (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <SectionHeader
        icon={Languages}
        title="Languages"
        onClear={clearLanguageFilters}
        clearDisabled={!languageFiltersActive}
        isOpen={openFilterGroups.languages}
        onToggle={() => toggleFilterGroup('languages')}
      />
      {openFilterGroups.languages && (
        <div className="mt-3 space-y-3">
          <FilterSelect label="UN Languages" value={unLanguages} options={LANGUAGES} onChange={(value) => { setUnLanguages(value); setCurrentPage(1); }} />
          <FilterSelect label="All Languages" value={allLanguages} options={LANGUAGES} onChange={(value) => { setAllLanguages(value); setCurrentPage(1); }} />
        </div>
      )}
    </div>
  );

  const renderWorkingFiltersCard = (className?: string) => (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <SectionHeader
        icon={Briefcase}
        title="Working Arrangements"
        onClear={clearWorkingFilters}
        clearDisabled={!workingFiltersActive}
        isOpen={openFilterGroups.working}
        onToggle={() => toggleFilterGroup('working')}
      />
      {openFilterGroups.working && (
        <div className="mt-3 space-y-3">
          <FilterSelect label="Daily Fee" value={dailyFee} options={DAILY_FEES} onChange={(value) => { setDailyFee(value); setCurrentPage(1); }} />
          <FilterSelect label="Work Modality" value={workModality} options={['All', 'Flexible', 'Short-term', 'Emergency Deployments', 'Long-term only']} onChange={(value) => { setWorkModality(value); setCurrentPage(1); }} />
          <FilterSelect label="Sort" value={sortOrder} options={SORT_OPTIONS} onChange={setSortOrder} />
        </div>
      )}
    </div>
  );

  const v2PanelMeta = {
    basic: {
      title: 'Roster Basics',
      description: 'Practice, offer, geography, and regional scope.',
      icon: BadgeCheck,
      count: basicFilterCount,
      onClear: clearBasicFilters,
      clearDisabled: !basicFiltersActive,
    },
    experience: {
      title: 'Experience Signals',
      description: 'Years, emergency readiness, and UNICEF track record.',
      icon: Award,
      count: experienceFilterCount,
      onClear: clearExperienceFilters,
      clearDisabled: !experienceFiltersActive,
    },
    languages: {
      title: 'Languages',
      description: 'UN languages and broader communication coverage.',
      icon: Languages,
      count: languageFilterCount,
      onClear: clearLanguageFilters,
      clearDisabled: !languageFiltersActive,
    },
    working: {
      title: 'Working Terms',
      description: 'Fee bands, modality, and roster sorting.',
      icon: Briefcase,
      count: workingFilterCount,
      onClear: clearWorkingFilters,
      clearDisabled: !workingFiltersActive,
    },
  } as const;

  const activeV2PanelMeta = v2PanelMeta[v2ActivePanel];
  const ActiveV2PanelIcon = activeV2PanelMeta.icon;

  return (
    <div className="min-h-screen overflow-hidden bg-[#EEF5FC] text-slate-800">
      <header className="relative z-30 h-[66px] bg-[#0091F9] text-white shadow-[0_14px_30px_rgba(0,145,249,0.18)]">
        <div className="flex h-full items-center justify-between gap-5 px-5 xl:px-8">
          <div className="flex h-full min-w-0 items-center gap-7">
            <Link to="/" className="flex shrink-0 items-center rounded-md outline-none transition hover:opacity-90 focus:ring-2 focus:ring-white/60">
              <UnicefLogo className="h-10" />
            </Link>

            <nav className="hidden h-full items-center gap-3 text-sm font-bold lg:flex">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRosterDropdown((value) => !value)}
                  className="flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[#0091F9] shadow-sm transition hover:bg-sky-50"
                >
                  Experts Roster
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showRosterDropdown && (
                  <div className="absolute left-0 top-12 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 text-slate-800 shadow-xl">
                    <Link to="/roster" onClick={() => setShowRosterDropdown(false)} className="block px-4 py-2 text-sm font-bold hover:bg-sky-50 hover:text-[#0072CE]">
                      Find Expert Roster
                    </Link>
                    <Link to="/roster/add" onClick={() => setShowRosterDropdown(false)} className="block px-4 py-2 text-sm font-bold hover:bg-sky-50 hover:text-[#0072CE]">
                      Add Expert Roster
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
            <div className="relative hidden w-full max-w-[440px] md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/75" />
              <input
                type="text"
                placeholder="Search portal..."
                className="h-11 w-full rounded-full border border-white/15 bg-white/15 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/75 focus:border-white/40 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400"
              />
            </div>
            <div className="flex h-11 items-center gap-1 rounded-full border border-white/25 bg-white/10 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setDashboardVersion('v1')}
                className={cn(
                  'min-w-[48px] rounded-full px-3 py-1.5 text-xs font-black uppercase transition',
                  dashboardVersion === 'v1' ? 'bg-white text-[#0091F9]' : 'text-white/85 hover:bg-white/10 hover:text-white',
                )}
              >
                v1
              </button>
              <button
                type="button"
                onClick={() => setDashboardVersion('v2')}
                className={cn(
                  'min-w-[48px] rounded-full px-3 py-1.5 text-xs font-black uppercase transition',
                  dashboardVersion === 'v2' ? 'bg-white text-[#0091F9]' : 'text-white/85 hover:bg-white/10 hover:text-white',
                )}
              >
                v2
              </button>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-black shadow-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-66px)] min-h-0">
        {dashboardVersion === 'v1' && (
        <aside
          className={cn(
            'hidden shrink-0 border-r border-slate-200 bg-white/95 shadow-[10px_0_35px_rgba(15,23,42,0.06)] xl:flex xl:flex-col',
            filtersCollapsed ? 'w-[76px]' : 'w-[304px]',
          )}
        >
          {filtersCollapsed ? (
            <>
              <div className="flex justify-center border-b border-slate-100 px-3 py-3">
                <button
                  type="button"
                  title="Expand filters"
                  onClick={() => setFiltersCollapsed(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0072CE]/40 hover:text-[#0072CE]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col items-center gap-4 px-4 py-5">
                <Filter className="h-5 w-5 text-[#0072CE]" />
                <div className="rounded-full bg-[#0072CE] px-2.5 py-1 text-xs font-black text-white">{activeFilterCount}</div>
              </div>
            </>
          ) : (
            <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black text-[#0F1B3D]">Add filters</h2>
                  </div>
                  <button
                    type="button"
                    title="Collapse filters"
                    onClick={() => setFiltersCollapsed(true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0072CE]/40 hover:text-[#0072CE]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {renderBasicFiltersCard()}
                {renderExperienceFiltersCard()}
                {renderLanguageFiltersCard()}
                {renderWorkingFiltersCard()}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-[#0072CE] shadow-sm transition hover:border-[#0072CE]/40 hover:bg-sky-50"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </aside>
        )}

        <main className="min-w-0 flex-1 overflow-hidden">
          <section className="flex h-full min-h-0 flex-col px-3 py-4 lg:px-4 xl:px-5">
            {dashboardVersion === 'v1' && (
              <div className="shrink-0 mb-4 flex items-center justify-between">
                <h1 className="text-3xl font-black text-[#0F1B3D] md:text-4xl">Find the right expert. Drive impact.</h1>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <Users className="h-4 w-4 text-[#0072CE]" />
                    <div>
                      <div className="text-xs font-bold text-slate-500">Total Experts</div>
                      <div className="text-2xl font-black text-[#0072CE]">714</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-500">In Scope</div>
                      <div className="text-2xl font-black text-teal-600">{filteredExperts.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {dashboardVersion === 'v2' && (
              <div className="mt-1 shrink-0 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded border border-slate-200 bg-white p-1.5 shadow-sm">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <BadgeCheck className="h-3 w-3" />
                      </div>
                      <h3 className="text-[12px] font-black text-[#0F1B3D]">BASICS</h3>
                      <button
                        type="button"
                        onClick={clearBasicFilters}
                        disabled={!basicFiltersActive}
                        className="ml-auto text-[9px] font-black uppercase text-[#0072CE] hover:bg-sky-50 px-0.5 py-0 rounded disabled:text-slate-300 disabled:pointer-events-none"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      <div className="grid grid-cols-2 gap-1">
                        <FilterSelect label="Practice" value={globalPracticeArea} options={PRACTICE_AREAS} onChange={(value) => { setGlobalPracticeArea(value); setCurrentPage(1); }} />
                        <FilterSelect label="Offer" value={programmeOffer} options={PROGRAMME_OFFERS} onChange={(value) => { setProgrammeOffer(value); setCurrentPage(1); }} />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <FilterSelect label="Country" value={country} options={COUNTRIES} onChange={(value) => { setCountry(value); setCurrentPage(1); }} />
                        <FilterSelect label="Region" value={regionalExperience} options={REGIONS} onChange={(value) => { setRegionalExperience(value); setCurrentPage(1); }} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-white p-1.5 shadow-sm">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Award className="h-3 w-3" />
                      </div>
                      <h3 className="text-[12px] font-black text-[#0F1B3D]">EXPERIENCE</h3>
                      <button
                        type="button"
                        onClick={clearExperienceFilters}
                        disabled={!experienceFiltersActive}
                        className="ml-auto text-[9px] font-black uppercase text-[#0072CE] hover:bg-sky-50 px-0.5 py-0 rounded disabled:text-slate-300 disabled:pointer-events-none"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      <FilterSelect label="Years" value={yearsExperience} options={YEARS_EXPERIENCE} onChange={(value) => { setYearsExperience(value); setCurrentPage(1); }} />
                      <div className="grid grid-cols-2 gap-1">
                        <FilterToggleGroup label="Emergency" values={['Yes', 'No']} selected={emergencyExperience} onToggle={(value) => toggleListValue(emergencyExperience, value, setEmergencyExperience)} />
                        <FilterToggleGroup label="UNICEF" values={['Yes', 'No']} selected={previousUnicef} onToggle={(value) => toggleListValue(previousUnicef, value, setPreviousUnicef)} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-white p-1.5 shadow-sm">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <Languages className="h-3 w-3" />
                      </div>
                      <h3 className="text-[12px] font-black text-[#0F1B3D]">LANGUAGES</h3>
                      <button
                        type="button"
                        onClick={clearLanguageFilters}
                        disabled={!languageFiltersActive}
                        className="ml-auto text-[9px] font-black uppercase text-[#0072CE] hover:bg-sky-50 px-0.5 py-0 rounded disabled:text-slate-300 disabled:pointer-events-none"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-3">
                      <FilterSelect label="UN" value={unLanguages} options={LANGUAGES} onChange={(value) => { setUnLanguages(value); setCurrentPage(1); }} />
                      <FilterSelect label="All" value={allLanguages} options={LANGUAGES} onChange={(value) => { setAllLanguages(value); setCurrentPage(1); }} />
                    </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-white p-1.5 shadow-sm">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Briefcase className="h-3 w-3" />
                      </div>
                      <h3 className="text-[12px] font-black text-[#0F1B3D]">WORKING</h3>
                      <button
                        type="button"
                        onClick={clearWorkingFilters}
                        disabled={!workingFiltersActive}
                        className="ml-auto text-[9px] font-black uppercase text-[#0072CE] hover:bg-sky-50 px-0.5 py-0 rounded disabled:text-slate-300 disabled:pointer-events-none"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-3">
                      <FilterSelect label="Fee" value={dailyFee} options={DAILY_FEES} onChange={(value) => { setDailyFee(value); setCurrentPage(1); }} />
                      <FilterSelect label="Modality" value={workModality} options={['All', 'Flexible', 'Short-term', 'Emergency Deployments', 'Long-term only']} onChange={(value) => { setWorkModality(value); setCurrentPage(1); }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)]">
                  <div className="rounded border border-slate-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 shadow-sm min-h-[140px]">
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200 text-sky-700 shadow-sm">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Total experts
                      </div>
                      <div className="text-4xl font-black text-[#0072CE] leading-none">
                        714
                      </div>
                    </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 shadow-sm min-h-[140px]">
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-200 text-teal-700 shadow-sm">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        In scope
                      </div>
                      <div className="text-4xl font-black text-teal-700 leading-none">
                        {filteredExperts.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFilterChips.length > 0 && (
              <div className="mt-4 shrink-0 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <span className="mr-1 inline-flex h-8 items-center gap-2 rounded-lg bg-sky-50 px-3 text-xs font-black uppercase text-[#0055A6]">
                  <ListFilter className="h-4 w-4" />
                  Selected filters
                </span>
                {activeFilterChips.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={filter.onClear}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#0072CE]/20 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#0072CE]/50 hover:text-[#0055A6]"
                    title={`Clear ${filter.label}`}
                  >
                    <span className="text-[#0072CE]">{filter.label}:</span>
                    <span>{filter.value}</span>
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex h-8 items-center rounded-lg px-3 text-xs font-black uppercase text-[#0072CE] transition hover:bg-sky-50"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.08)]">
              <div className="shrink-0 flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={quickKeyword}
                      onChange={(event) => {
                        setQuickKeyword(event.target.value);
                        setCurrentPage(1);
                      }}
                      type="text"
                      placeholder="Search roster..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[#0072CE] focus:bg-white focus:ring-2 focus:ring-[#0072CE]/15"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <ListFilter className="h-4 w-4 text-[#0072CE]" />
                    <span>{activeFilterCount} active filters</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
              {viewMode === 'table' ? (
                <div className="custom-scrollbar h-full overflow-x-auto overflow-y-hidden">
                  <div className="flex h-full min-w-[1220px] flex-col">
                    <div className="grid shrink-0 grid-cols-[48px_minmax(250px,1.35fr)_140px_minmax(220px,1fr)_180px_190px_160px_160px] items-center border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-[#172554] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          aria-label="Select visible experts"
                          checked={visibleExpertIds.length > 0 && visibleExpertIds.every((id) => selectedExpertIds.includes(id))}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-slate-300 accent-[#0072CE]"
                        />
                      </div>
                      <div>Expert</div>
                      <div>Country</div>
                      <div>Global Practice Area</div>
                      <div>Programme Offer</div>
                      <div>Languages</div>
                      <div>Regional Experience</div>
                      <div>Actions</div>
                    </div>

                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                    {paginatedExperts.map((expert) => (
                      <button
                        key={expert.id}
                        type="button"
                        onClick={() => setSelectedExpert(expert)}
                        className={cn(
                          'grid w-full grid-cols-[48px_minmax(250px,1.35fr)_140px_minmax(220px,1fr)_180px_190px_160px_160px] items-center border-t border-slate-100 px-4 py-3 text-left transition hover:bg-sky-50/70',
                          selectedExpertIds.includes(expert.id) && 'bg-sky-50/80',
                        )}
                      >
                        <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedExpertIds.includes(expert.id)}
                            onChange={(event) => toggleExpertSelection(expert.id, event)}
                            className="h-4 w-4 rounded border-slate-300 accent-[#0072CE]"
                          />
                        </div>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar expert={expert} />
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-sm font-black text-[#0F1B3D]">{expert.name}</span>
                              {expert.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#0072CE]" />}
                            </div>
                            <div className="mt-1 truncate text-xs font-semibold text-slate-500">{expert.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <span className="flex h-3.5 w-[18px] items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
                            {countryFlagCode(expert.country) ? (
                              <img
                                src={`https://flagcdn.com/w40/${countryFlagCode(expert.country)}.png`}
                                srcSet={`https://flagcdn.com/w80/${countryFlagCode(expert.country)}.png 2x`}
                                alt={`${expert.country} flag`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Globe className="h-3 w-3 text-slate-400" />
                            )}
                          </span>
                          <span className="truncate">{expert.country}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {expert.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={skill} className={skillClass(index)}>
                              {skill}
                            </Badge>
                          ))}
                          {expert.skills.length > 2 && <Badge className="border-slate-200 bg-white text-slate-600">+{expert.skills.length - 2}</Badge>}
                        </div>
                        <div className="truncate text-sm font-semibold text-slate-600">{expert.skills[0]}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {expert.languages.slice(0, 2).map((language, index) => (
                            <Badge key={language} className={languageClass(index)}>
                              {language}
                            </Badge>
                          ))}
                          {expert.languages.length > 2 && <Badge className="border-slate-200 bg-white text-slate-600">+{expert.languages.length - 2}</Badge>}
                        </div>
                        <div className="truncate">
                          <Badge className="border-slate-100 bg-slate-50 text-slate-600">{expert.regions[0]}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => handleSendEmailInit(expert, event)}
                            className="flex h-9 items-center gap-1.5 rounded-md bg-[#0072CE] px-3 text-xs font-black text-white shadow-sm transition hover:bg-[#0055A6]"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedExpert(expert);
                            }}
                            className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-[#0072CE]/30 hover:text-[#0072CE]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </div>
                      </button>
                    ))}
                    {filteredExperts.length === 0 && (
                      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-[#0072CE]">
                          <Search className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-black text-[#0F1B3D]">No experts found</h3>
                        <p className="mt-2 max-w-md text-sm font-medium text-slate-500">No roster profiles match the current filters.</p>
                        <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-black text-white hover:bg-[#0055A6]">
                          Reset search
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="custom-scrollbar h-full overflow-auto">
                <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
                  {paginatedExperts.map((expert) => (
                    <button
                      key={expert.id}
                      type="button"
                      onClick={() => setSelectedExpert(expert)}
                      className={cn(
                        'group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0072CE]/30 hover:shadow-[0_18px_45px_rgba(0,114,206,0.12)]',
                        selectedExpertIds.includes(expert.id) && 'border-[#0072CE] ring-2 ring-[#0072CE]/15',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar expert={expert} size="lg" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="truncate text-base font-black text-[#0F1B3D]">{expert.name}</h3>
                              {expert.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#0072CE]" />}
                            </div>
                            <p className="mt-1 truncate text-sm font-semibold text-slate-500">{expert.title}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedExpertIds.includes(expert.id)}
                          onChange={(event) => toggleExpertSelection(expert.id, event)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-300 accent-[#0072CE]"
                        />
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="text-xs font-bold text-slate-500">Years</div>
                          <div className="mt-1 text-sm font-black text-[#0F1B3D]">{expert.yearsExperience}</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="text-xs font-bold text-slate-500">Fee</div>
                          <div className="mt-1 text-sm font-black text-[#0F1B3D]">{expert.dailyFee}</div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {expert.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={skill} className={skillClass(index)}>
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <MapPin className="h-4 w-4 text-[#0072CE]" />
                          {expert.country}
                        </div>
                        <Badge className={availabilityClass(expert.availability)}>{expert.availability}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredExperts.length === 0 && (
                  <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-[#0072CE]">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-[#0F1B3D]">No experts found</h3>
                    <p className="mt-2 max-w-md text-sm font-medium text-slate-500">No roster profiles match the current filters.</p>
                    <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-[#0072CE] px-4 py-2 text-sm font-black text-white hover:bg-[#0055A6]">
                      Reset search
                    </button>
                  </div>
                )}
                </div>
              )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedExpertIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_22px_60px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex -space-x-2">
                {selectedExperts.slice(0, 5).map((expert) => (
                  <div key={expert.id} className="rounded-full ring-2 ring-white">
                    <Avatar expert={expert} size="sm" />
                  </div>
                ))}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-[#0F1B3D]">{selectedExpertIds.length} experts selected</div>
                <div className="truncate text-xs font-semibold text-slate-500">Batch outreach ready</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleSendMultiEmailInit} className="flex h-10 items-center gap-2 rounded-lg bg-[#0072CE] px-4 text-sm font-black text-white transition hover:bg-[#0055A6]">
                <Send className="h-4 w-4" />
                Email selected
              </button>
              <button type="button" title="Clear selection" onClick={() => setSelectedExpertIds([])} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setSelectedExpert(null)}>
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="relative overflow-hidden bg-[#0066B3] px-6 py-6 text-white">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),transparent_35%,rgba(4,120,87,0.22))]" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 gap-4">
                  <Avatar expert={selectedExpert} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black">{selectedExpert.name}</h2>
                      {selectedExpert.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                          <ShieldCheck className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-lg font-bold text-sky-100">{selectedExpert.title}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-white/90">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5">
                        <MapPin className="h-4 w-4" />
                        {selectedExpert.country}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5">
                        <Languages className="h-4 w-4" />
                        {selectedExpert.languages.join(', ')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5">
                        <Briefcase className="h-4 w-4" />
                        {selectedExpert.yearsExperience} years
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" title="Close profile" onClick={() => setSelectedExpert(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="custom-scrollbar overflow-y-auto bg-slate-50 p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase text-[#172554]">Profile Summary</h3>
                      <Badge className={availabilityClass(selectedExpert.availability)}>{selectedExpert.availability}</Badge>
                    </div>
                    <p className="text-sm font-medium leading-7 text-slate-600">{selectedExpert.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {selectedExpert.specialCapabilities.map((capability) => (
                        <Badge key={capability} className="border-teal-100 bg-teal-50 text-teal-700">
                          <Sparkles className="mr-1 h-3 w-3" />
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Expertise Depth</h3>
                    <div className="space-y-3">
                      {selectedExpert.expertiseLevels.map((item) => (
                        <div key={item.skill} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-black text-[#0F1B3D]">{item.skill}</span>
                            <span className="text-xs font-black text-[#0072CE]">{item.level}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                item.level === 'Expert' ? 'w-[92%] bg-[#0072CE]' : item.level === 'Advanced' ? 'w-[74%] bg-teal-500' : 'w-[56%] bg-amber-500',
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Certifications</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedExpert.certifications.map((certification) => (
                        <div key={certification} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-bold text-slate-700">{certification}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="space-y-6">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Contact</h3>
                    <div className="space-y-4">
                      <a href={`mailto:${selectedExpert.contact.email}`} className="flex items-start gap-3 rounded-lg bg-sky-50 p-3 text-[#0055A6] transition hover:bg-sky-100">
                        <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-xs font-black uppercase">Email</span>
                          <span className="block truncate text-sm font-bold">{selectedExpert.contact.email}</span>
                        </span>
                      </a>
                      <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#0072CE]" />
                        <span>
                          <span className="block text-xs font-black uppercase text-slate-500">Phone</span>
                          <span className="block text-sm font-bold text-slate-800">{selectedExpert.contact.phone}</span>
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[#0072CE]/35 bg-white shadow-sm">
                    <div className="bg-[#004C97] px-5 py-4 text-white">
                      <h3 className="text-sm font-black uppercase">Assignment Details</h3>
                    </div>
                    <div className="space-y-4 p-5">
                      <ProfileFact icon={Briefcase} label="Daily Fee" value={selectedExpert.assignmentDetails.feeRange} />
                      <ProfileFact icon={Target} label="Previous UNICEF" value={`${selectedExpert.assignmentDetails.previousAssignments} assignments`} />
                      <ProfileFact icon={MapPin} label="Home Base" value={selectedExpert.assignmentDetails.homeBase} />
                      <ProfileFact icon={Calendar} label="Duration" value={selectedExpert.assignmentDetails.duration} />
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-black uppercase text-[#172554]">Regional Experience</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.regions.map((region) => (
                        <Badge key={region} className="border-[#004C97] bg-[#004C97] text-white">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row">
              <button type="button" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-black text-slate-700 transition hover:border-[#0072CE]/30 hover:text-[#0072CE]">
                <Download className="h-4 w-4" />
                Download CV
              </button>
              <button type="button" onClick={() => handleSendEmailInit(selectedExpert)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0072CE] text-sm font-black text-white transition hover:bg-[#0055A6]">
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {emailModalData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setEmailModalData(null)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-[#0F1B3D]">Send Email Notification</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">Prepare roster outreach</p>
              </div>
              <button type="button" title="Close email modal" onClick={() => setEmailModalData(null)} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">To</span>
                <span className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0072CE] text-xs font-black text-white">{emailModalData.initials}</div>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-[#0F1B3D]">{emailModalData.name}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{emailModalData.contact.email}</span>
                  </span>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">Subject</span>
                <input
                  value={emailSubject}
                  onChange={(event) => setEmailSubject(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase text-slate-500">Message</span>
                <textarea
                  rows={7}
                  value={emailBody}
                  onChange={(event) => setEmailBody(event.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-[#0072CE]/15"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button type="button" onClick={() => setEmailModalData(null)} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={handleSendEmailConfirm} className="flex h-10 items-center gap-2 rounded-lg bg-[#0072CE] px-5 text-sm font-black text-white transition hover:bg-[#0055A6]">
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-xl bg-[#0F1B3D] px-5 py-4 text-white shadow-[0_22px_55px_rgba(15,23,42,0.28)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <CheckCircle className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold">{toastMessage}</span>
          <button type="button" title="Dismiss notification" onClick={() => setToastMessage(null)} className="ml-1 text-white/60 transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.32);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 116, 139, 0.52);
        }
      `}</style>
    </div>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#0072CE]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-black uppercase text-slate-500">{label}</div>
        <div className="mt-1 text-sm font-black text-[#0F1B3D]">{value}</div>
      </div>
    </div>
  );
}
