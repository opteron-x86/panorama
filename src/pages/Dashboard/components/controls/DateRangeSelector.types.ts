export interface TimeRange {
  label: string;
  value: number;
}

export interface DateRangeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  timeRanges?: TimeRange[];
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}