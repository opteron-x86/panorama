import { ReactNode } from 'react';

export interface BreakdownCardProps {
  title: string;
  data: Record<string, number> | undefined;
  isLoading?: boolean;
  colorMap?: Record<string, string>;
  icon?: ReactNode;
  onItemClick?: (item: string) => void;
  valueFormatter?: (key: string) => string;
  showPercentages?: boolean;
  maxItems?: number;
  className?: string;
}

export interface BreakdownItem {
  key: string;
  value: number;
  percentage: number;
  color: string;
  displayName: string;
}
