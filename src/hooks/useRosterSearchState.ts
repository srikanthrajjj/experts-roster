import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FilterState } from '../types/expert';
import { useDebouncedValue } from './useDebouncedValue';

type SetFilters = Dispatch<SetStateAction<FilterState>>;

/**
 * Keeps toolbar search input, filter state, and ?search= URL param in sync.
 * Filters update immediately while typing; URL updates after debounce settles.
 */
export function useRosterSearchState(setFilters: SetFilters) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 250);

  useEffect(() => {
    setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
  }, [searchInput, setFilters]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== searchInput && debouncedSearch === searchInput) {
      setSearchInput(urlSearch);
    }
  }, [searchParams, searchInput, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch !== searchInput) return;

    const next = debouncedSearch.trim();
    setSearchParams(
      (prev) => {
        const urlSearch = prev.get('search') ?? '';
        if (urlSearch === next) return prev;
        const params = new URLSearchParams(prev);
        if (next) params.set('search', next);
        else params.delete('search');
        return params;
      },
      { replace: true },
    );
  }, [debouncedSearch, searchInput, setSearchParams]);

  const syncSearchFromFilters = (next: FilterState) => {
    setFilters(next);
    if (next.search !== searchInput) setSearchInput(next.search);
  };

  const clearSearchInput = () => setSearchInput('');

  return { searchInput, setSearchInput, syncSearchFromFilters, clearSearchInput };
}
