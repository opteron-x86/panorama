import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Skeleton,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { Card, ErrorDisplay } from '@/components/common';
import { useTechniqueCoverageQuery } from '@/api/queries';
import { TechniqueCoverageDetail } from '@/api/types';
import { CoverageGapsPanelProps } from './CoverageGapsPanel.types';

export const CoverageGapsPanel: React.FC<CoverageGapsPanelProps> = ({ 
  className,
  maxItems = 10,
  onTechniqueClick,
  onViewMore
}) => {
  const navigate = useNavigate();
  const { data: coverageData, isLoading, isError, error } = useTechniqueCoverageQuery();

  const coverageGaps = useMemo(() => {
    if (!coverageData?.techniques) return [];
    
    return coverageData.techniques
      .filter(tech => tech.count === 0)
      .slice(0, maxItems);
  }, [coverageData, maxItems]);

  const handleTechniqueClick = (technique: TechniqueCoverageDetail) => {
    if (onTechniqueClick) {
      onTechniqueClick(technique);
    } else {
      navigate('/attack-matrix', { 
        state: { initialSearchTerm: technique.technique_id } 
      });
    }
  };

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      navigate('/attack-matrix');
    }
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
        <ReportProblemOutlinedIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography variant="h6">Top Coverage Gaps</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {isLoading && (
          <List>
            {[...Array(maxItems)].map((_, i) => (
              <ListItem key={i}>
                <Skeleton width="100%" height={40} />
              </ListItem>
            ))}
          </List>
        )}

        {isError && (
          <ErrorDisplay 
            message="Could not load coverage data." 
            details={error?.message} 
          />
        )}

        {!isLoading && !isError && coverageGaps.length > 0 && (
          <List disablePadding>
            {coverageGaps.map((tech, index) => (
              <React.Fragment key={tech.technique_id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleTechniqueClick(tech)}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      py: 1.5 
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          noWrap 
                          title={tech.name}
                          color="text.primary"
                        >
                          {tech.name}
                        </Typography>
                      }
                      secondary={tech.technique_id}
                    />
                    <ArrowForwardIosIcon 
                      sx={{ 
                        fontSize: '0.9rem', 
                        color: 'text.secondary' 
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
                {index < coverageGaps.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isLoading && !isError && coverageGaps.length === 0 && (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center' 
            }}
          >
            <Typography variant="h6" color="success.main">
              Excellent Coverage!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No techniques with zero coverage found.
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
        <ListItemButton 
          component={RouterLink}
          to="/attack-matrix"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            handleViewMore();
          }}
          sx={{ justifyContent: 'center', py: 0.5 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            View Full Matrix
          </Typography>
        </ListItemButton>
      </Box>
    </Card>
  );
};
