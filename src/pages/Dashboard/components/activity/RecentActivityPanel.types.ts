import { ReactNode } from 'react';

export interface RecentActivityPanelProps {
  className?: string;
  maxItems?: number;
  onViewMore?: () => void;
}

export interface ActivityItem {
  id: string;
  title: string;
  severity: string;
  modified_date: string | null;
  icon?: ReactNode;
}