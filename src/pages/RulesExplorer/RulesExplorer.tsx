// src/pages/RulesExplorer/RulesExplorer.tsx
import React, { useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useFilterStore } from '@/store/filterStore';
import { useRules } from '@/hooks/useRules';
import { RuleFilterBar, RulesTable, RuleGrid, RuleDetailDrawer } from '@/components/rules';
import { ErrorDisplay, LoadingIndicator } from '@/components/common';

export default function RulesExplorer() {
  const { page, pageSize, viewMode, setPage, setPageSize, setViewMode } = useFilterStore();
  const { rules, total, totalPages, isLoading, isFetching, error, refetch } = useRules();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      <Paper sx={{ p: 2, mb: 2, mx: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Rules Explorer</Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <RuleFilterBar />
      </Paper>
      
      <Box sx={{ flex: 1, position: 'relative', px: 2 }}>
        {isLoading ? (
          <LoadingIndicator />
        ) : viewMode === 'list' ? (
          <RulesTable
            rules={rules}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRuleSelect={setSelectedRuleId}
            loading={isFetching}
          />
        ) : (
          <RuleGrid
            rules={rules}
            onRuleSelect={setSelectedRuleId}
            loading={isFetching}
          />
        )}
      </Box>
      
      {selectedRuleId && (
        <RuleDetailDrawer
          ruleId={selectedRuleId}
          open={!!selectedRuleId}
          onClose={() => setSelectedRuleId(null)}
        />
      )}
    </Box>
  );
}