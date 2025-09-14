import { ReactNode } from 'react';

export interface MetricDefinition {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export interface MetricsRowProps {
  metrics: MetricDefinition[];
  isLoading?: boolean;
  className?: string;
}
