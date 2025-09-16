// src/components/rules/RuleCard.tsx

import React from 'react';
import {
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HubIcon from '@mui/icons-material/Hub';
import BugReportIcon from '@mui/icons-material/BugReport';

import { RuleSummary } from '@/api/types';
import { Card, StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';

interface RuleCardProps {
  rule: RuleSummary;
  isBookmarked?: boolean;
  onClick?: (rule: RuleSummary) => void;
  onBookmark?: (ruleId: string) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  isBookmarked = false,
  onClick,
  onBookmark,
}) => {
  const theme = useTheme();

  const handleCardClick = () => {
    if (onClick) {
      onClick(rule);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(String(rule.id));
    }
  };

  // Determine status badge type based on rule status
  const getStatusBadgeType = (status: boolean): 'success' | 'error' => {
    return status ? 'success' : 'error';
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    const severityColors: Record<string, string> = {
      critical: theme.palette.error.main,
      high: theme.palette.warning.main,
      medium: theme.palette.info.main,
      low: theme.palette.success.main,
      info: theme.palette.grey[500],
    };
    return severityColors[severity.toLowerCase()] || theme.palette.grey[500];
  };

  return (
    <Card
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : undefined,
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with title and bookmark */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {rule.title}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              ID: {rule.source_rule_id}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleBookmarkClick}
            sx={{ ml: 1 }}
          >
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        {/* Last Updated */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Updated: {formatDate(rule.modified_date)}
        </Typography>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: '1 1 auto',
          }}
        >
          {rule.description || 'No description available'}
        </Typography>

        {/* Status and Severity Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <StatusBadge 
            status={getStatusBadgeType(rule.status === 'active')} 
            label={rule.status === 'active' ? 'Active' : 'Inactive'}
          />
          <Chip 
            label={rule.severity?.toUpperCase() || 'Unknown'} 
            size="small"
            sx={{ 
              backgroundColor: getSeverityColor(rule.severity || ''),
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Stack>

        {/* Rule Source */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Source: {rule.rule_source}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Bottom Stats Section */}
        <Box sx={{ mt: 'auto' }}>
          {/* Tags */}
          {rule.tags && rule.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {rule.tags.slice(0, 3).map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                ))}
                {rule.tags.length > 3 && (
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    +{rule.tags.length - 3} more
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* Platform Icons & Counts */}
          <Stack direction="row" spacing={2}>
            {/* Rule Type */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Rule Type">
                <Typography variant="caption" color="text.secondary">
                  Type: {rule.rule_type || 'Unknown'}
                </Typography>
              </Tooltip>
            </Box>

            {/* MITRE Techniques */}
            {rule.extracted_mitre_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="MITRE Techniques">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">
                      {rule.extracted_mitre_count}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}

            {/* CVEs */}
            {rule.extracted_cve_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="CVE References">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BugReportIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">
                      {rule.extracted_cve_count}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Stack>

          {/* Platforms if available */}
          {rule.rule_platforms && rule.rule_platforms.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Platforms: {rule.rule_platforms.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default RuleCard;