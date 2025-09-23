// src/hooks/useRules.ts
import { useFilterStore } from '@/store/filterStore';
import { useRulesQuery } from '@/api/queries';
import { pageToOffset } from '@/api/pagination';

export function useRules() {
  const { filters, page, pageSize, sortBy, sortDir } = useFilterStore();
  
  const pagination = pageToOffset(page, pageSize);
  
  // Include sorting in filters
  const filtersWithSorting = {
    ...filters,
    sort_by: sortBy,
    sort_dir: sortDir
  };
  
  const query = useRulesQuery(pagination, filtersWithSorting);
  
  return {
    rules: query.data?.rules ?? [],
    total: query.data?.total ?? 0,
    totalPages: Math.ceil((query.data?.total ?? 0) / pageSize),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}