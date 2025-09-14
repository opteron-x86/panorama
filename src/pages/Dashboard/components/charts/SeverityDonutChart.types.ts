export interface SeverityData {
  [key: string]: number;
}

export interface SeverityDonutChartProps {
  data: SeverityData | undefined;
  isLoading: boolean;
  height?: number;
  showTotal?: boolean;
  className?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}
