export interface RuleSourceData {
  name: string;
  value: number;
  percentage?: number;
}

export interface TopRuleSourcesProps {
  data?: RuleSourceData[];
  isLoading?: boolean;
  height?: number;
  maxItems?: number;
  onSourceClick?: (source: string) => void;
  className?: string;
}