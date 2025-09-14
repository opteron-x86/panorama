export interface DailyStat {
  date: string;
  rules_created: number;
  rules_updated: number;
  rules_deleted?: number;
}

export interface TrendSummary {
  total_created: number;
  total_updated: number;
  total_deleted?: number;      // optional
  average_per_day?: number;     // optional
  most_active_day: string | null;
}

export interface TrendData {
  daily_stats: DailyStat[];
  summary: TrendSummary;
}

export interface ActivityTrendProps {
  data?: TrendData;
  isLoading?: boolean;
  daysBack: number;
  height?: number;
  className?: string;
}
