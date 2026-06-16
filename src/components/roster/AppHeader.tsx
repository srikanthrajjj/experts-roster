import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import UnicefLogo from './UnicefLogo';

type AppHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showVersionToggle?: boolean;
};

export default function AppHeader({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search portal...',
  showVersionToggle = false,
}: AppHeaderProps) {
  return (
    <header className="relative z-30 h-[66px] bg-[#0091F9] text-white shadow-[0_14px_30px_rgba(0,145,249,0.18)]">
      <div className="flex h-full items-center justify-between gap-5 px-5 xl:px-8">
        <div className="flex h-full min-w-0 items-center gap-7">
          <Link to="/" className="flex shrink-0 items-center rounded-md outline-none transition hover:opacity-90 focus:ring-2 focus:ring-white/60">
            <UnicefLogo className="h-10" />
          </Link>

          <nav className="hidden h-full items-center gap-3 text-sm font-bold lg:flex">
            <Link
              to="/roster/planning"
              className="flex h-10 items-center rounded-full bg-white px-5 text-[#0091F9] shadow-sm transition hover:bg-sky-50"
            >
              Resource availability & planning
            </Link>
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          <div className="relative hidden w-full max-w-[440px] md:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/75" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-full border border-white/15 bg-white/15 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/75 focus:border-white/40 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400"
            />
          </div>
          {showVersionToggle && (
            <Link
              to="/roster/legacy"
              className={cn('min-w-[48px] rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-white/85 transition hover:bg-white/20')}
            >
              Legacy
            </Link>
          )}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-sm font-black shadow-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
