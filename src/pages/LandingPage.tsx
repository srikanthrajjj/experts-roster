import React, { useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Globe2,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { QUICK_LINKS_ADVISORS, QUICK_LINKS_CO, type QuickLink } from '../data/constants';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import { rosterPlanningPath } from '../lib/rosterView';
import { formatNextAvailable } from '../lib/availability';
import { getRoleDotClass, getRoleLabel, isExpertRole } from '../lib/userRole';
import { usePersonaModal } from '../contexts/PersonaModalContext';
import { LandingThemeProvider, useLandingTheme } from '../contexts/LandingThemeContext';
import UnicefDitOneBrand from '../components/roster/UnicefDitOneBrand';
import Avatar, { StatusBadge } from '../components/roster/SharedUI';
import { ExpertResourceBadges } from '../components/roster/LeafBadges';
import LandingHero from '../components/landing/LandingHero';
import ThemeToggleFab from '../components/landing/ThemeToggleFab';
import { cn } from '../lib/utils';

const TEAM_BLUE = '#0091F9';

function LinkTile({ link }: { link: QuickLink }) {
  const { isMidnight } = useLandingTheme();
  const base = cn(
    'group flex items-center justify-between gap-4 rounded-xl px-6 py-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    isMidnight
      ? 'border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#00ADEF]/40 hover:bg-white/10 focus-visible:ring-[#00ADEF]'
      : 'border border-slate-200 bg-white shadow-sm hover:border-[#0091F9]/40 hover:shadow-md focus-visible:ring-[#0091F9]',
  );
  const inner = (
    <>
      <span
        className={cn(
          'text-[15px] font-semibold leading-snug transition-colors',
          isMidnight
            ? 'text-slate-200 group-hover:text-[#00ADEF]'
            : 'text-slate-800 group-hover:text-[#0091F9]',
        )}
      >
        {link.label}
      </span>
      <ArrowRight
        className={cn(
          'h-5 w-5 shrink-0 transition-all group-hover:translate-x-0.5',
          isMidnight ? 'text-slate-500 group-hover:text-[#00ADEF]' : 'text-slate-300 group-hover:text-[#0091F9]',
        )}
        aria-hidden
      />
    </>
  );
  if (link.external) return <a href={link.href} target="_blank" rel="noopener noreferrer" className={base}>{inner}</a>;
  if (link.href.startsWith('#')) return <a href={link.href} className={base}>{inner}</a>;
  return <Link to={link.href} className={base}>{inner}</Link>;
}

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Search the roster',
    body: 'Filter by skill, region, or certification. Shortlist experts who match your programme needs.',
  },
  {
    step: '2',
    title: 'Check availability',
    body: 'Review live allocation and Gantt timelines before you commit — including partial capacity.',
  },
  {
    step: '3',
    title: 'Connect',
    body: 'Open a profile, verify credentials, and reach out to staff your initiative.',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: 'Who can use the marketplace?',
    a: 'UNICEF staff seeking digital support, and tech experts who maintain their advisor profiles.',
  },
  {
    q: 'How current is availability?',
    a: 'Experts update their own schedules. The roster shows live allocation, partial capacity, and next-available dates.',
  },
  {
    q: 'How do I request someone?',
    a: 'Search the roster, open a profile, then use the contact flow to reach out with your staffing need.',
  },
] as const;

type NavDropdownItem = { label: string; to: string; external?: boolean };
type NavItem = 
  | { type: 'link'; label: string; to: string; external?: boolean }
  | { type: 'dropdown'; label: string; items: NavDropdownItem[] };

const NAVIGATION_ITEMS: NavItem[] = [
  { type: 'link', label: 'Home', to: '/' },
  { type: 'link', label: 'Get support', to: '/roster' },
  {
    type: 'dropdown',
    label: 'For Advisors',
    items: [
      { label: 'Advisor dashboard', to: '/roster/expert-dashboard' },
      { label: 'Add Expert Roster', to: '/roster/add' },
    ],
  },
  {
    type: 'dropdown',
    label: 'TeamOne resources',
    items: [
      { label: 'Find Expert Roster', to: '/roster' },
      { label: 'Process & Scope', to: 'https://www.unicef.org/digital-impact/teamone', external: true },
    ],
  },
  { type: 'link', label: 'Events', to: 'https://www.unicef.org/digital-impact/teamone', external: true },
  {
    type: 'dropdown',
    label: 'What\'s happening in TeamOne',
    items: [
      { label: 'News & Updates', to: 'https://www.unicef.org/digital-impact/teamone', external: true },
      { label: 'Announcements', to: 'https://www.unicef.org/digital-impact/teamone', external: true },
    ],
  },
  { type: 'link', label: 'FAQs', to: '#faq-heading' },
];

function navItemClassName(isMidnight: boolean, compact?: boolean) {
  return cn(
    'rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 whitespace-nowrap',
    compact ? 'px-3 py-3 text-sm' : 'px-2 py-1.5 text-[13px] 2xl:px-2.5 2xl:text-sm',
    isMidnight
      ? 'text-slate-300 hover:bg-white/10 hover:text-[#00ADEF] focus-visible:ring-[#00ADEF]'
      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0091F9] focus-visible:ring-[#0091F9]',
  );
}

function NavLeaf({
  item,
  className,
  onNavigate,
}: {
  item: { label: string; to: string; external?: boolean };
  className: string;
  onNavigate?: () => void;
}) {
  if (item.external || item.to.startsWith('http')) {
    return (
      <a href={item.to} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }
  if (item.to.startsWith('#')) {
    return (
      <a href={item.to} className={className} onClick={onNavigate}>
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

function DesktopNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { isMidnight } = useLandingTheme();
  return (
    <>
      {NAVIGATION_ITEMS.map((item) => {
        if (item.type === 'link') {
          return (
            <div key={item.label}>
              <NavLeaf
                item={item}
                className={navItemClassName(isMidnight)}
                onNavigate={onNavigate}
              />
            </div>
          );
        }
        return (
          <div key={item.label} className="group relative">
            <button
              type="button"
              className={cn(navItemClassName(isMidnight), 'inline-flex items-center gap-1 cursor-pointer')}
              aria-haspopup="true"
            >
              {item.label}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </button>
            <div className="invisible absolute left-0 top-full z-50 min-w-[220px] pt-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div
                className={cn(
                  'rounded-xl border py-1 shadow-lg',
                  isMidnight ? 'border-white/10 bg-[#0F1729]' : 'border-slate-200 bg-white',
                )}
              >
                {item.items.map((sub) => (
                  <div key={sub.label}>
                    <NavLeaf
                      item={sub}
                      className={cn(
                        'block px-4 py-2.5 text-sm font-semibold',
                        isMidnight
                          ? 'text-slate-200 hover:bg-white/10 hover:text-[#00ADEF]'
                          : 'text-slate-700 hover:bg-sky-50 hover:text-[#0091F9]',
                      )}
                      onNavigate={onNavigate}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function MobileNavigation({ onNavigate }: { onNavigate: () => void }) {
  const { isMidnight } = useLandingTheme();
  const flatItems: { label: string; to: string; external?: boolean }[] = [];
  NAVIGATION_ITEMS.forEach((item) => {
    if (item.type === 'link') flatItems.push(item);
    else flatItems.push(...item.items);
  });

  return (
    <>
      {flatItems.map((item) => (
        <div key={item.label}>
          <NavLeaf
            item={item}
            className={navItemClassName(isMidnight, true)}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </>
  );
}

function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { isMidnight } = useLandingTheme();
  const panelId = `${id}-panel`;

  return (
    <div
      className={cn(
        'rounded-xl border',
        isMidnight ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={id}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isMidnight
              ? 'hover:bg-white/5 focus-visible:ring-[#00ADEF]'
              : 'hover:bg-slate-50 focus-visible:ring-[#0091F9]',
          )}
        >
          <span className={cn('font-bold', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>{question}</span>
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 transition-transform',
              isMidnight ? 'text-slate-400' : 'text-slate-400',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={id}
        hidden={!open}
        className={cn(
          'border-t px-5 pb-4 pt-1 text-sm leading-relaxed',
          isMidnight ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-600',
        )}
      >
        {answer}
      </div>
    </div>
  );
}

function LandingPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { userRole, openPersonaModal } = usePersonaModal();
  const navigate = useNavigate();
  const mobileNavId = useId();
  const searchInputId = useId();
  const faqBaseId = useId();

  const { isMidnight } = useLandingTheme();
  const kpis = useMemo(() => computeKPIs(MOCK_IT_EXPERTS), []);
  const marketplacePath = isExpertRole(userRole) ? '/roster/expert-dashboard' : '/roster/planning';

  const featuredExperts = useMemo(
    () =>
      [...MOCK_IT_EXPERTS]
        .sort((a, b) => {
          const score = (e: typeof a) =>
            (e.availabilityStatus === 'available' ? 3 : e.availabilityStatus === 'partially_allocated' ? 2 : 0) +
            e.trustRating / 10;
          return score(b) - score(a);
        })
        .slice(0, 3),
    [],
  );

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    for (const expert of MOCK_IT_EXPERTS) {
      for (const skill of expert.technologyStack) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, []);

  const searchTarget = searchQuery
    ? rosterPlanningPath('list', { search: searchQuery })
    : rosterPlanningPath('list');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchTarget);
  };

  return (
    <div
      className={cn(
        'min-h-screen overflow-x-hidden font-sans pb-20 md:pb-0 transition-colors duration-300',
        isMidnight ? 'bg-[#070D18] text-slate-100' : 'bg-[#F7FAFD] text-slate-800',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#0072CE] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0091F9]"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 w-full backdrop-blur-md transition-colors duration-300',
          isMidnight
            ? 'border-b border-white/10 bg-[#0B1220]/95'
            : 'border-b border-slate-100 bg-white/95 shadow-sm shadow-slate-900/[0.03]',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="TeamOne home"
            className="shrink-0 rounded-md outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
          >
            <UnicefDitOneBrand
              className={cn(
                'h-8 w-auto max-w-[min(100%,160px)] sm:h-10 sm:max-w-[220px]',
                isMidnight && 'brightness-110 contrast-105',
              )}
            />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto 2xl:flex [&::-webkit-scrollbar]:hidden"
            aria-label="Primary"
            style={{ scrollbarWidth: 'none' }}
          >
            <DesktopNavigation />
          </nav>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openPersonaModal}
              className={cn(
                'flex max-w-[7.5rem] items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:max-w-[9rem] sm:px-3 2xl:max-w-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isMidnight
                  ? 'bg-white/10 text-[#00ADEF] hover:bg-white/15 focus-visible:ring-[#00ADEF]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 focus-visible:ring-[#0091F9]',
              )}
            >
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', getRoleDotClass(userRole))} aria-hidden />
              <span className="truncate">{userRole ? getRoleLabel(userRole) : 'Choose role'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg 2xl:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2',
                isMidnight
                  ? 'text-slate-200 hover:bg-white/10 focus-visible:ring-[#00ADEF]'
                  : 'text-slate-600 hover:bg-slate-100 focus-visible:ring-[#0091F9]',
              )}
              aria-expanded={mobileNavOpen}
              aria-controls={mobileNavId}
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileNavOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div
            id={mobileNavId}
            className={cn(
              'max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t px-4 py-4 sm:px-6 2xl:hidden',
              isMidnight ? 'border-white/10 bg-[#0B1220]' : 'border-slate-100 bg-white',
            )}
          >
            <nav className="flex flex-col gap-1" aria-label="Primary mobile">
              <MobileNavigation onNavigate={() => setMobileNavOpen(false)} />
              <button
                type="button"
                onClick={() => {
                  openPersonaModal();
                  setMobileNavOpen(false);
                }}
                className={cn(
                  'mt-2 rounded-lg px-4 py-3 text-left text-sm font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2',
                  isMidnight
                    ? 'bg-white/10 text-[#00ADEF] focus-visible:ring-[#00ADEF]'
                    : 'bg-slate-100 text-slate-700 focus-visible:ring-[#0091F9]',
                )}
              >
                {userRole ? `Role: ${getRoleLabel(userRole)}` : 'Choose your role'}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer for fixed header — matches header bar height */}
      <div className="h-[52px] sm:h-[56px]" aria-hidden />

      <main id="main-content">
        <LandingHero
          searchQuery={searchQuery}
          searchInputId={searchInputId}
          kpis={kpis}
          topSkillsCount={topSkills.length}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Two clear paths */}
        <section
          className={cn(
            'border-b py-10 transition-colors',
            isMidnight ? 'border-white/10 bg-[#0B1220]' : 'border-slate-200 bg-white',
          )}
          aria-labelledby="paths-heading"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 id="paths-heading" className="sr-only">
              Choose your path
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to={marketplacePath}
                className={cn(
                  'group flex flex-col rounded-2xl border-2 p-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isMidnight
                    ? 'border-[#00ADEF]/30 bg-gradient-to-br from-[#0091F9]/10 to-transparent hover:border-[#00ADEF]/50 hover:shadow-[0_0_30px_rgba(0,173,239,0.15)] focus-visible:ring-[#00ADEF]'
                    : 'border-[#0091F9]/20 bg-gradient-to-br from-sky-50 to-white hover:border-[#0091F9]/40 hover:shadow-lg focus-visible:ring-[#0091F9]',
                )}
              >
                <h3 className={cn('text-xl font-black', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
                  I need digital support
                </h3>
                <p className={cn('mt-2 flex-1 text-sm leading-relaxed', isMidnight ? 'text-slate-300' : 'text-slate-600')}>
                  Browse experts, check capacity, and request staffing for your country office or programme.
                </p>
                <span className={cn('mt-4 inline-flex items-center gap-1 text-sm font-bold', isMidnight ? 'text-[#00ADEF]' : 'text-[#0091F9]')}>
                  Open marketplace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
              <Link
                to="/roster/expert-dashboard"
                className={cn(
                  'group flex flex-col rounded-2xl border-2 p-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isMidnight
                    ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] focus-visible:ring-[#00ADEF]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg focus-visible:ring-[#0091F9]',
                )}
              >
                <h3 className={cn('text-xl font-black', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
                  I am a tech expert
                </h3>
                <p className={cn('mt-2 flex-1 text-sm leading-relaxed', isMidnight ? 'text-slate-300' : 'text-slate-600')}>
                  Update your availability, skills, and certifications so managers can find and book you.
                </p>
                <span className={cn('mt-4 inline-flex items-center gap-1 text-sm font-bold', isMidnight ? 'text-[#00ADEF]' : 'text-[#0091F9]')}>
                  Open advisor dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* TeamOne quick links */}
        <section
          className={cn(
            'border-y py-14 sm:py-16 transition-colors',
            isMidnight
              ? 'border-white/10 bg-gradient-to-b from-[#0B1220] to-[#070D18]'
              : 'border-blue-100 bg-[#EEF6FF]',
          )}
          aria-label="Quick links"
        >
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className={cn('mb-10 text-2xl font-black sm:text-3xl', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
              Quick Links
            </h2>
            <div className="grid gap-10 sm:grid-cols-2">

              {/* Country Offices */}
              <div>
                <h2 id="quick-links-co-heading" className="mb-6 text-xs font-black uppercase tracking-widest text-[#0091F9]">
                  For Country Offices
                </h2>
                <div className="space-y-3">
                  {QUICK_LINKS_CO.map((link) => (
                    <div key={link.label}>
                      <LinkTile link={link} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Advisors */}
              <div>
                <h2
                  id="quick-links-advisors-heading"
                  className={cn(
                    'mb-6 text-xs font-black uppercase tracking-widest',
                    isMidnight ? 'text-[#00ADEF]' : 'text-[#0F1B3D]',
                  )}
                >
                  For Digital Advisors
                </h2>
                <div className="space-y-3">
                  {QUICK_LINKS_ADVISORS.map((link) => (
                    <div key={link.label}>
                      <LinkTile link={link} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
          {/* How it works — replaces duplicate value pillars */}
          <section className="mb-16" aria-labelledby="how-heading">
            <h2 id="how-heading" className={cn('text-2xl font-black sm:text-3xl', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
              How it works
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <li
                  key={item.step}
                  className={cn(
                    'rounded-2xl border p-6',
                    isMidnight
                      ? 'border-white/10 bg-white/5 backdrop-blur-sm'
                      : 'border-slate-200 bg-white shadow-sm',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white',
                      isMidnight ? 'bg-gradient-to-r from-[#0091F9] to-[#00ADEF]' : 'bg-[#0091F9]',
                    )}
                    aria-hidden
                  >
                    {item.step}
                  </span>
                  <h3 className={cn('mt-4 text-base font-black', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
                    {item.title}
                  </h3>
                  <p className={cn('mt-2 text-sm leading-relaxed', isMidnight ? 'text-slate-300' : 'text-slate-600')}>
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-16" aria-labelledby="experts-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="experts-heading" className={cn('text-2xl font-black sm:text-3xl', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
                  Available now
                </h2>
                <p className={cn('mt-1 text-sm', isMidnight ? 'text-slate-400' : 'text-slate-600')}>
                  Top-rated experts from the live roster.
                </p>
              </div>
              <Link
                to={rosterPlanningPath('list')}
                className={cn(
                  'text-sm font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 rounded',
                  isMidnight
                    ? 'text-[#00ADEF] focus-visible:ring-[#00ADEF]'
                    : 'text-[#0091F9] focus-visible:ring-[#0091F9]',
                )}
              >
                View all experts
              </Link>
            </div>

            <ul className="mt-6 grid list-none gap-4 p-0 lg:grid-cols-3">
              {featuredExperts.map((expert) => (
                <li key={expert.id}>
                  <Link
                    to={rosterPlanningPath('list', { profile: expert.id })}
                    className={cn(
                      'flex h-full flex-col rounded-2xl border p-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      isMidnight
                        ? 'border-white/10 bg-white/5 hover:border-[#00ADEF]/30 hover:bg-white/[0.08] focus-visible:ring-[#00ADEF]'
                        : 'border-slate-200 bg-white shadow-sm hover:border-sky-200 hover:shadow-md focus-visible:ring-[#0091F9]',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar expert={expert} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('truncate font-black', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
                            {expert.name}
                          </span>
                          <ExpertResourceBadges expert={expert} max={3} />
                        </div>
                        <p className={cn('truncate text-sm', isMidnight ? 'text-slate-400' : 'text-slate-500')}>
                          {expert.role}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={expert.availabilityStatus} />
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'mt-4 flex items-center justify-between border-t pt-3 text-xs',
                        isMidnight ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500',
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Globe2 className="h-3.5 w-3.5" aria-hidden />
                        {expert.country}
                      </span>
                      <span className={cn('inline-flex items-center gap-1 font-semibold', isMidnight ? 'text-[#00ADEF]' : 'text-[#0072CE]')}>
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {formatNextAvailable(expert.nextAvailableDate, expert.availabilityStatus)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className={cn('text-2xl font-black sm:text-3xl', isMidnight ? 'text-white' : 'text-[#0F1B3D]')}>
              Questions
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <div key={item.q}>
                  <FaqItem
                    id={`${faqBaseId}-${i}`}
                    question={item.q}
                    answer={item.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section
            className={cn(
              'mt-16 rounded-2xl border p-6 sm:p-8',
              isMidnight ? 'border-[#00ADEF]/20 bg-gradient-to-br from-[#0091F9]/10 to-transparent' : 'border-sky-100 bg-white',
            )}
            aria-labelledby="about-heading"
          >
            <h2 id="about-heading" className={cn('text-lg font-black', isMidnight ? 'text-[#00ADEF]' : 'text-[#0091F9]')}>
              What is TeamOne?
            </h2>
            <p className={cn('mt-3 max-w-3xl text-sm leading-relaxed', isMidnight ? 'text-slate-300' : 'text-slate-600')}>
              TeamOne is UNICEF&apos;s operating model for Digital Impact — connecting expertise from country offices, regional hubs, and headquarters into one global team to deliver coordinated digital support.
            </p>
          </section>
        </div>
      </main>

      <footer
        className={cn(
          'border-t py-8 transition-colors',
          isMidnight ? 'border-white/10 bg-[#0B1220]' : 'border-slate-200 bg-white',
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row lg:px-8">
          <UnicefDitOneBrand
            className={cn(
              'h-[57px] w-auto max-w-[286px] opacity-90 sm:h-[62px] sm:max-w-[338px]',
              isMidnight && 'brightness-110',
            )}
          />
          <nav
            className={cn(
              'flex flex-wrap justify-center gap-5 text-sm font-semibold',
              isMidnight ? 'text-slate-400' : 'text-slate-500',
            )}
            aria-label="Footer"
          >
            <Link
              to={rosterPlanningPath('list')}
              className={cn(
                'rounded focus-visible:outline-none focus-visible:ring-2',
                isMidnight ? 'hover:text-[#00ADEF] focus-visible:ring-[#00ADEF]' : 'hover:text-[#0091F9] focus-visible:ring-[#0091F9]',
              )}
            >
              Expert roster
            </Link>
            <button
              type="button"
              onClick={openPersonaModal}
              className={cn(
                'cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2',
                isMidnight ? 'hover:text-[#00ADEF] focus-visible:ring-[#00ADEF]' : 'hover:text-[#0091F9] focus-visible:ring-[#0091F9]',
              )}
            >
              Switch role
            </button>
          </nav>
        </div>
      </footer>

      <ThemeToggleFab />

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 border-t p-3 md:hidden',
          isMidnight ? 'border-white/10 bg-[#0B1220]' : 'border-slate-200 bg-white',
        )}
      >
        <Link
          to={searchTarget}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isMidnight
              ? 'bg-gradient-to-r from-[#0091F9] to-[#00ADEF] focus-visible:ring-[#00ADEF]'
              : 'focus-visible:ring-[#0091F9]',
          )}
          style={isMidnight ? undefined : { backgroundColor: TEAM_BLUE }}
        >
          <Search className="h-4 w-4" aria-hidden />
          Search roster
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingPageContent />
    </LandingThemeProvider>
  );
}
