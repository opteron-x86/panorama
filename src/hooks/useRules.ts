// src/hooks/useRules.ts
import { useMemo } from 'react';
import { useRulesQuery } from '@/api/queries';
import { useFilterStore } from '@/store/filterStore';
import { pageToOffset } from '@/api/pagination';

export function useRules() {
  const { filters, page, pageSize } = useFilterStore();
  
  const pagination = useMemo(() => 
    pageToOffset(page, pageSize), [page, pageSize]
  );
  
  const query = useRulesQuery(pagination, filters, {
    keepPreviousData: true,
  });
  
  const totalPages = query.data 
    ? Math.ceil(query.data.total / pageSize) 
    : 0;
  
  return {
    rules: query.data?.rules || [],
    total: query.data?.total || 0,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}