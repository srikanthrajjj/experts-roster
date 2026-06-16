import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { SUGGESTED_SEARCHES } from '../../data/constants';
import { cn } from '../../lib/utils';

type GlobalSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
};

export default function GlobalSearch({
  value,
  onChange,
  placeholder = 'Search by name, technology, skill, certification, team, region...',
  showSuggestions = true,
  className,
}: GlobalSearchProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          type="text"
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[#0072CE] focus:bg-white focus:ring-2 focus:ring-[#0072CE]/15"
        />
      </div>

      {showSuggestions && focused && !value && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-[#0072CE]" />
            Suggested searches
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(term)}
                className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-[#0072CE] transition hover:border-[#0072CE]/30 hover:bg-sky-100"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
