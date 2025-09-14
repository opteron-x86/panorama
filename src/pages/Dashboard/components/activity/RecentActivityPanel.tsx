import React from 'react';
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
import UpdateIcon from '@mui/icons-material/Update';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { Card, ErrorDisplay, StatusBadge } from '@/components/common';
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import { RuleSummary, RuleSeverity } from '@/api/types';
import { SEVERITY_DISPLAY } from '@/utils/constants';
import { formatRelativeTime } from '../../utils';
import { RecentActivityPanelProps } from './RecentActivityPanel.types';

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ 
  className,
  maxItems = 5,
  onViewMore 
}) => {
  const navigate = useNavigate();
  const { rules, isLoading, isError, error } = usePaginatedRules(1, maxItems);

  const handleRuleClick = (rule: RuleSummary) => {
    navigate('/rules', { 
      state: { initialSearchTerm: `${rule.id}` } 
    });
  };

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      navigate('/rules');
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
        <UpdateIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
        <Typography variant="h6">Recent Rule Activity</Typography>
      </Box>

      {/* Content */}
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
            message="Could not load recent rules." 
            details={error?.message} 
          />
        )}

        {!isLoading && !isError && rules.length > 0 && (
          <List disablePadding>
            {rules.map((rule, index) => (
              <React.Fragment key={rule.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleRuleClick(rule)}
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
                          title={rule.title}
                          color="text.primary"
                        >
                          {rule.title}
                        </Typography>
                      }
                      secondary={
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mt: 0.5 
                          }}
                        >
                          <StatusBadge 
                            label={SEVERITY_DISPLAY[rule.severity as RuleSeverity]} 
                            status={rule.severity} 
                            size="small" 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(rule.modified_date)}
                          </Typography>
                        </Box>
                      }
                      slotProps={{
                        secondary: {
                          component: 'div',
                        },
                      }}
                    />
                    <ArrowForwardIosIcon 
                      sx={{ 
                        fontSize: '0.9rem', 
                        color: 'text.secondary' 
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
                {index < rules.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isLoading && !isError && rules.length === 0 && (
          <ErrorDisplay message="No recent rules found." />
        )}
      </Box>

      {/* Footer link */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <MuiLink
          component={RouterLink}
          to="/rules"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            handleViewMore();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Typography variant="body2">
            View All Rules
          </Typography>
          <ArrowForwardIosIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
        </MuiLink>
      </Box>
    </Card>
  );
};