import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { SEVERITY_DISPLAY, SEVERITY_COLORS } from '@/utils/constants';
import { RuleSeverity } from '@/api/types';
import { 
  SeverityDonutChartProps, 
  ChartDataPoint 
} from './SeverityDonutChart.types';

export const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({ 
  data, 
  isLoading,
  height = 300,
  showTotal = true,
  className
}) => {
  const theme = useTheme();

  const chartData = useMemo((): ChartDataPoint[] => {
    if (!data) return [];
    
    const severityOrder: (keyof typeof SEVERITY_DISPLAY)[] = [
      'critical', 
      'high', 
      'medium', 
      'low', 
      'unknown'
    ];

    return severityOrder
      .filter(key => data[key] > 0)
      .map(key => ({
        name: String(SEVERITY_DISPLAY[key as RuleSeverity] || key),
        value: data[key],
        color: SEVERITY_COLORS[key as RuleSeverity] || '#8884d8',
      }));
  }, [data]);

  const totalRules = useMemo(() => 
    chartData.reduce((acc, entry) => acc + entry.value, 0), 
    [chartData]
  );

  if (isLoading) {
    return (
      <Skeleton 
        variant="circular" 
        width="100%" 
        height={height - 50} 
        sx={{ mx: 'auto' }}
      />
    );
  }

  if (!chartData.length) {
    return (
      <Box 
        className={className}
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ height, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <RechartsTooltip 
            contentStyle={{ 
              background: theme.palette.background.paper, 
              borderColor: theme.palette.divider, 
              borderRadius: theme.shape.borderRadius 
            }}
          />
          <Legend 
            iconType="circle" 
            verticalAlign="bottom" 
            height={36} 
          />
          <Pie 
            data={chartData} 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="80%" 
            dataKey="value" 
            paddingAngle={5} 
            cornerRadius={8}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {showTotal && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            pointerEvents: 'none' 
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {totalRules}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Rules
          </Typography>
        </Box>
      )}
    </Box>
  );
};
