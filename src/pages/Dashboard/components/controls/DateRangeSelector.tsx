import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import { 
  DateRangeSelectorProps, 
  TimeRange 
} from './DateRangeSelector.types';

const DEFAULT_TIME_RANGES: TimeRange[] = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year', value: 365 },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  timeRanges = DEFAULT_TIME_RANGES,
  disabled = false,
  size = 'small',
  className,
}) => {
  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl 
      size={size} 
      sx={{ minWidth: 120 }}
      className={className}
      disabled={disabled}
    >
      <InputLabel id="time-range-label">Time Range</InputLabel>
      <Select
        labelId="time-range-label"
        value={value}
        label="Time Range"
        onChange={handleChange}
      >
        {timeRanges.map(range => (
          <MenuItem key={range.value} value={range.value}>
            {range.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};