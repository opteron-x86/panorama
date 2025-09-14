import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  LinearProgress,
  Skeleton,
  useTheme,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

import { Card, ErrorDisplay } from '@/components/common';
import useMitreAttackData from '@/hooks/data/useMitreAttackData';
import { 
  PlatformCoveragePanelProps, 
  PlatformCoverageData 
} from './PlatformCoveragePanel.types';

export const PlatformCoveragePanel: React.FC<PlatformCoveragePanelProps> = ({ 
  className,
  maxItems = 5,
  onPlatformClick
}) => {
  const theme = useTheme();
  const { matrix, coverage, isLoading } = useMitreAttackData();

  const platformCoverage = useMemo((): PlatformCoverageData[] => {
    if (!matrix || !coverage) return [];

    // Map techniques to their platforms
    const allPlatforms = new Set<string>();
    const techniquePlatformMap = new Map<string, string[]>();

    matrix.forEach(tactic => {
      tactic.techniques.forEach(tech => {
        if (tech.platforms && !tech.is_deprecated) {
          tech.platforms.forEach(p => allPlatforms.add(p));
          techniquePlatformMap.set(tech.id, tech.platforms);
        }
        tech.subtechniques?.forEach(sub => {
          if (sub.platforms && !sub.is_deprecated) {
            sub.platforms.forEach(p => allPlatforms.add(p));
            techniquePlatformMap.set(sub.id, sub.platforms);
          }
        });
      });
    });

    // Get covered technique IDs
    const coveredTechniqueIds = new Set(
      coverage.techniques
        .filter(t => t.count > 0)
        .map(t => t.technique_id)
    );

    // Calculate coverage per platform
    const platformData: PlatformCoverageData[] = Array.from(allPlatforms).map(platform => {
      const techniquesForPlatform = Array.from(techniquePlatformMap.entries())
        .filter(([, platforms]) => platforms.includes(platform))
        .map(([techId]) => techId);
      
      const totalTechniques = techniquesForPlatform.length;
      const coveredTechniques = techniquesForPlatform
        .filter(techId => coveredTechniqueIds.has(techId)).length;
      
      return {
        platform,
        totalTechniques,
        coveredTechniques,
        coveragePercentage: totalTechniques > 0 
          ? Math.round((coveredTechniques / totalTechniques) * 100) 
          : 0,
      };
    });

    // Aggregate similar platforms
    const aggregated: Record<string, PlatformCoverageData> = {};
    
    platformData.forEach(item => {
      const category = item.platform.includes('Cloud') 
        ? 'Cloud' 
        : item.platform.includes('Office') 
          ? 'Office 365' 
          : item.platform;
      
      if (!aggregated[category]) {
        aggregated[category] = { ...item, platform: category };
      } else {
        aggregated[category].totalTechniques += item.totalTechniques;
        aggregated[category].coveredTechniques += item.coveredTechniques;
        aggregated[category].coveragePercentage = aggregated[category].totalTechniques > 0
          ? Math.round((aggregated[category].coveredTechniques / aggregated[category].totalTechniques) * 100)
          : 0;
      }
    });

    return Object.values(aggregated)
      .sort((a, b) => b.coveragePercentage - a.coveragePercentage)
      .slice(0, maxItems);
  }, [matrix, coverage, maxItems]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card 
      className={className}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: 1, 
          borderColor: 'divider' 
        }}
      >
        <LanguageIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography variant="h6">Coverage by Platform</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {isLoading && (
          <List>
            {[...Array(maxItems)].map((_, i) => (
              <ListItem key={i}>
                <Skeleton width="100%" height={50} />
              </ListItem>
            ))}
          </List>
        )}

        {!isLoading && platformCoverage.length > 0 && (
          <List disablePadding>
            {platformCoverage.map(item => (
              <ListItem 
                key={item.platform}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  py: 1, 
                  px: 0,
                  cursor: onPlatformClick ? 'pointer' : 'default',
                  '&:hover': onPlatformClick ? {
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  } : {},
                }}
                onClick={() => onPlatformClick?.(item.platform)}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 0.5 
                  }}
                >
                  <Typography variant="body2" fontWeight="500">
                    {item.platform}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {item.coveragePercentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={item.coveragePercentage} 
                  color={getProgressColor(item.coveragePercentage)}
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    borderRadius: 1 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ mt: 0.5 }}
                >
                  {item.coveredTechniques} of {item.totalTechniques} techniques covered
                </Typography>
              </ListItem>
            ))}
          </List>
        )}

        {!isLoading && platformCoverage.length === 0 && (
          <ErrorDisplay message="No platform data available to calculate coverage." />
        )}
      </Box>
    </Card>
  );
};