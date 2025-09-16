// src/api/types.ts
// Pagination and Filtering
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  include_facets?: boolean;
}

export interface RuleFilters {
  query?: string;
  search?: string;
  rule_types?: string[];
  severities?: string[];
  severity?: string[];
  rule_sources?: string[];
  rule_source?: string[];
  tags?: string[];
  rule_platforms?: string[];
  platforms?: string[];
  tactics?: string[];
  mitre_techniques?: string[];
  cve_ids?: string[];
  siem_platforms?: string[];
  aors?: string[];
  data_sources?: string[];
  info_controls?: string[];
  has_mitre?: boolean;
  has_mitre_mapping?: boolean;
  has_cves?: boolean;
  has_cve_references?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  enrichment_score_min?: number;
  validation_status?: string[];
}

// Backend Rule Response (what API actually returns)
export interface BackendRuleSummary {
  id: number;
  rule_id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: string;
  is_active: boolean;
  tags: string[];
  updated_date: string;
  created_date?: string;
  source: {
    id: number;
    name: string;
  };
  rule_source?: string;
  extracted_mitre_count?: number;
  extracted_cve_count?: number;
  has_mitre?: boolean;
  has_cves?: boolean;
  enrichment_score?: number;
  rule_platforms?: string[];
  platforms?: string[];
  mitre_techniques?: string[] | MitreMapping[];
  linked_technique_ids?: string[];
}

// Frontend Rule Types (transformed for UI consumption)
export interface RuleSummary {
  // Core fields
  id: number;
  source_rule_id: string;
  title: string;
  description: string;
  rule_type: string;
  severity: string;
  status: 'active' | 'inactive' | string;
  tags: string[];
  modified_date: string;
  created_date?: string;
  
  // Source info
  rule_source: string;
  source?: {
    id: number;
    name: string;
  };
  
  // Enrichment data
  has_mitre_mapping: boolean;
  has_cve_references: boolean;
  extracted_mitre_count: number;
  extracted_cve_count: number;
  enrichment_score: number;
  linked_technique_ids: string[];
  
  // Platform data
  rule_platforms: string[];
  platforms?: string[];
}

export interface RuleDetail extends RuleSummary {
  // Extended content
  rule_content?: string;
  raw_rule?: any;
  confidence_score?: number;
  false_positive_rate?: number;
  hash?: string;
  
  // Enrichment details
  mitre_techniques?: MitreMapping[];
  cve_references?: CveReference[];
  cves?: CveReference[];
  
  // Metadata
  author?: string;
  updated_date?: string;
  source_file_path?: string;
  siem_platform?: string;
  aor?: string;
  source_org?: string;
  data_sources?: string[];
  info_controls?: string;
  modified_by?: string;
  hunt_id?: string;
  malware_family?: string;
  intrusion_set?: string;
  cwe_ids?: string[];
  validation?: Record<string, any>;
  
  // Platform-specific details
  elastic_details?: any;
  sentinel_details?: any;
  trinitycyber_details?: any;
  
  // Relationships
  related_rules?: any[];
  rule_metadata?: Record<string, any>;
  
  // Deprecation info
  deprecated_technique_warnings?: DeprecationWarning[];
  has_deprecated_techniques?: boolean;
  
  // Legacy/compatibility fields
  is_active?: boolean;
}

export interface MitreMapping {
  technique_id: string;
  name: string;
  description?: string;
  tactic?: string;
  platforms?: string[];
  mapping_confidence?: number;
  is_deprecated?: boolean;
  revoked?: boolean;
  superseded_by?: string;
}

export interface CveReference {
  cve_id: string;
  description?: string;
  severity?: string;
  cvss_v3_score?: number;
  published_date?: string;
}

export interface FetchRulesResponse {
  rules: RuleSummary[];
  items: RuleSummary[]; // Alias for backward compatibility
  total: number;
  offset: number;
  limit: number;
  page?: number;
  totalPages?: number;
  has_more?: boolean;
  facets?: any;
}

// MITRE Types
export interface MitreTechnique {
  technique_id: string;
  name: string;
  description: string;
  tactic?: {
    id: number;
    tactic_id: string;
    name: string;
  };
  platforms?: string[];
  kill_chain_phases?: string[];
  data_sources?: string[];
  is_subtechnique?: boolean;
  parent_technique_id?: string;
  rule_count?: number;
  is_deprecated?: boolean;
  revoked?: boolean;
  superseded_by?: string;
}

export interface MitreTactic {
  tactic_id: string;
  name: string;
  description: string;
  shortname?: string;
  techniques?: MitreTechnique[];
  technique_count?: number;
}

export interface MitreMatrixTactic {
  tactic: MitreTactic;
  techniques: MitreTechnique[];
}

export interface MitreMatrixData {
  tactics: MitreMatrixTactic[];
  total_tactics: number;
  total_techniques: number;
  total_subtechniques: number;
  coverage_stats?: {
    covered_techniques: number;
    total_rules_mapped: number;
  };
}

export interface TechniquesCoverageResponse {
  techniques: MitreTechnique[];
  total: number;
  covered: number;
  coverage_percentage: number;
}

// CVE Types
export interface CveData {
  id: number;
  cve_id: string;
  description: string;
  severity: string;
  cvss_v3_score?: number;
  published_date: string;
  rule_count?: number;
  associated_rules?: RuleSummary[];
}

export interface CveStats {
  total_cves: number;
  by_severity: Record<string, number>;
  recent_cves: CveData[];
  high_impact_cves: CveData[];
}

// Filter Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptionsResponse {
  rule_sources?: FilterOption[];
  rule_types?: FilterOption[];
  severities?: FilterOption[];
  tactics?: FilterOption[];
  platforms?: FilterOption[];
  rule_platforms?: FilterOption[];
  validation_statuses?: FilterOption[];
  popular_tags?: FilterOption[];
  cve_severities?: FilterOption[];
  date_ranges?: FilterOption[];
}

// Analytics Types
export interface DashboardResponse {
  metrics: {
    total_rules: number;
    active_rules: number;
    inactive_rules: number;
    rules_with_mitre: number;
    rules_with_cves: number;
    rules_with_both: number;
  };
  distributions: {
    by_severity: Record<string, number>;
    by_platform: Record<string, number>;
    by_source: Record<string, number>;
  };
  coverage: {
    total_techniques: number;
    covered_techniques: number;
    coverage_percentage: number;
  };
  trends: {
    daily_activity: Array<{
      date: string;
      rules_created: number;
      rules_updated: number;
    }>;
  };
}

export interface DashboardStats {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  rules_with_mitre: number;
  rules_with_cves: number;
  average_confidence_score: number;
  recent_updates: RuleSummary[];
  top_sources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  severity_distribution: Record<string, number>;
  platform_coverage: Record<string, number>;
}

export interface TrendData {
  date: string;
  total_rules: number;
  active_rules: number;
  new_rules: number;
  updated_rules: number;
  mitre_coverage: number;
  cve_coverage: number;
}

// Export Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'yaml';
  include_enrichments?: boolean;
  include_metadata?: boolean;
  filters?: RuleFilters;
}

export interface ExportResponse {
  export_url?: string;
  export_data?: any;
  export_format: string;
  total_rules: number;
  export_timestamp: string;
}

// Statistics Types
export interface FetchRuleStatsResponse {
  total_rules: number;
  active_rules: number;
  inactive_rules: number;
  active_filters?: any;
  stats: {
    by_severity?: Record<string, number>;
    by_platform?: Record<string, number>;
    by_rule_source?: Record<string, number>;
    by_rule_platform?: Record<string, number>;
    by_mitre_coverage?: Record<string, number>;
    by_cve_coverage?: Record<string, number>;
    by_enrichment_quality?: Record<string, number>;
  };
  enrichment_stats: {
    rules_with_mitre: number;
    rules_with_cves: number;
    average_enrichment_score: number;
    total_mitre_techniques_covered: number;
    total_cves_referenced: number;
  };
}

// Deprecation Types
export interface DeprecationWarning {
  technique_id: string;
  technique_name: string;
  deprecation_reason: string;
  superseded_by?: string;
  recommendation: string;
  revoked?: boolean;
}

export interface DeprecationStatistics {
  total_deprecated_techniques: number;
  total_affected_rules: number;
  deprecated_techniques: Array<{
    technique_id: string;
    name: string;
    affected_rule_count: number;
    superseded_by?: string;
  }>;
  severity_breakdown: Record<string, number>;
}

export interface AffectedRulesResponse {
  rules: RuleSummary[];
  total: number;
  by_technique: Record<string, string[]>;
}

export interface RuleDeprecationCheck {
  rule_id: string;
  has_deprecated: boolean;
  deprecated_techniques: DeprecationWarning[];
  recommendations: string[];
}

export interface UpdateMappingsOptions {
  rule_ids?: string[];
  auto_update?: boolean;
  dry_run?: boolean;
}

export interface UpdateMappingsResponse {
  updated_count: number;
  failed_count: number;
  updated_rules: string[];
  failed_rules: Array<{
    rule_id: string;
    error: string;
  }>;
  dry_run: boolean;
}

// Search Types
export interface GlobalSearchResponse {
  rules?: RuleSummary[];
  techniques?: MitreTechnique[];
  cves?: CveData[];
  total_results: number;
  search_query: string;
}