import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { Card } from '@/components/common';
import { 
  TopRuleSourcesProps,
  RuleSourceData 
} from './TopRuleSources.types';

export const TopRuleSources: React.FC<TopRuleSourcesProps> = ({
  data,
  isLoading = false,
  height = 400,
  maxItems = 10,
  onSourceClick,
  className,
}) => {
  const theme = useTheme();

  const processedData = useMemo(() => {
    if (!data) return [];
    
    const sorted = [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);
    
    const total = sorted.reduce((sum, item) => sum + item.value, 0);
    
    return sorted.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));
  }, [data, maxItems]);

  const handleBarClick = (data: RuleSourceData) => {
    if (onSourceClick) {
      onSourceClick(data.name);
    }
  };

  if (isLoading) {
    return (
      <Card className={className} sx={{ height, p: 2 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={height - 80} />
      </Card>
    );
  }

  if (!processedData.length) {
    return (
      <Card className={className} sx={{ height, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Top Rule Sources
        </Typography>
        <Box 
          sx={{ 
            height: height - 80, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No rule source data available
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card className={className} sx={{ height, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Top Rule Sources
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={processedData}
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 60 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value, 'Rules']}
            cursor={{ fill: theme.palette.action.hover }}
          />
          <Bar 
            dataKey="value"
            onClick={onSourceClick ? handleBarClick : undefined}
            style={{ cursor: onSourceClick ? 'pointer' : 'default' }}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={theme.palette.primary.main}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
