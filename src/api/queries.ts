// src/api/queries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  fetchRules,
  fetchRuleById,
  fetchMitreMatrix,
  fetchMitreTechniques,
  fetchCves,
  fetchCveById,
  fetchFilters,
  checkHealth,
  fetchTechniqueDetail,
} from './endpoints';
import {
  RulesResponse,
  RuleDetail,
  RuleFilters,
  Pagination,
  MitreMatrixResponse,
  MitreTechniquesResponse,
  MitreTechniqueDetail,
  MitreFilters,
  CvesResponse,
  CveDetail,
  CveFilters,
  FiltersResponse,
} from './types';

// Query keys
export const queryKeys = {
  health: ['health'] as const,
  rules: (pagination?: Partial<Pagination>, filters?: RuleFilters) => 
    ['rules', pagination, filters] as const,
  rule: (id: string) => ['rule', id] as const,
  mitreMatrix: (platforms?: string[]) => ['mitreMatrix', platforms] as const,
  mitreTechniques: (pagination?: Partial<Pagination>, filters?: MitreFilters) => 
    ['mitreTechniques', pagination, filters] as const,
  mitreTechnique: (id: string) => ['mitreTechnique', id] as const,
  cves: (pagination?: Partial<Pagination>, filters?: CveFilters) => 
    ['cves', pagination, filters] as const,
  cve: (id: string) => ['cve', id] as const,
  filters: ['filters'] as const,
};

// Type helper to omit queryKey and queryFn from options
type QueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

// Health check
export function useHealthQuery(
  options?: QueryOptions<{ status: string }>
) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: checkHealth,
    staleTime: 60 * 1000,
    ...options,
  });
}

// Rules queries
export function useRulesQuery(
  pagination?: Partial<Pagination>,
  filters?: RuleFilters,
  options?: QueryOptions<RulesResponse>
) {
  return useQuery({
    queryKey: queryKeys.rules(pagination, filters),
    queryFn: () => fetchRules(pagination, filters),
    ...options,
  });
}

export function useRuleQuery(
  id: string | undefined,
  options?: QueryOptions<RuleDetail>
) {
  return useQuery({
    queryKey: queryKeys.rule(id!),
    queryFn: () => fetchRuleById(id!),
    enabled: !!id,
    ...options,
  });
}

// MITRE queries
export function useMitreMatrixQuery(
  platforms?: string[],
  options?: QueryOptions<MitreMatrixResponse>
) {
  return useQuery({
    queryKey: queryKeys.mitreMatrix(platforms),
    queryFn: () => fetchMitreMatrix(platforms),
    staleTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useMitreTechniquesQuery(
  pagination?: Partial<Pagination>,
  filters?: MitreFilters,
  options?: QueryOptions<MitreTechniquesResponse>
) {
  return useQuery({
    queryKey: queryKeys.mitreTechniques(pagination, filters),
    queryFn: () => fetchMitreTechniques(pagination, filters),
    ...options,
  });
}

export function useTechniqueDetailQuery(
  techniqueId: string | null,
  options?: QueryOptions<MitreTechniqueDetail>
) {
  return useQuery({
    queryKey: techniqueId ? queryKeys.mitreTechnique(techniqueId) : ['mitreTechnique', null],
    queryFn: () => techniqueId ? fetchTechniqueDetail(techniqueId) : Promise.reject(new Error('No technique ID')),
    enabled: !!techniqueId,
    ...options,
  });
}

// CVE queries
export function useCvesQuery(
  pagination?: Partial<Pagination>,
  filters?: CveFilters,
  options?: QueryOptions<CvesResponse>
) {
  return useQuery({
    queryKey: queryKeys.cves(pagination, filters),
    queryFn: () => fetchCves(pagination, filters),
    ...options,
  });
}

export function useCveQuery(
  id: string | undefined,
  options?: QueryOptions<CveDetail>
) {
  return useQuery({
    queryKey: queryKeys.cve(id!),
    queryFn: () => fetchCveById(id!),
    enabled: !!id,
    ...options,
  });
}

// Filters query
export function useFiltersQuery(
  options?: QueryOptions<FiltersResponse>
) {
  return useQuery({
    queryKey: queryKeys.filters,
    queryFn: fetchFilters,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Rule stats query
export function useRuleStatsQuery(
  options?: QueryOptions<any>
) {
  return useQuery({
    queryKey: ['ruleStats'],
    queryFn: async () => {
      const response = await fetch('/api/rules/stats');
      if (!response.ok) throw new Error('Failed to fetch rule stats');
      return response.json();
    },
    staleTime: 60 * 1000,
    ...options,
  });
}

// Technique coverage query  
export function useTechniqueCoverageQuery(
  options?: QueryOptions<any>
) {
  return useQuery({
    queryKey: ['techniqueCoverage'],
    queryFn: async () => {
      const response = await fetch('/api/mitre/coverage');
      if (!response.ok) throw new Error('Failed to fetch coverage');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}