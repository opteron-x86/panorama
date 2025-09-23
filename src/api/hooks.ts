import { useState, useCallback } from 'react';
import { useRulesQuery, useFiltersQuery } from './queries';
import { RuleFilters, Pagination } from './types';
import { pageToOffset, getPaginationMeta } from './pagination';

export function usePaginatedRules(defaultPageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<RuleFilters>({});

  const pagination = pageToOffset(page, pageSize);
  
  const query = useRulesQuery(pagination, filters);
  
  const paginationMeta = query.data 
    ? getPaginationMeta(query.data.offset, query.data.limit, query.data.total)
    : null;

  const updateFilters = useCallback((newFilters: RuleFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  return {
    rules: query.data?.rules ?? [],
    isLoading: query.isLoading,
    error: query.error,
    pagination: paginationMeta,
    page,
    pageSize,
    filters,
    setPage,
    setPageSize,
    updateFilters,
    refetch: query.refetch,
  };
}

export function useFilterOptions() {
  const { data, isLoading, error } = useFiltersQuery();

  return {
    sources: data?.sources ?? [],
    ruleTypes: data?.rule_types ?? [],
    severities: data?.severities ?? [],
    tactics: data?.tactics ?? [],
    platforms: data?.platforms ?? [],
    isLoading,
    error,
  };
}