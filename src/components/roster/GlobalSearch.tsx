import React, { useMemo } from 'react';
import { Search, Sparkles, User } from 'lucide-react';
import { SUGGESTED_SEARCHES } from '../../data/constants';
import type { ITExpert } from '../../types/expert';
import { getSearchSuggestions } from '../../lib/searchExperts';
import { cn } from '../../lib/utils';

type GlobalSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showTypeahead?: boolean;
  experts?: ITExpert[];
  onSelectExpert?: (expertId: string) => void;
  className?: string;
  inputClassName?: string;
  inputId?: string;
  size?: 'default' | 'hero';
};

export default function GlobalSearch({
  value,
  onChange,
  placeholder = 'Search by name, skill, country...',
  showSuggestions = true,
  showTypeahead = false,
  experts = [],
  onSelectExpert,
  className,
  inputClassName,
  inputId,
  size = 'default',
}: GlobalSearchProps) {
  const [focused, setFocused] = React.useState(false);

  const typeaheadResults = useMemo(() => {
    if (!showTypeahead || !value.trim() || experts.length === 0) return [];
    return getSearchSuggestions(experts, value, 8);
  }, [showTypeahead, value, experts]);

  const showSuggestedTerms = showSuggestions && focused && !value.trim();
  const showExpertTypeahead = focused && value.trim().length > 0 && showTypeahead;
  const showDropdown = showSuggestedTerms || showExpertTypeahead;

  const isHero = size === 'hero';

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400',
            isHero ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4',
          )}
        />
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          type="search"
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-slate-50 font-semibold outline-none transition focus:border-[#0072CE] focus:bg-white focus:ring-2 focus:ring-[#0072CE]/15',
            isHero
              ? 'rounded-xl border-sky-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 shadow-sm focus:border-[#0091F9] focus:ring-sky-100'
              : 'h-10 pl-10 pr-3 text-sm',
            inputClassName,
          )}
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
          {showSuggestedTerms && (
            <div className="p-3">
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

          {showExpertTypeahead && (
            <div className="py-1">
              {typeaheadResults.length > 0 ? (
                <ul className="list-none p-0" role="listbox" aria-label="Expert suggestions">
                  {typeaheadResults.map((item) => (
                    <li key={item.expertId}>
                      <button
                        type="button"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (onSelectExpert) {
                            onChange(item.label);
                            onSelectExpert(item.expertId);
                          } else {
                            onChange(item.label);
                          }
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-sky-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#0072CE]">
                          <User className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-[#0F1B3D]">{item.label}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {item.matchHint ? `${item.matchHint} · ${item.sublabel}` : item.sublabel}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-3 text-sm text-slate-500">No matching experts — try another term.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
