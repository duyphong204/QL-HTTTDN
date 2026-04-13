import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseFilters } from '@/types/common.types';

type SetFiltersFn<TFilters> = (filters: Partial<TFilters>) => void;

interface UsePaginatedListOptions<TFilters extends BaseFilters> {
  filters: TFilters;
  setFilters: SetFiltersFn<TFilters>;
  fetchData: () => Promise<void> | void;
  debounceMs?: number;
  searchKey?: keyof TFilters;
}

export const usePaginatedList = <TFilters extends BaseFilters>({
  filters,
  setFilters,
  fetchData,
  debounceMs = 400,
  searchKey = 'search' as keyof TFilters,
}: UsePaginatedListOptions<TFilters>) => {
  const [searchTerm, setSearchTerm] = useState(String(filters[searchKey] ?? ''));

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextValue = searchTerm.trim();
      const currentValue = String(filters[searchKey] ?? '');

      if (nextValue === currentValue) {
        return;
      }

      setFilters({
        [searchKey]: nextValue,
        page: 1,
      } as Partial<TFilters>);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [debounceMs, filters, searchKey, searchTerm, setFilters]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, filters]);

  const updateFilters = useCallback(
    (newFilters: Partial<TFilters>) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const goToPage = useCallback(
    (page: number) => {
      setFilters({ page } as Partial<TFilters>);
    },
    [setFilters],
  );

  const currentPage = useMemo(() => Number(filters.page ?? 1), [filters.page]);

  return {
    searchTerm,
    setSearchTerm,
    updateFilters,
    goToPage,
    currentPage,
  };
};
