// src/api/index.ts

// Export all API client functions
export { apiGet, apiPost, apiPut, apiDelete } from './client';
import { fetchMitreTactics as _fetchMitreTactics } from './endpoints';
export const fetchMitreTactics = _fetchMitreTactics;
// Export all endpoint functions
export {
  // Rules
  fetchRules,
  fetchRuleById,
  fetchRuleStats,
  fetchRuleEnrichmentStats,
  exportRules,
  
  // MITRE
  fetchMitreMatrix,
  fetchMitreCoverage,
  fetchMitreTechniques,

  
  // CVE
  fetchCves,
  fetchCveById,
  fetchCveStats,
  
  // Filters
  fetchFilterOptions,
  
  // Analytics
  fetchDashboardData,
  fetchTrendData,
  
  // Deprecation
  fetchDeprecationStatistics,
  fetchAffectedRules,
  checkRuleDeprecation,
  updateDeprecatedMappings,
  
  // Search
  globalSearch,
} from './endpoints';

// Export all types
export type {
  // Pagination and Filtering
  PaginationParams,
  RuleFilters,
  
  // Rules
  RuleSummary,
  RuleDetail,
  BackendRuleSummary,
  MitreMapping,
  CveReference,
  FetchRulesResponse,
  
  // MITRE
  MitreTechnique,
  MitreTactic,
  MitreMatrixTactic,
  MitreMatrixData,
  TechniquesCoverageResponse,
  
  // CVE
  CveData,
  CveStats,
  
  // Filters
  FilterOption,
  FilterOptionsResponse,
  
  // Analytics
  DashboardStats,
  TrendData,
  
  // Export
  ExportOptions,
  ExportResponse,
  
  // Statistics
  FetchRuleStatsResponse,
  
  // Deprecation
  DeprecationWarning,
  DeprecationStatistics,
  AffectedRulesResponse,
  RuleDeprecationCheck,
  UpdateMappingsOptions,
  UpdateMappingsResponse,
  
  // Search
  GlobalSearchResponse,
} from './types';