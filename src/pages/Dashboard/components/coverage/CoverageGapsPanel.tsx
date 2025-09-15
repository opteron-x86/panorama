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
import { useMitreCoverageQuery } from '@/api/queries';
import { MitreTechnique } from '@/api/types';
import { CoverageGapsPanelProps } from './CoverageGapsPanel.types';

export const CoverageGapsPanel: React.FC<CoverageGapsPanelProps> = ({ 
  className,
  maxItems = 10,
  onTechniqueClick,
  onViewMore
}) => {
  const navigate = useNavigate();
  const { data: coverageData, isLoading, isError, error } = useMitreCoverageQuery();

  const coverageGaps = useMemo(() => {
    if (!coverageData?.techniques) return [];
    
    return coverageData.techniques
      .filter(tech => tech.count === 0)
      .slice(0, maxItems);
  }, [coverageData, maxItems]);

  const handleTechniqueClick = (technique: MitreTechnique) => {
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
            error={error}
            compact
          />
        )}

        {!isLoading && !isError && coverageGaps.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No coverage gaps found
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && coverageGaps.length > 0 && (
          <>
            <List>
              {coverageGaps.map((technique) => (
                <ListItemButton
                  key={technique.technique_id}
                  onClick={() => handleTechniqueClick(technique)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {technique.technique_id}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {technique.name}
                      </Typography>
                    }
                  />
                  <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </ListItemButton>
              ))}
            </List>
            
            {coverageData && coverageData.techniques.filter(t => t.count === 0).length > maxItems && (
              <>
                <Divider />
                <ListItemButton onClick={handleViewMore}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="primary">
                        View all {coverageData.techniques.filter(t => t.count === 0).length} gaps
                      </Typography>
                    }
                  />
                  <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                </ListItemButton>
              </>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};