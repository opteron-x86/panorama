// src/components/rules/RuleCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import { Rule } from '@/api/types';
import { getSeverityColor, formatDate } from '@/api/utils';

interface RuleCardProps {
  rule: Rule;
  onClick?: () => void;
}

export function RuleCard({ rule, onClick }: RuleCardProps) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {rule.rule_id}
            </Typography>
            <Typography variant="h6" noWrap>
              {rule.name}
            </Typography>
          </Box>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {rule.description || 'No description available'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={rule.severity}
              size="small"
              sx={{
                bgcolor: getSeverityColor(rule.severity),
                color: 'white',
              }}
            />
            <Chip label={rule.rule_type} size="small" variant="outlined" />
            {rule.mitre_techniques?.length > 0 && (
              <Chip
                label={`${rule.mitre_techniques.length} MITRE`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              {rule.source}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(rule.updated_date)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default RuleCard;