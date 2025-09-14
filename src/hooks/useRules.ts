import { useState, useEffect, useCallback } from 'react';
import { 
  fetchRules, 
  fetchFilterOptions,
  RuleSummary, 
  RuleFilters, 
  PaginationParams,
  FilterOptionsResponse 
} from '@/api';

interface UseRulesState {
  rules: RuleSummary[];
  total: number;
  loading: boolean;
  error: string | null;
  filterOptions: FilterOptionsResponse | null;
}

export const useRules = () => {
  const [state, setState] = useState<UseRulesState>({
    rules: [],
    total: 0,
    loading: false,
    error: null,
    filterOptions: null,
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    sortBy: 'updated_date',
    sortDirection: 'desc',
  });

  const [filters, setFilters] = useState<RuleFilters>({});

  // Load filter options once on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await fetchFilterOptions();
        setState(prev => ({ ...prev, filterOptions: options }));
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  // Load rules when pagination or filters change
  const loadRules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetchRules(pagination, filters);
      setState(prev => ({
        ...prev,
        rules: response.items,
        total: response.total,
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load rules',
      }));
    }
  }, [pagination, filters]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const updateFilters = useCallback((newFilters: Partial<RuleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationParams>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    ...state,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    clearFilters,
    refresh: loadRules,
  };
};