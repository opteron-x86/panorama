// src/api/utils.ts
import { Rule, RuleDetail, RuleFilters } from './types';

export function isRuleDetail(rule: Rule | RuleDetail): rule is RuleDetail {
  return 'rule_content' in rule;
}

export function getSeverityColor(severity: string | null | undefined): string {
  if (!severity) {
    return '#6b7280';
  }
  
  const colors: Record<string, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#3b82f6',
    info: '#8b5cf6',
  };
  return colors[severity.toLowerCase()] ?? '#6b7280';
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(dateString: string | null): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function buildFilterChips(filters: RuleFilters): Array<{ key: string; label: string; value: any }> {
  const chips: Array<{ key: string; label: string; value: any }> = [];
  
  if (filters.query) {
    chips.push({ key: 'query', label: `Search: ${filters.query}`, value: filters.query });
  }
  
  if (filters.severities?.length) {
    filters.severities.forEach((severity: string) => {
      chips.push({ key: 'severity', label: severity, value: severity });
    });
  }
  
  if (filters.rule_types?.length) {
    filters.rule_types.forEach((type: string) => {
      chips.push({ key: 'rule_type', label: type, value: type });
    });
  }
  
  if (filters.tags?.length) {
    filters.tags.forEach((tag: string) => {
      chips.push({ key: 'tag', label: tag, value: tag });
    });
  }
  
  if (filters.is_active !== undefined) {
    chips.push({ 
      key: 'is_active', 
      label: filters.is_active ? 'Active' : 'Inactive', 
      value: filters.is_active 
    });
  }
  
  return chips;
}