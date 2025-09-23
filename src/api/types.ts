// Backend response types

export interface Rule {
  id: number;
  rule_id: string;
  name: string;
  description: string | null;
  severity: string;
  rule_type: string;
  tags: string[] | null;
  is_active: boolean;
  created_date: string | null;
  updated_date: string | null;
  source: string;
  mitre_techniques: string[];
  cves: string[];
}

export interface RuleDetail extends Rule {
  rule_content: string;
  confidence_score: number | null;
  mitre_details?: Array<{
    technique_id: string;
    name: string;
    tactic: string | null;
  }>;
  cve_details?: Array<{
    cve_id: string;
    severity: string;
    cvss_score: number | null;
  }>;
}

export interface RulesResponse {
  rules: Rule[];
  total: number;
  offset: number;
  limit: number;
  stats?: Record<string, any>;
}

export interface MitreTactic {
  tactic_id: string;
  name: string;
  techniques: Array<{
    technique_id: string;
    name: string;
    rule_count: number;
  }>;
  technique_count: number;
}

export interface MitreMatrixResponse {
  matrix: MitreTactic[];
}

export interface MitreTechnique {
  technique_id: string;
  name: string;
  tactic: string | null;
  platforms: string[];
  is_deprecated: boolean;
  superseded_by: string | null;
}

export interface MitreTechniquesResponse {
  techniques: MitreTechnique[];
  total: number;
}

export interface Cve {
  cve_id: string;
  description: string;
  severity: string;
  cvss_score: number | null;
  published_date: string | null;
}

export interface CveDetail extends Cve {
  cvss_v3_score: number | null;
  cvss_v3_vector: string | null;
  modified_date: string | null;
  cwe_ids: string[];
  rule_count: number;
}

export interface CvesResponse {
  cves: Cve[];
  total: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FiltersResponse {
  sources: FilterOption[];
  rule_types: FilterOption[];
  severities: string[];
  tactics: FilterOption[];
  platforms: string[];
}

// Request parameter types

export interface Pagination {
  offset: number;
  limit: number;
}

export interface RuleFilters {
  query?: string;
  rule_types?: string[];
  severities?: string[];
  source_ids?: string[];
  tags?: string[];
  is_active?: boolean;
  mitre_techniques?: string[];
  cve_ids?: string[];
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  include_stats?: boolean;
}

export interface MitreFilters {
  search?: string;
  include_deprecated?: boolean;
  platforms?: string[];
}

export interface CveFilters {
  query?: string;
  severities?: string[];
  days_back?: number;
}