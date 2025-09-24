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

// Health check
export function useHealthQuery(options?: UseQueryOptions<{ status: string }, Error>) {
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
  options?: UseQueryOptions<RulesResponse, Error>
) {
  return useQuery({
    queryKey: queryKeys.rules(pagination, filters),
    queryFn: () => fetchRules(pagination, filters),
    ...options,
  });
}

export function useRuleQuery(
  id: string | undefined,
  options?: UseQueryOptions<RuleDetail, Error>
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
  options?: UseQueryOptions<MitreMatrixResponse, Error>
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
  options?: UseQueryOptions<MitreTechniquesResponse, Error>
) {
  return useQuery({
    queryKey: queryKeys.mitreTechniques(pagination, filters),
    queryFn: () => fetchMitreTechniques(pagination, filters),
    ...options,
  });
}

export function useTechniqueDetailQuery(
  techniqueId: string | null,
  options?: UseQueryOptions<MitreTechniqueDetail, Error>
) {
  return useQuery({
    queryKey: techniqueId ? queryKeys.mitreTechnique(techniqueId) : ['mitreTechnique', null],
    queryFn: () => techniqueId ? fetchTechniqueDetail(techniqueId) : Promise.reject('No technique ID'),
    enabled: !!techniqueId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// CVE queries
export function useCvesQuery(
  pagination?: Partial<Pagination>,
  filters?: CveFilters,
  options?: UseQueryOptions<CvesResponse, Error>
) {
  return useQuery({
    queryKey: queryKeys.cves(pagination, filters),
    queryFn: () => fetchCves(pagination, filters),
    ...options,
  });
}

export function useCveQuery(
  id: string | undefined,
  options?: UseQueryOptions<CveDetail, Error>
) {
  return useQuery({
    queryKey: queryKeys.cve(id!),
    queryFn: () => fetchCveById(id!),
    enabled: !!id,
    ...options,
  });
}

// Filters query
export function useFiltersQuery(options?: UseQueryOptions<FiltersResponse, Error>) {
  return useQuery({
    queryKey: queryKeys.filters,
    queryFn: fetchFilters,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    ...options,
  });
}