// src/components/rules/RuleGrid.tsx
import React from 'react';
import { Grid, Box } from '@mui/material';
import { Rule } from '@/api/types';
import { RuleCard } from './RuleCard';
import { EmptyState, LoadingIndicator } from '@/components/common';

interface RuleGridProps {
  rules: Rule[];
  onRuleSelect?: (ruleId: string) => void;
  loading?: boolean;
}

export function RuleGrid({ rules, onRuleSelect, loading }: RuleGridProps) {
  if (loading && rules.length === 0) {
    return <LoadingIndicator />;
  }
  
  if (rules.length === 0) {
    return <EmptyState message="No rules found" />;
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {rules.map(rule => (
          <Grid item key={rule.rule_id} xs={12} sm={6} md={4} lg={3}>
            <RuleCard
              rule={rule}
              onClick={() => onRuleSelect?.(rule.rule_id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default RuleGrid;