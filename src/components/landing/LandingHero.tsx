import { Link } from 'react-router-dom';
import { ArrowRight, Search, Sparkles, Users, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import { SUGGESTED_SEARCHES } from '../../data/constants';
import { rosterPlanningPath } from '../../lib/rosterView';
import { useLandingTheme } from '../../contexts/LandingThemeContext';
import { cn } from '../../lib/utils';

type LandingHeroProps = {
  searchQuery: string;
  searchInputId: string;
  kpis: {
    availableThisWeek: number;
    partiallyAvailable: number;
    total: number;
    availableNext30: number;
  };
  topSkillsCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
};

export default function LandingHero({
  searchQuery,
  searchInputId,
  kpis,
  topSkillsCount,
  onSearchChange,
  onSearchSubmit,
}: LandingHeroProps) {
  const { isMidnight } = useLandingTheme();

  if (isMidnight) {
    return (
      <section
        className="relative overflow-hidden border-b border-white/10 bg-[#070D18]"
        aria-labelledby="hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, #0091F9 0%, transparent 42%), radial-gradient(circle at 85% 10%, #00ADEF 0%, transparent 38%), radial-gradient(circle at 50% 100%, #0072CE 0%, transparent 50%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="hero-heading"
              className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Deploy digital expertise across every programme,{' '}
              <span className="bg-gradient-to-r from-[#00ADEF] to-[#0091F9] bg-clip-text text-transparent">
                on demand
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A mission-ready view of UNICEF&apos;s global IT talent — live capacity, verified skills, and
              instant staffing intelligence for country offices and advisors.
            </p>

            <form
              onSubmit={onSearchSubmit}
              className="mx-auto mt-10 max-w-2xl"
              role="search"
              aria-label="Search experts"
            >
              <label htmlFor={searchInputId} className="sr-only">
                Search by name, skill, or certification
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id={searchInputId}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search Azure, ServiceNow, cybersecurity..."
                    className="w-full rounded-2xl border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-white placeholder:text-slate-400 backdrop-blur-md focus:border-[#00ADEF] focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/30"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0091F9] to-[#00ADEF] px-8 py-4 text-sm font-black text-white shadow-[0_0_40px_rgba(0,145,249,0.35)] transition hover:shadow-[0_0_50px_rgba(0,173,239,0.45)]"
                >
                  <Zap className="h-4 w-4" aria-hidden />
                  Launch search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2" role="list" aria-label="Popular searches">
                {SUGGESTED_SEARCHES.slice(0, 3).map((term) => (
                  <Link
                    key={term}
                    to={rosterPlanningPath('list', { search: term })}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-[#00ADEF]/50 hover:text-[#00ADEF]"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </form>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Staffable now', value: kpis.availableThisWeek, icon: Zap, tone: 'text-emerald-300' },
              { label: 'Partial capacity', value: kpis.partiallyAvailable, icon: Users, tone: 'text-amber-300' },
              { label: 'Global pool', value: kpis.total, icon: Sparkles, tone: 'text-[#00ADEF]' },
              { label: 'Next 30 days', value: kpis.availableNext30, icon: ArrowRight, tone: 'text-sky-200' },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-[#0091F9]/40 hover:bg-white/[0.08]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
                  <Icon className={cn('h-4 w-4 opacity-80', tone)} aria-hidden />
                </div>
                <p className={cn('mt-2 text-3xl font-black tabular-nums', tone)}>{value}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Covering {topSkillsCount}+ technology areas · UNICEF Digital Impact Team One
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-sky-100 bg-white" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0091F9]">Digital Impact Team One</p>
          <h1
            id="hero-heading"
            className="mt-3 text-4xl font-black leading-tight tracking-tight text-[#0F1B3D] sm:text-5xl"
          >
            Find UNICEF digital experts with live availability
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            One place to search skills, verify certifications, and staff programmes — backed by real roster data.
          </p>

          <form onSubmit={onSearchSubmit} className="mt-8" role="search" aria-label="Search experts">
            <label htmlFor={searchInputId} className="sr-only">
              Search by name, skill, or certification
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id={searchInputId}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="e.g. Azure, ServiceNow, AI/ML"
                  className="w-full rounded-xl border border-sky-200 bg-white py-3.5 pl-12 pr-4 text-slate-900 shadow-sm focus:border-[#0091F9] focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#0091F9] px-6 py-3.5 text-sm font-bold text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2 cursor-pointer"
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
      </div>
    </section>
  );
}
