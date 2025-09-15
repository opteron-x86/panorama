// src/api/endpoints.ts

import { apiGet, apiPost } from './client';
import {
  RuleSummary,
  RuleDetail,
  BackendRuleSummary,
  FetchRulesResponse,
  PaginationParams,
  RuleFilters,
  TechniquesCoverageResponse,
  FetchRuleStatsResponse,
  FilterOptionsResponse,
  MitreMatrixData,
  MitreTechnique,
  MitreTactic,
  DashboardStats,
  TrendData,
  ExportOptions,
  ExportResponse,
  GlobalSearchResponse,
  CveData,
  CveStats,
  AffectedRulesResponse,
  RuleDeprecationCheck,
  UpdateMappingsOptions,
  UpdateMappingsResponse,
  DeprecationStatistics,
} from './types';

// Base endpoint paths
const ENDPOINTS = {
  // Core rules endpoints
  RULES: '/rules',
  RULE_BY_ID: (id: string) => `/rules/${id}`,
  RULES_STATS: '/rules/stats',
  RULES_ENRICHMENT: '/rules/enrichment',
  RULES_EXPORT: '/rules/export',
  
  // MITRE ATT&CK endpoints
  MITRE_MATRIX: '/mitre/matrix',
  MITRE_COVERAGE: '/mitre/coverage',
  MITRE_TECHNIQUES: '/mitre/techniques',
  MITRE_TACTICS: '/mitre/tactics',
  
  // Deprecation management endpoints
  DEPRECATED_STATISTICS: '/deprecated/statistics',
  DEPRECATED_AFFECTED_RULES: '/deprecated/affected-rules',
  DEPRECATED_CHECK_RULE: '/deprecated/check-rule',
  DEPRECATED_UPDATE_MAPPINGS: '/deprecated/update-mappings',

  // CVE endpoints
  CVES: '/cves',
  CVE_BY_ID: (id: string) => `/cves/${id}`,
  CVE_STATS: '/cves/stats',
  
  // Filter and search endpoints
  FILTERS_OPTIONS: '/filters/options',
  GLOBAL_SEARCH: '/search',
  
  // Analytics and dashboard endpoints
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_TRENDS: '/analytics/trends',
};

/**
 * Build query parameters for Lambda API
 */
const buildQueryParams = (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Record<string, any> => {
  const params: Record<string, any> = {};
  
  // Pagination
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
    
    if (pagination.sortBy) {
      // Map frontend field names to backend field names
      const sortByMapping: Record<string, string> = {
        'modified_date': 'updated_date',
        'title': 'name',
        'source_rule_id': 'rule_id',
      };
      params.sort_by = sortByMapping[pagination.sortBy] || pagination.sortBy;
    }
    if (pagination.sortDirection) {
      params.sort_dir = pagination.sortDirection;
    }
  }
  
  // Filters - normalize to backend expected format
  if (filters) {
    // Search query
    if (filters.query || filters.search) {
      params.query = filters.query || filters.search;
    }
    
    // Rule sources - backend expects plural
    if (filters.rule_sources && filters.rule_sources.length > 0) {
      params.rule_sources = filters.rule_sources.join(',');
    } else if (filters.rule_source && filters.rule_source.length > 0) {
      params.rule_sources = filters.rule_source.join(',');
    }
    
    // Severities - backend expects plural
    if (filters.severities && filters.severities.length > 0) {
      params.severities = filters.severities.join(',');
    } else if (filters.severity && filters.severity.length > 0) {
      params.severities = filters.severity.join(',');
    }
    
    // Platforms
    if (filters.platforms && filters.platforms.length > 0) {
      params.platforms = filters.platforms.join(',');
    }
    
    // Tactics
    if (filters.tactics && filters.tactics.length > 0) {
      params.tactics = filters.tactics.join(',');
    }
    
    // Rule platforms
    if (filters.rule_platforms && filters.rule_platforms.length > 0) {
      params.rule_platforms = filters.rule_platforms.join(',');
    }
    
    // Rule types
    if (filters.rule_types && filters.rule_types.length > 0) {
      params.rule_types = filters.rule_types.join(',');
    }
    
    // MITRE techniques
    if (filters.mitre_techniques && filters.mitre_techniques.length > 0) {
      params.mitre_techniques = filters.mitre_techniques.join(',');
    }
    
    // CVE IDs
    if (filters.cve_ids && filters.cve_ids.length > 0) {
      params.cve_ids = filters.cve_ids.join(',');
    }
    
    // Tags
    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags.join(',');
    }
    
    // Boolean filters
    if (filters.has_mitre !== undefined) {
      params.has_mitre = filters.has_mitre;
    } else if (filters.has_mitre_mapping !== undefined) {
      params.has_mitre = filters.has_mitre_mapping;
    }
    
    if (filters.has_cves !== undefined) {
      params.has_cves = filters.has_cves;
    } else if (filters.has_cve_references !== undefined) {
      params.has_cves = filters.has_cve_references;
    }
    
    if (filters.is_active !== undefined) {
      params.is_active = filters.is_active;
    }
    
    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.start) params.start_date = filters.dateRange.start;
      if (filters.dateRange.end) params.end_date = filters.dateRange.end;
    } else {
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
    }
    
    // Enrichment score
    if (filters.enrichment_score_min !== undefined) {
      params.enrichment_score_min = filters.enrichment_score_min;
    }
  }
  
  return params;
};

/**
 * Transform backend rule to frontend format
 */
const transformBackendRule = (rule: BackendRuleSummary): RuleSummary => {
  // Extract technique IDs
  let linkedTechniqueIds: string[] = [];
  if (rule.linked_technique_ids) {
    linkedTechniqueIds = rule.linked_technique_ids;
  } else if (rule.mitre_techniques) {
    if (Array.isArray(rule.mitre_techniques)) {
      linkedTechniqueIds = rule.mitre_techniques
        .map(t => typeof t === 'string' ? t : t.technique_id)
        .filter(Boolean);
    }
  }
  
  return {
    // Core fields
    id: rule.id,
    source_rule_id: rule.rule_id,
    title: rule.name,
    description: rule.description,
    rule_type: rule.rule_type,
    severity: rule.severity,
    status: rule.is_active ? 'active' : 'inactive',
    tags: rule.tags || [],
    modified_date: rule.updated_date,
    created_date: rule.created_date,
    
    // Source info
    rule_source: rule.rule_source || rule.source?.name || 'Unknown',
    source: rule.source,
    
    // Enrichment data
    has_mitre_mapping: rule.has_mitre ?? (linkedTechniqueIds.length > 0),
    has_cve_references: rule.has_cves ?? false,
    extracted_mitre_count: rule.extracted_mitre_count ?? linkedTechniqueIds.length,
    extracted_cve_count: rule.extracted_cve_count ?? 0,
    enrichment_score: rule.enrichment_score ?? 0,
    linked_technique_ids: linkedTechniqueIds,
    
    // Platform data
    rule_platforms: rule.rule_platforms || rule.platforms || [],
    platforms: rule.platforms,
  };
};

/**
 * Transform backend rule detail to frontend format
 */
const transformBackendRuleDetail = (response: any): RuleDetail => {
  const baseRule = transformBackendRule(response);
  
  return {
    ...baseRule,
    
    // Extended content
    rule_content: response.rule_content,
    raw_rule: response.raw_rule,
    confidence_score: response.confidence_score,
    false_positive_rate: response.false_positive_rate,
    hash: response.hash,
    
    // Enrichment details
    mitre_techniques: response.mitre_techniques,
    cve_references: response.cve_references || response.cves,
    cves: response.cves || response.cve_references,
    
    // Metadata
    author: response.author,
    source_file_path: response.source_file_path,
    siem_platform: response.siem_platform || response.rule_metadata?.siem_platform,
    aor: response.aor || response.rule_metadata?.aor,
    source_org: response.source_org || response.rule_metadata?.source_org,
    data_sources: response.data_sources || response.rule_metadata?.data_sources,
    info_controls: response.info_controls || response.rule_metadata?.info_controls,
    modified_by: response.modified_by || response.rule_metadata?.modified_by,
    hunt_id: response.hunt_id || response.rule_metadata?.hunt_id,
    malware_family: response.malware_family || response.rule_metadata?.malware_family,
    intrusion_set: response.intrusion_set || response.rule_metadata?.intrusion_set,
    cwe_ids: response.cwe_ids || response.rule_metadata?.cwe_ids,
    validation: response.validation || response.rule_metadata?.validation,
    
    // Platform-specific details
    elastic_details: response.elastic_details,
    sentinel_details: response.sentinel_details,
    trinitycyber_details: response.trinitycyber_details,
    
    // Relationships
    related_rules: response.related_rules,
    rule_metadata: response.rule_metadata,
    
    // Deprecation info
    deprecated_technique_warnings: response.deprecated_technique_warnings,
    has_deprecated_techniques: response.has_deprecated_techniques,
    
    // Legacy fields
    is_active: response.is_active,
  };
};

// --- RULES ENDPOINTS ---

/**
 * Fetch rules with pagination and filters
 */
export const fetchRules = async (
  pagination?: PaginationParams,
  filters?: RuleFilters
): Promise<FetchRulesResponse> => {
  const params = buildQueryParams(pagination, filters);
  const response = await apiGet<any>(ENDPOINTS.RULES, params);
  
  // Transform backend rules to frontend format
  const rulesArray: BackendRuleSummary[] = response.items || [];
  const transformedRules = rulesArray.map(transformBackendRule);
  
  const total = response.total || 0;
  const limit = response.limit || params.limit || 25;
  const offset = response.offset || 0;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    rules: transformedRules,
    items: transformedRules, // Backward compatibility
    total,
    offset,
    limit,
    page,
    totalPages,
    has_more: response.has_more ?? (page < totalPages),
    facets: response.facets,
  };
};

/**
 * Fetch rule by ID
 */
export const fetchRuleById = async (id: string): Promise<RuleDetail> => {
  const response = await apiGet<any>(ENDPOINTS.RULE_BY_ID(id));
  return transformBackendRuleDetail(response);
};

/**
 * Fetch rule statistics
 */
export const fetchRuleStats = async (
  filters?: RuleFilters
): Promise<FetchRuleStatsResponse> => {
  const params = filters ? buildQueryParams(undefined, filters) : {};
  const response = await apiGet<any>(ENDPOINTS.RULES_STATS, params);
  
  return {
    total_rules: response.total_rules || 0,
    active_rules: response.active_rules || response.total_rules || 0,
    inactive_rules: response.inactive_rules || 0,
    active_filters: response.active_filters,
    stats: {
      by_severity: response.stats?.by_severity || {},
      by_platform: response.stats?.by_platform || response.stats?.by_rule_platform || {},
      by_rule_source: response.stats?.by_rule_source || {},
      by_rule_platform: response.stats?.by_rule_platform || {},
      by_mitre_coverage: response.stats?.by_mitre_coverage || {},
      by_cve_coverage: response.stats?.by_cve_coverage || {},
      by_enrichment_quality: response.stats?.by_enrichment_quality || {},
    },
    enrichment_stats: {
      rules_with_mitre: response.enrichment?.rules_with_mitre || response.enrichment?.mitre?.total_enriched || 0,
      rules_with_cves: response.enrichment?.rules_with_cves || response.enrichment?.cve?.total_enriched || 0,
      average_enrichment_score: response.enrichment?.average_enrichment_score || 0,
      total_mitre_techniques_covered: response.enrichment?.total_mitre_techniques_covered || 0,
      total_cves_referenced: response.enrichment?.total_cves_referenced || 0,
    },
  };
};

/**
 * Fetch rule enrichment statistics
 */
export const fetchRuleEnrichmentStats = async (): Promise<Record<string, unknown>> => {
  const response = await apiGet<any>(ENDPOINTS.RULES_ENRICHMENT);
  return response;
};

/**
 * Export rules
 */
export const exportRules = async (options: ExportOptions): Promise<ExportResponse> => {
  const payload = {
    format: options.format,
    include_enrichments: options.include_enrichments ?? true,
    include_metadata: options.include_metadata ?? true,
    filters: options.filters ? buildQueryParams(undefined, options.filters) : undefined,
  };
  
  const response = await apiPost<any>(ENDPOINTS.RULES_EXPORT, payload);
  
  return {
    export_url: response.export_url,
    export_data: response.export_data,
    export_format: response.export_format || options.format,
    total_rules: response.total_rules || 0,
    export_timestamp: response.export_timestamp || new Date().toISOString(),
  };
};

// --- MITRE ATT&CK ENDPOINTS ---

/**
 * Fetch MITRE ATT&CK matrix
 */
export const fetchMitreMatrix = async (): Promise<MitreMatrixData> => {
  const response = await apiGet<any>(ENDPOINTS.MITRE_MATRIX);
  return response;
};

/**
 * Fetch MITRE coverage statistics
 */
export const fetchMitreCoverage = async (): Promise<TechniquesCoverageResponse> => {
  const response = await apiGet<any>(ENDPOINTS.MITRE_COVERAGE);
  return response;
};

/**
 * Fetch MITRE techniques
 */
export const fetchMitreTechniques = async (
  pagination?: PaginationParams,
  search?: string
): Promise<{ techniques: MitreTechnique[]; total: number }> => {
  const params: Record<string, any> = {};
  
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  if (search) {
    params.query = search;
  }
  
  const response = await apiGet<any>(ENDPOINTS.MITRE_TECHNIQUES, params);
  
  return {
    techniques: response.techniques || response.items || [],
    total: response.total || 0,
  };
};

/**
 * Fetch MITRE tactics
 */
export const fetchMitreTactics = async (): Promise<MitreTactic[]> => {
  const response = await apiGet<any>(ENDPOINTS.MITRE_TACTICS);
  return response.tactics || response.items || response;
};

// --- CVE ENDPOINTS ---

/**
 * Fetch CVEs
 */
export const fetchCves = async (
  pagination: PaginationParams,
  filters?: { severities?: string[]; with_rules_only?: boolean; query?: string }
): Promise<{ cves: CveData[]; total: number }> => {
  const params: Record<string, any> = {
    offset: (pagination.page - 1) * pagination.limit,
    limit: pagination.limit,
  };
  
  if (filters) {
    if (filters.severities?.length) {
      params.severities = filters.severities.join(',');
    }
    if (filters.with_rules_only !== undefined) {
      params.with_rules_only = filters.with_rules_only;
    }
    if (filters.query) {
      params.query = filters.query;
    }
  }
  
  const response = await apiGet<any>(ENDPOINTS.CVES, params);
  
  return {
    cves: response.items || response.cves || [],
    total: response.total || 0,
  };
};

/**
 * Fetch CVE by ID
 */
export const fetchCveById = async (id: string): Promise<CveData> => {
  const response = await apiGet<any>(ENDPOINTS.CVE_BY_ID(id));
  return response;
};

/**
 * Fetch CVE statistics
 */
export const fetchCveStats = async (): Promise<CveStats> => {
  const response = await apiGet<any>(ENDPOINTS.CVE_STATS);
  return response;
};

// --- FILTER ENDPOINTS ---

/**
 * Fetch filter options
 */
export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await apiGet<any>(ENDPOINTS.FILTERS_OPTIONS);
  return response;
};

// --- ANALYTICS ENDPOINTS ---

/**
 * Fetch dashboard data
 */
export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const response = await apiGet<DashboardResponse>('/analytics/dashboard');
  return response;
};

/**
 * Fetch trend data
 */
export const fetchTrendData = async (
  startDate: string,
  endDate: string,
  granularity: 'day' | 'week' | 'month' = 'day'
): Promise<TrendData[]> => {
  const params = {
    start_date: startDate,
    end_date: endDate,
    granularity,
  };
  
  const response = await apiGet<any>(ENDPOINTS.ANALYTICS_TRENDS, params);
  return response.trends || response.items || [];
};

// --- DEPRECATION ENDPOINTS ---

/**
 * Fetch deprecation statistics
 */
export const fetchDeprecationStatistics = async (): Promise<DeprecationStatistics> => {
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_STATISTICS);
  return response;
};

/**
 * Fetch affected rules
 */
export const fetchAffectedRules = async (
  techniqueId?: string
): Promise<AffectedRulesResponse> => {
  const params = techniqueId ? { technique_id: techniqueId } : {};
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_AFFECTED_RULES, params);
  
  // Transform backend rules to frontend format
  const rulesArray: BackendRuleSummary[] = response.rules || response.items || [];
  const transformedRules = rulesArray.map(transformBackendRule);
  
  return {
    rules: transformedRules,
    total: response.total || transformedRules.length,
    by_technique: response.by_technique || {},
  };
};

/**
 * Check rule for deprecation
 */
export const checkRuleDeprecation = async (ruleId: string): Promise<RuleDeprecationCheck> => {
  const response = await apiGet<any>(ENDPOINTS.DEPRECATED_CHECK_RULE, { rule_id: ruleId });
  return response;
};

/**
 * Update deprecated mappings
 */
export const updateDeprecatedMappings = async (
  options: UpdateMappingsOptions
): Promise<UpdateMappingsResponse> => {
  const response = await apiPost<any>(ENDPOINTS.DEPRECATED_UPDATE_MAPPINGS, options);
  return response;
};

// --- SEARCH ENDPOINTS ---

/**
 * Global search
 */
export const globalSearch = async (
  query: string,
  pagination?: PaginationParams,
  types?: string[]
): Promise<GlobalSearchResponse> => {
  const params: Record<string, any> = { query };
  
  if (pagination) {
    params.offset = (pagination.page - 1) * pagination.limit;
    params.limit = pagination.limit;
  }
  
  if (types?.length) {
    params.types = types.join(',');
  }
  
  const response = await apiGet<any>(ENDPOINTS.GLOBAL_SEARCH, params);
  
  // Transform rules if present
  if (response.rules?.length) {
    const transformedRules = response.rules.map(transformBackendRule);
    response.rules = transformedRules;
  }
  
  return {
    rules: response.rules,
    techniques: response.techniques,
    cves: response.cves,
    total_results: response.total_results || 0,
    search_query: query,
  };
};