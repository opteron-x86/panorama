// src/components/rules/RuleCard.tsx

import React from 'react';
import {
  Box, Typography, Chip, Stack, IconButton, Tooltip, useTheme, Divider, SxProps, Theme,
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LanguageIcon from '@mui/icons-material/Language';
import HubIcon from '@mui/icons-material/Hub';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
        } : {},
      }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                minHeight: '2.6em',
              }}
            >
              {rule.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {rule.source?.name || 'Unknown Source'}
              </Typography>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(rule.updated_date) || '-'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 0.5 }}>
            {onBookmark && (
              <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark rule'}>
                <IconButton 
                  size="small" 
                  onClick={handleBookmarkClick} 
                  sx={{ color: isBookmarked ? theme.palette.warning.main : theme.palette.action.active }}
                >
                  {isBookmarked ? <BookmarkIcon fontSize="small"/> : <BookmarkBorderIcon fontSize="small"/>}
                </IconButton>
              </Tooltip>
            )}
            <StatusBadge 
              label={rule.is_active ? 'Active' : 'Inactive'} 
              status={getStatusBadgeType(rule.is_active)} 
              size="small" 
              showDot={false}
            />
          </Box>
        </Box>
        
        {/* Rule ID and Severity */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title={rule.rule_id}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontFamily: 'monospace', 
                bgcolor: theme.palette.background.default, 
                px: 1, 
                py: 0.5, 
                borderRadius: 1, 
                maxWidth: 'calc(100% - 100px)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}
            >
              {rule.rule_id}
            </Typography>
          </Tooltip>
          {rule.severity && (
            <Chip
              label={rule.severity.toUpperCase()}
              size="small"
              sx={{
                bgcolor: getSeverityColor(rule.severity),
                color: theme.palette.getContrastText(getSeverityColor(rule.severity)),
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          )}
        </Box>
      </Box>

      <Divider />

      {/* Content Section */}
      <Box sx={{ p: 2, pt: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            mb: 1.5, 
            display: '-webkit-box', 
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            minHeight: '3.6em', 
          }}
        >
          {rule.description || 'No description provided.'}
        </Typography>

        {/* Enrichment Counts */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {rule.mitre_technique_count > 0 && (
            <Tooltip title="MITRE ATT&CK Techniques">
              <Chip
                icon={<HubIcon sx={{ fontSize: 16 }} />}
                label={rule.mitre_technique_count}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
            </Tooltip>
          )}
          
          {rule.cve_count > 0 && (
            <Tooltip title="CVE References">
              <Chip
                icon={<BugReportIcon sx={{ fontSize: 16 }} />}
                label={rule.cve_count}
                size="small"
                variant="outlined"
                color="error"
                sx={{ height: 24, fontSize: '0.75rem' }}
              />
            </Tooltip>
          )}
          
          {rule.rule_type && (
            <Chip
              label={rule.rule_type.toUpperCase()}
              size="small"
              variant="filled"
              sx={{ 
                height: 24, 
                fontSize: '0.7rem',
                bgcolor: theme.palette.action.hover,
              }}
            />
          )}
        </Box>

        {/* Tags */}
        {rule.tags && rule.tags.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {rule.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: 'transparent',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 0.5,
                  }}
                />
              ))}
              {rule.tags.length > 3 && (
                <Chip
                  label={`+${rule.tags.length - 3}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: theme.palette.grey[200],
                    color: theme.palette.grey[700],
                    mb: 0.5,
                  }}
                />
              )}
            </Stack>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default RuleCard;