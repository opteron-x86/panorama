import React from 'react';
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Card } from '@/components/common';
import { ActivityTrendProps } from './ActivityTrend.types';

export const ActivityTrend: React.FC<ActivityTrendProps> = ({
  data,
  isLoading = false,
  daysBack,
  height = 300,
  className,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Card className={className} sx={{ p: 2 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={height} />
      </Card>
    );
  }

  if (!data || !data.daily_stats || data.daily_stats.length === 0) {
    return (
      <Card className={className} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Activity Trend ({daysBack} days)
        </Typography>
        <Box 
          sx={{ 
            height, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No activity data available
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card className={className} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Activity Trend ({daysBack} days)
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data.daily_stats}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="rules_created"
            stackId="1"
            stroke={theme.palette.success.main}
            fill={theme.palette.success.light}
            name="Rules Created"
          />
          <Area
            type="monotone"
            dataKey="rules_updated"
            stackId="1"
            stroke={theme.palette.info.main}
            fill={theme.palette.info.light}
            name="Rules Updated"
          />
          {data.daily_stats[0]?.rules_deleted !== undefined && (
            <Area
              type="monotone"
              dataKey="rules_deleted"
              stackId="1"
              stroke={theme.palette.error.main}
              fill={theme.palette.error.light}
              name="Rules Deleted"
            />
          )}
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};