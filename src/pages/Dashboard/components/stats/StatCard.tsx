import React from 'react';
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { Card } from '@/components/common';
import { StatCardProps } from './StatCard.types';

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  isLoading = false, 
  color,
  trend,
  onClick,
  className
}) => {
  const theme = useTheme();
  const borderColor = color || theme.palette.primary.main;

  const getTrendColor = () => {
    if (!trend) return undefined;
    return trend.direction === 'up' 
      ? theme.palette.success.main 
      : trend.direction === 'down' 
        ? theme.palette.error.main 
        : theme.palette.text.secondary;
  };

  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUpIcon 
    : trend?.direction === 'down' 
      ? TrendingDownIcon 
      : null;

  return (
    <Card 
      className={className}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        borderLeft: `4px solid ${borderColor}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': onClick ? {
          boxShadow: theme.shadows[3],
          transform: 'translateY(-2px)',
        } : {},
      }}
      onClick={onClick}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexGrow: 1 
        }}
      >
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            gutterBottom
          >
            {title}
          </Typography>
          
          {isLoading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
            >
              {value}
            </Typography>
          )}

          {trend && !isLoading && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                mt: 1 
              }}
            >
              {TrendIcon && (
                <TrendIcon 
                  sx={{ 
                    fontSize: '1rem', 
                    color: getTrendColor() 
                  }} 
                />
              )}
              <Typography 
                variant="caption" 
                sx={{ color: getTrendColor() }}
              >
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        {icon && (
          <Box 
            sx={{ 
              color: borderColor, 
              fontSize: '2.5rem', 
              opacity: 0.8 
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Card>
  );
};
