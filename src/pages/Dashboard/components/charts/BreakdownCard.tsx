import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import { Card, ErrorDisplay } from '@/components/common';
import { 
  BreakdownCardProps, 
  BreakdownItem 
} from './BreakdownCard.types';

export const BreakdownCard: React.FC<BreakdownCardProps> = ({ 
  title, 
  data, 
  isLoading = false, 
  colorMap, 
  icon, 
  onItemClick, 
  valueFormatter,
  showPercentages = false,
  maxItems = 10,
  className
}) => {
  const theme = useTheme();

  const breakdownItems = useMemo((): BreakdownItem[] => {
    if (!data) return [];

    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems)
      .map(([key, value]) => ({
        key,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colorMap?.[key] || theme.palette.primary.main,
        displayName: valueFormatter ? valueFormatter(key) : key,
      }));
  }, [data, colorMap, theme.palette.primary.main, valueFormatter, maxItems]);

  const totalValue = useMemo(() => 
    breakdownItems.reduce((sum, item) => sum + item.value, 0),
    [breakdownItems]
  );

  return (
    <Card 
      className={className}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: 1, 
          borderColor: 'divider' 
        }}
      >
        {icon && <Box sx={{ mr: 1.5, color: 'text.secondary' }}>{icon}</Box>}
        <Typography variant="h6">{title}</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {isLoading && (
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 6 }}>
                <Skeleton width="100%" height={50} />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && !breakdownItems.length && (
          <ErrorDisplay message="No data available" />
        )}

        {!isLoading && breakdownItems.length > 0 && (
          <Grid container spacing={2}>
            {breakdownItems.map((item) => (
              <Grid 
                key={item.key} 
                size={{ xs: 6, sm: 4, md: 6 }}
              >
                <MuiLink
                  component="div"
                  onClick={() => onItemClick?.(item.key)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    bgcolor: 'background.paper',
                    textDecoration: 'none',
                    cursor: onItemClick ? 'pointer' : 'default',
                    transition: theme.transitions.create(['box-shadow', 'transform'], {
                      duration: theme.transitions.duration.short,
                    }),
                    '&:hover': onItemClick ? {
                      boxShadow: theme.shadows[2],
                      transform: 'translateY(-2px)',
                    } : {},
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      color="text.primary"
                      sx={{ flexGrow: 1 }}
                    >
                      {item.displayName}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      color="text.secondary"
                    >
                      {item.value}
                    </Typography>
                    {showPercentages && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                      >
                        {item.percentage}%
                      </Typography>
                    )}
                  </Box>
                </MuiLink>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {!isLoading && totalValue > 0 && (
        <Box 
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            Total: <strong>{totalValue}</strong> items
          </Typography>
        </Box>
      )}
    </Card>
  );
};