import { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  isLoading?: boolean;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
  className?: string;
}
