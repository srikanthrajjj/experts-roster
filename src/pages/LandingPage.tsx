import React, { useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Globe2,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { SUGGESTED_SEARCHES, QUICK_LINKS_ADVISORS, QUICK_LINKS_CO, type QuickLink } from '../data/constants';
import { MOCK_IT_EXPERTS, computeKPIs } from '../data/itExperts';
import { rosterPlanningPath } from '../lib/rosterView';
import { formatNextAvailable } from '../lib/availability';
import { getRoleDotClass, getRoleLabel, isExpertRole } from '../lib/userRole';
import { usePersonaModal } from '../contexts/PersonaModalContext';
import UnicefDitOneBrand from '../components/roster/UnicefDitOneBrand';
import Avatar, { StatusBadge } from '../components/roster/SharedUI';
import { ExpertResourceBadges } from '../components/roster/LeafBadges';
import { cn } from '../lib/utils';

const TEAM_BLUE = '#0091F9';
const TEAM_CYAN = '#00ADEF';

function LinkTile({ link }: { link: QuickLink }) {
  const base =
    'group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition-all hover:border-[#0091F9]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2';
  const inner = (
    <>
      <span className="text-[15px] font-semibold leading-snug text-slate-800 group-hover:text-[#0091F9] transition-colors">
        {link.label}
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#0091F9]" aria-hidden />
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

const NAV_LINKS = [
  { label: 'Find experts', to: '/roster/planning', description: 'Browse the IT talent roster' },
  { label: 'Advisor dashboard', to: '/roster/expert-dashboard', description: 'Manage your expert profile' },
] as const;

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
  const panelId = `${id}-panel`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h3 className="m-0">
        <button
          type="button"
          id={id}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left cursor-pointer hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
        >
          <span className="font-bold text-[#0F1B3D]">{question}</span>
          <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={id}
        hidden={!open}
        className="border-t border-slate-100 px-5 pb-4 pt-1 text-sm leading-relaxed text-slate-600"
      >
        {answer}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { userRole, openPersonaModal } = usePersonaModal();
  const navigate = useNavigate();
  const mobileNavId = useId();
  const searchInputId = useId();
  const faqBaseId = useId();

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
    <div className="min-h-screen bg-[#F7FAFD] font-sans text-slate-800 pb-20 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#0072CE] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0091F9]"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link
            to="/"
            aria-label="TeamOne home"
            className="shrink-0 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
          >
            <UnicefDitOneBrand className="h-[62px] w-auto max-w-[min(100%,364px)] sm:h-[73px] sm:max-w-[416px]" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                title={item.description}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-[#0091F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPersonaModal}
              className="hidden items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-[#0072CE] transition hover:bg-sky-100 sm:flex cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', getRoleDotClass(userRole))} aria-hidden />
              <span>{userRole ? getRoleLabel(userRole) : 'Choose role'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9]"
              aria-expanded={mobileNavOpen}
              aria-controls={mobileNavId}
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileNavOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div id={mobileNavId} className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Primary mobile">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0091F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9]"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  openPersonaModal();
                  setMobileNavOpen(false);
                }}
                className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sm font-bold text-[#0072CE] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9]"
              >
                {userRole ? `Role: ${getRoleLabel(userRole)}` : 'Choose your role'}
              </button>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* Hero — single decision point: search */}
        <section className="border-b border-sky-100 bg-white" aria-labelledby="hero-heading">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0091F9]">Digital Impact Team One</p>
              <h1 id="hero-heading" className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#0F1B3D] sm:text-5xl">
                Find UNICEF digital experts with live availability
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
                One place to search skills, verify certifications, and staff programmes — backed by real roster data.
              </p>

              <form onSubmit={handleSearchSubmit} className="mt-8" role="search" aria-label="Search experts">
                <label htmlFor={searchInputId} className="sr-only">
                  Search by name, skill, or certification
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
                    <input
                      id={searchInputId}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Azure, ServiceNow, AI/ML"
                      className="w-full rounded-xl border border-sky-200 bg-white py-3.5 pl-12 pr-4 text-slate-900 shadow-sm focus:border-[#0091F9] focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2 cursor-pointer"
                    style={{ backgroundColor: TEAM_BLUE }}
                  >
                    Search roster
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Popular searches">
                  {SUGGESTED_SEARCHES.slice(0, 3).map((term) => (
                    <Link
                      key={term}
                      to={rosterPlanningPath('list', { search: term })}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#0091F9] hover:text-[#0091F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9]"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </form>


            </div>

            <aside
              className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 sm:p-6"
              aria-label="Roster summary"
            >
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">This week</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Available</dt>
                  <dd className="mt-1 text-2xl font-black text-emerald-600">{kpis.availableThisWeek}</dd>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Partial</dt>
                  <dd className="mt-1 text-2xl font-black text-amber-600">{kpis.partiallyAvailable}</dd>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <dt className="text-[10px] font-bold uppercase text-slate-400">Total pool</dt>
                  <dd className="mt-1 text-2xl font-black text-[#0091F9]">{kpis.total}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                {kpis.availableNext30} experts staffable within 30 days across {topSkills.length}+ technology areas.
              </p>
            </aside>
          </div>
        </section>

        {/* Two clear paths — Hick's Law: binary choice */}
        <section className="border-b border-slate-200 bg-white py-10" aria-labelledby="paths-heading">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 id="paths-heading" className="sr-only">
              Choose your path
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to={marketplacePath}
                className="group flex flex-col rounded-2xl border-2 border-[#0091F9]/20 bg-gradient-to-br from-sky-50 to-white p-6 transition hover:border-[#0091F9]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
              >
                <h3 className="text-xl font-black text-[#0F1B3D]">I need digital support</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Browse experts, check capacity, and request staffing for your country office or programme.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0091F9]">
                  Open marketplace <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
              <Link
                to="/roster/expert-dashboard"
                className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
              >
                <h3 className="text-xl font-black text-[#0F1B3D]">I am a tech expert</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Update your availability, skills, and certifications so managers can find and book you.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0091F9]">
                  Open advisor dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* TeamOne quick links */}
        <section className="border-y border-blue-100 bg-[#EEF6FF] py-14 sm:py-16" aria-label="Quick links">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="mb-10 text-2xl font-black text-[#0F1B3D] sm:text-3xl">Quick Links</h2>
            <div className="grid gap-10 sm:grid-cols-2">

              {/* Country Offices */}
              <div>
                <h2 id="quick-links-co-heading" className="mb-6 text-xs font-black uppercase tracking-widest text-[#0091F9]">
                  For Country Offices
                </h2>
                <div className="space-y-3">
                  {QUICK_LINKS_CO.map((link) => (
                    <LinkTile key={link.label} link={link} />
                  ))}
                </div>
              </div>

              {/* Digital Advisors */}
              <div>
                <h2 id="quick-links-advisors-heading" className="mb-6 text-xs font-black uppercase tracking-widest text-[#0F1B3D]">
                  For Digital Advisors
                </h2>
                <div className="space-y-3">
                  {QUICK_LINKS_ADVISORS.map((link) => (
                    <LinkTile key={link.label} link={link} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
          {/* How it works — replaces duplicate value pillars */}
          <section className="mb-16" aria-labelledby="how-heading">
            <h2 id="how-heading" className="text-2xl font-black text-[#0F1B3D] sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0091F9] text-sm font-black text-white" aria-hidden>
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-black text-[#0F1B3D]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Featured experts — single social proof block */}
          <section className="mb-16" aria-labelledby="experts-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="experts-heading" className="text-2xl font-black text-[#0F1B3D] sm:text-3xl">
                  Available now
                </h2>
                <p className="mt-1 text-sm text-slate-600">Top-rated experts from the live roster.</p>
              </div>
              <Link
                to={rosterPlanningPath('list')}
                className="text-sm font-bold text-[#0091F9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] rounded"
              >
                View all experts
              </Link>
            </div>

            <ul className="mt-6 grid list-none gap-4 p-0 lg:grid-cols-3">
              {featuredExperts.map((expert) => (
                <li key={expert.id}>
                  <Link
                    to={rosterPlanningPath('list', { profile: expert.id })}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar expert={expert} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-black text-[#0F1B3D]">{expert.name}</span>
                          <ExpertResourceBadges expert={expert} max={3} />
                        </div>
                        <p className="truncate text-sm text-slate-500">{expert.role}</p>
                        <div className="mt-2">
                          <StatusBadge status={expert.availabilityStatus} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Globe2 className="h-3.5 w-3.5" aria-hidden />
                        {expert.country}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0072CE]">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {formatNextAvailable(expert.nextAvailableDate, expert.availabilityStatus)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ — collapsed by default to reduce cognitive load */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-black text-[#0F1B3D] sm:text-3xl">
              Questions
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem
                  key={item.q}
                  id={`${faqBaseId}-${i}`}
                  question={item.q}
                  answer={item.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-sky-100 bg-white p-6 sm:p-8" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-lg font-black text-[#0091F9]">
              What is TeamOne?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              TeamOne is UNICEF&apos;s operating model for Digital Impact — connecting expertise from country offices, regional hubs, and headquarters into one global team to deliver coordinated digital support.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row lg:px-8">
          <UnicefDitOneBrand className="h-[57px] w-auto max-w-[286px] opacity-90 sm:h-[62px] sm:max-w-[338px]" />
          <nav className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-slate-500" aria-label="Footer">
            <Link to={rosterPlanningPath('list')} className="hover:text-[#0091F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] rounded">
              Expert roster
            </Link>
            <button
              type="button"
              onClick={openPersonaModal}
              className="hover:text-[#0091F9] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] rounded"
            >
              Switch role
            </button>
          </nav>
        </div>
      </footer>

      {/* Mobile: one primary action only */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white p-3 md:hidden">
        <Link
          to={searchTarget}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2"
          style={{ backgroundColor: TEAM_BLUE }}
        >
          <Search className="h-4 w-4" aria-hidden />
          Search roster
        </Link>
      </div>
    </div>
  );
}
