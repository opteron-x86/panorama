// src/pages/RulesExplorer/RulesExplorer.tsx
import React, { useState, useCallback, memo } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useFilterStore } from '@/store/filterStore';
import { useRules } from '@/hooks/useRules';
import { RuleFilterBar, RulesTable, RuleGrid, RuleDetailDrawer } from '@/components/rules';
import { ErrorDisplay, LoadingIndicator } from '@/components/common';

// Memoize the header component to prevent re-renders
const RulesHeader = memo(({ 
  viewMode, 
  onViewModeChange 
}: { 
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h5">Rules Explorer</Typography>
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, value) => value && onViewModeChange(value)}
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
));

RulesHeader.displayName = 'RulesHeader';

export default function RulesExplorer() {
  const { page, pageSize, viewMode, setPage, setPageSize, setViewMode } = useFilterStore();
  const { rules, total, totalPages, isLoading, isFetching, error, refetch } = useRules();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  // Stable callbacks
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, [setPage]);
  
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
  }, [setPageSize]);
  
  const handleRuleSelect = useCallback((ruleId: string) => {
    setSelectedRuleId(ruleId);
  }, []);
  
  const handleDrawerClose = useCallback(() => {
    setSelectedRuleId(null);
  }, []);
  
  const handleViewModeChange = useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode);
  }, [setViewMode]);
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      <Paper sx={{ p: 2, mb: 2, mx: 2 }}>
        <RulesHeader 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange}
        />
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
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRuleSelect={handleRuleSelect}
            loading={isFetching}
          />
        ) : (
          <RuleGrid
            rules={rules}
            onRuleSelect={handleRuleSelect}
            loading={isFetching}
          />
        )}
      </Box>
      
      {/* Drawer rendered conditionally but outside main content flow */}
      {selectedRuleId && (
        <RuleDetailDrawer
          key={selectedRuleId} // Force new instance per rule
          ruleId={selectedRuleId}
          open={true}
          onClose={handleDrawerClose}
        />
      )}
    </Box>
  );
}