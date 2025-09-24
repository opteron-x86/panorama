import { apiGet } from './client';
import {
  Rule,
  RuleDetail,
  RulesResponse,
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

// Build query parameters
function buildParams(
  pagination?: Partial<Pagination>,
  filters?: Record<string, any>
): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Add pagination
  if (pagination) {
    if (pagination.offset !== undefined) params.offset = pagination.offset;
    if (pagination.limit !== undefined) params.limit = pagination.limit;
  }
  
  // Add filters - INCLUDING query
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      } else if (value !== '') {
        params[key] = value;  // This handles query string
      }
    });
  }
  
  console.log('API params:', params); // Debug log
  return params;
}

// Rules endpoints
export async function fetchRules(
  pagination?: Partial<Pagination>,
  filters?: RuleFilters
): Promise<RulesResponse> {
  return apiGet<RulesResponse>('/rules', buildParams(pagination, filters));
}

export async function fetchRuleById(id: string): Promise<RuleDetail> {
  return apiGet<RuleDetail>(`/rules/${id}`);
}

// MITRE endpoints
export async function fetchMitreMatrix(platforms?: string[]): Promise<MitreMatrixResponse> {
  const params = platforms?.length ? { platforms: platforms.join(',') } : undefined;
  return apiGet<MitreMatrixResponse>('/mitre/matrix', params);
}

export async function fetchMitreTechniques(
  pagination?: Partial<Pagination>,
  filters?: MitreFilters
): Promise<MitreTechniquesResponse> {
  return apiGet<MitreTechniquesResponse>('/mitre/techniques', buildParams(pagination, filters));
}

export async function fetchTechniqueDetail(techniqueId: string): Promise<MitreTechniqueDetail> {
  return apiGet<MitreTechniqueDetail>(`/mitre/techniques/${techniqueId}`);
}

// CVE endpoints
export async function fetchCves(
  pagination?: Partial<Pagination>,
  filters?: CveFilters
): Promise<CvesResponse> {
  return apiGet<CvesResponse>('/cves', buildParams(pagination, filters));
}

export async function fetchCveById(id: string): Promise<CveDetail> {
  return apiGet<CveDetail>(`/cves/${id}`);
}

// Filter endpoint
export async function fetchFilters(): Promise<FiltersResponse> {
  return apiGet<FiltersResponse>('/filters');
}

// Health check
export async function checkHealth(): Promise<{ status: string }> {
  return apiGet<{ status: string }>('/health');
}