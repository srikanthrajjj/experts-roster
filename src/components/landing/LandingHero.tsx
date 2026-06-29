import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { SUGGESTED_SEARCHES } from '../../data/constants';
import { rosterPlanningPath } from '../../lib/rosterView';

type LandingHeroProps = {
  searchQuery: string;
  searchInputId: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
};

export default function LandingHero({
  searchQuery,
  searchInputId,
  onSearchChange,
  onSearchSubmit,
}: LandingHeroProps) {
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
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0091F9] px-8 py-4 text-base font-black uppercase tracking-wide text-white shadow-lg shadow-[#0091F9]/30 transition hover:bg-[#007ACC] hover:shadow-xl hover:shadow-[#0091F9]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0091F9] focus-visible:ring-offset-2 cursor-pointer sm:min-w-[11rem]"
              >
                <Search className="h-5 w-5" aria-hidden />
                Find experts
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
