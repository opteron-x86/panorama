import React from 'react';
import Grid from '@mui/material/Grid';

import { StatCard } from './StatCard';
import { MetricsRowProps } from './MetricsRow.types';

export const MetricsRow: React.FC<MetricsRowProps> = ({ 
  metrics, 
  isLoading = false,
  className
}) => {
  const getGridSize = () => {
    const count = metrics.length;
    if (count <= 2) return { xs: 12, sm: 6 };
    if (count === 3) return { xs: 12, sm: 6, md: 4 };
    if (count === 4) return { xs: 12, sm: 6, md: 3 };
    return { xs: 12, sm: 6, md: 4, lg: 3 };
  };

  const gridSize = getGridSize();

  return (
    <Grid container spacing={3} className={className}>
      {metrics.map((metric, index) => (
        <Grid key={index} size={gridSize}>
          <StatCard
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            trend={metric.trend}
            onClick={metric.onClick}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
};