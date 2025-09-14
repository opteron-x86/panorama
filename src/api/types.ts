// Pagination and Filtering
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RuleFilters {
  query?: string;
  rule_types?: string[];
  severities?: string[];
  rule_sources?: string[];
  tags?: string[];
  rule_platforms?: string[];
  mitre_techniques?: string[];
  cve_ids?: string[];
  siem_platforms?: string[];
  aors?: string[];
  data_sources?: string[];
  info_controls?: string[];
  has_mitre?: boolean;
  has_cves?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  enrichment_score_min?: number;
}

// Rule Types
export interface RuleSummary {
  id: number;
  rule_id: string;
  name: string;
  description: string;
  rule_type: string;
  severity: string;
  is_active: boolean;
  tags: string[];
  updated_date: string;
  source: {
    id: number;
    name: string;
  };
  extracted_mitre_count: number;
  extracted_cve_count: number;
}

export interface RuleDetail extends RuleSummary {
  rule_content: string;
  confidence_score?: number;
  false_positive_rate?: number;
  created_date: string;
  hash: string;
  source: {
    id: number;
    name: string;
    source_type: string;
  };
  mitre_techniques: MitreMapping[];
  cve_references: CveReference[];
  metadata: {
    info_controls?: string;
    siem_platform?: string;
    aor?: string;
    source_org?: string;
    data_sources?: string[];
    author?: string;
    modified_by?: string;
    hunt_id?: string;
    malware_family?: string;
    intrusion_set?: string;
    cwe_ids?: string[];
    validation?: Record<string, any>;
    references?: string[];
  };
  deprecated_technique_warnings?: DeprecationWarning[];
  has_deprecated_techniques?: boolean;
}

export interface MitreMapping {
  technique_id: string;
  name: string;
  description: string;
  tactic?: string;
  platforms: string[];
  mapping_confidence: number;
  is_deprecated: boolean;
  revoked: boolean;
  superseded_by?: string;
}

export interface CveReference {
  cve_id: string;
  description: string;
  severity: string;
  cvss_v3_score?: number;
  published_date: string;
}

export interface FetchRulesResponse {
  items: RuleSummary[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
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
  platforms: string[];
  kill_chain_phases: string[];
  data_sources: string[];
  is_subtechnique: boolean;
  parent_technique_id?: string;
  rule_count: number;
  is_deprecated: boolean;
  revoked: boolean;
  superseded_by?: string;
}

export interface MitreTactic {
  id: number;
  tactic_id: string;
  name: string;
  description: string;
  technique_count: number;
  covered_techniques: number;
  coverage_percentage: number;
}

export interface MitreMatrixTactic {
  id: number;
  tactic_id: string;
  name: string;
  description: string;
  technique_count: number;
  covered_count: number;
  coverage_percentage: number;
  techniques: {
    technique_id: string;
    name: string;
    description: string;
    platforms: string[];
    rule_count: number;
    is_covered: boolean;
    is_subtechnique: boolean;
    parent_technique_id?: string;
    is_deprecated?: boolean;
    superseded_by?: string;
  }[];
}

export interface MitreMatrixData {
  matrix: MitreMatrixTactic[];
  metadata: {
    total_tactics: number;
    total_techniques: number;
    covered_techniques: number;
    overall_coverage: number;
    platform_filter?: string[];
  };
}

export interface TechniquesCoverageResponse {
  total_techniques: number;
  covered_techniques: number;
  coverage_percentage: number;
  platform_filter_applied?: string[];
  coverage_by_tactic?: {
    tactic: string;
    tactic_id: string;
    total: number;
    covered: number;
    percentage: number;
  }[];
  coverage_gaps?: {
    technique_id: string;
    name: string;
    tactic: string;
    platforms: string[];
  }[];
  most_covered_techniques?: {
    technique_id: string;
    name: string;
    rule_count: number;
  }[];
}

// CVE Types
export interface CveData {
  id: number;
  cve_id: string;
  description: string;
  published_date?: string;
  modified_date?: string;
  severity: string;
  cvss_v3_score?: number;
  cvss_v3_vector?: string;
  cvss_v2_score?: number;
  cvss_v2_vector?: string;
  cwe_ids: string[];
  affected_products: any[];
  references: string[];
  source_identifier?: string;
  vulnerability_status?: string;
  associated_rules?: {
    rule_id: string;
    name: string;
    severity: string;
    rule_type: string;
    confidence_score: number;
    relationship_type: string;
  }[];
  rule_count: number;
}

export interface CveStats {
  total_cves: number;
  cves_with_rules: number;
  coverage_percentage: number;
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  cvss_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  recent_cves_30d: number;
  cves_by_year: Record<string, number>;
  top_cwes: {
    cwe_id: string;
    count: number;
  }[];
  top_affected_products: {
    product: string;
    cve_count: number;
  }[];
  metadata: {
    generated_at: string;
    filters_applied: {
      start_date?: string;
      end_date?: string;
    };
  };
}

// Filter Options
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptionsResponse {
  rule_sources: FilterOption[];
  rule_types: FilterOption[];
  severities: FilterOption[];
  tactics: FilterOption[];
  rule_platforms: FilterOption[];
  siem_platforms: FilterOption[];
  aors: FilterOption[];
  popular_tags: FilterOption[];
  cve_severities: FilterOption[];
  validation_statuses: FilterOption[];
  date_ranges: FilterOption[];
  enrichment_filters: FilterOption[];
  sort_options: FilterOption[];
}

// Analytics Types
export interface DashboardStats {
  total_rules: number;
  active_rules: number;
  rules_by_severity: Record<string, number>;
  rules_by_source: Record<string, number>;
  rules_by_type: Record<string, number>;
  enrichment_stats: {
    with_mitre: number;
    with_cve: number;
    with_both: number;
    no_enrichment: number;
  };
  recent_updates: number;
  coverage_metrics: {
    mitre_coverage: number;
    cve_coverage: number;
  };
}

export interface TrendData {
  period: string;
  data_points: {
    date: string;
    rules_added: number;
    rules_updated: number;
    rules_deprecated: number;
    enrichment_changes: number;
  }[];
}

// Export Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'yaml';
  include_content?: boolean;
  filters?: RuleFilters;
}

export interface ExportResponse {
  format: string;
  rules_count: number;
  data?: any;
  file_url?: string;
  download_url?: string;
}

// Statistics Types
export interface FetchRuleStatsResponse {
  total_rules: number;
  stats: {
    by_severity: Record<string, number>;
    by_source: Record<string, number>;
    by_type: Record<string, number>;
  };
  enrichment: {
    mitre_enriched: number;
    cve_enriched: number;
    both_enriched: number;
  };
  active_filters?: RuleFilters;
}

// Deprecation Types
export interface DeprecationWarning {
  technique_id: string;
  technique_name: string;
  reason: string;
  superseded_by?: string;
}

export interface DeprecationStatistics {
  total_deprecated_techniques: number;
  total_affected_rules: number;
  techniques_with_replacements: number;
  rules_needing_update: number;
  breakdown_by_tactic: Record<string, number>;
}

export interface AffectedRulesResponse {
  total_affected_rules: number;
  rules: {
    rule_id: string;
    name: string;
    deprecated_techniques: {
      technique_id: string;
      technique_name: string;
      is_deprecated: boolean;
      is_revoked: boolean;
      superseded_by?: string;
      mapping_confidence: number;
    }[];
  }[];
}

export interface RuleDeprecationCheck {
  rule_id: string;
  has_deprecated_techniques: boolean;
  deprecated_count: number;
  warnings: DeprecationWarning[];
}

export interface UpdateMappingsOptions {
  rule_ids?: string[];
  update_all?: boolean;
  auto_replace?: boolean;
}

export interface UpdateMappingsResponse {
  updated_count: number;
  failed_count: number;
  details: {
    rule_id: string;
    status: 'success' | 'failed';
    message?: string;
  }[];
}

// Search Types
export interface GlobalSearchResponse {
  query: string;
  rules: RuleSummary[];
  techniques: MitreTechnique[];
  cves: CveData[];
}

// Issue Types
export interface CreateIssuePayload {
  title: string;
  description: string;
  issueType: 'false_positive' | 'enhancement' | 'bug' | 'question';
  eventSource?: string;
  eventTimestamp?: string;
  submittedBy?: string;
}

export interface CreateIssueResponse {
  message: string;
  issue_url: string;
  rule_id: string;
}