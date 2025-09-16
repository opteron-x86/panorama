// src/pages/RulesExplorer/RulesExplorer.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  useTheme,
  useMediaQuery,
  Stack,
  Paper,
  Select,
  Divider,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// API and Types
import { RuleSummary } from '@/api/types';
import { GridSortModel } from '@mui/x-data-grid';

// Components
import { ErrorDisplay, EmptyState } from '@/components/common';
import { RuleFilterBar } from '@/components/rules';
import RulesTable from '@/components/rules/RulesTable';
import VirtualizedRuleGrid from '@/components/rules/VirtualizedRuleGrid';
import RuleDetailComponent from '@/components/rules/RuleDetail';

// Hooks and Utils
import usePaginatedRules from '@/hooks/data/usePaginatedRules';
import useRuleBookmarks from '@/hooks/data/useRuleBookmarks';
import { useRuleStore, useFilterStore } from '@/store';
import { useRuleQuery } from '@/api/queries';
import { formatDate } from '@/utils/format';

type ViewMode = 'list' | 'grid';

const RulesExplorer: React.FC = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRuleIdForDetail, setSelectedRuleIdForDetail] = useState<string | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Store hooks
  const { 
    selectRule: setSelectedRuleInStore,
    addRecentlyViewedRule 
  } = useRuleStore();
  const setSearchTerm = useFilterStore((state) => state.setSearchTerm);
  
  // Data hooks
  const {
    rules: fetchedRules,
    totalRules,
    totalPages,
    currentPage,
    pageSize,
    sortModel,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    hasActiveFilters,
    handlePageChange,
    handleSortChange,
    resetFiltersAndPage,
  } = usePaginatedRules();
  
  // Rule detail query
  const { 
    data: selectedRuleFullDetail, 
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError
  } = useRuleQuery(selectedRuleIdForDetail);
  
  // Bookmarks functionality
  const { bookmarkedRules, toggleBookmark, isBookmarked } = useRuleBookmarks();
  
  // URL search param sync
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query !== '') {
      setSearchTerm(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Add to recently viewed when detail loads
  useEffect(() => {
    if (selectedRuleFullDetail && selectedRuleIdForDetail) {
      addRecentlyViewedRule(selectedRuleFullDetail);
    }
  }, [selectedRuleFullDetail, selectedRuleIdForDetail, addRecentlyViewedRule]);

  // Computed values
  const rulesToDisplay = useMemo(() => {
    if (showBookmarkedOnly) {
      return fetchedRules.filter(rule => bookmarkedRules.has(String(rule.id)));
    }
    return fetchedRules;
  }, [fetchedRules, showBookmarkedOnly, bookmarkedRules]);

  const effectiveIsLoading = isLoading || isFetching;

  // Event handlers
  const handleRuleSelect = useCallback((ruleSummary: RuleSummary) => {
    setSelectedRuleInStore(ruleSummary);
    setSelectedRuleIdForDetail(String(ruleSummary.id));
    setDetailDrawerOpen(true);
  }, [setSelectedRuleInStore]);

  const handleCloseDetail = useCallback(() => {
    setDetailDrawerOpen(false);
    setTimeout(() => {
      setSelectedRuleIdForDetail(null);
      setSelectedRuleInStore(null);
    }, 300);
  }, [setSelectedRuleInStore]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleToggleShowBookmarked = useCallback(() => {
    setShowBookmarkedOnly(prev => !prev);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    handlePageChange(1, newPageSize);
  }, [handlePageChange]);

  const handleExportRules = useCallback(() => {
    setMoreMenuAnchor(null);
    
    const rulesForExport = showBookmarkedOnly ? rulesToDisplay : fetchedRules;
    if (!rulesForExport || rulesForExport.length === 0) {
      alert('No rules to export.');
      return;
    }

    // Client-side CSV export
    const csvContent = [
      ['ID', 'Title', 'Description', 'Status', 'Source', 'Platforms', 'MITRE Techniques', 'Created', 'Modified'].join(','),
      ...rulesForExport.map(rule => [
        rule.id,
        `"${(rule.title || '').replace(/"/g, '""')}"`,
        `"${(rule.description || '').replace(/"/g, '""')}"`,
        rule.status ?? 'unknown',
        rule.rule_source,
        `"${(rule.rule_platforms ?? []).join('; ')}"`,
        `"${(rule.linked_technique_ids ?? []).join('; ')}"`,
        rule.created_date ? formatDate(rule.created_date) : '-',
        rule.modified_date ? formatDate(rule.modified_date) : '-',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rules_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [showBookmarkedOnly, rulesToDisplay, fetchedRules]);

  const handleBookmarkClick = useCallback((rule: RuleSummary) => {
    toggleBookmark(String(rule.id));
  }, [toggleBookmark]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      handleSortChange(field, sort);
    }
  }, [handleSortChange]);

  // Render helpers
  const renderContent = () => {
    if (isError) {
      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorDisplay 
            message={error?.message || "Failed to load rules"} 
            onRetry={refetch}
          />
        </Box>
      );
    }

    if (!effectiveIsLoading && rulesToDisplay.length === 0) {
      const message = showBookmarkedOnly 
        ? "No bookmarked rules found. Bookmark some rules to see them here."
        : hasActiveFilters 
        ? "No rules match your current filters. Try adjusting your search criteria."
        : "No rules available in the system.";

      return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            title="No Rules Found"
            description={message}
            actionText={(showBookmarkedOnly || hasActiveFilters) ? "Clear Filters" : undefined}
            onAction={(showBookmarkedOnly || hasActiveFilters) ? () => {
              resetFiltersAndPage();
              setShowBookmarkedOnly(false);
            } : undefined}
          />
        </Box>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <VirtualizedRuleGrid
            rules={rulesToDisplay}
            isBookmarked={isBookmarked}
            onRuleSelect={handleRuleSelect}
            onBookmark={handleBookmarkClick}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <RulesTable
          rules={rulesToDisplay}
          isLoading={effectiveIsLoading}
          sortModel={sortModel}
          onRuleSelect={handleRuleSelect}
          onBookmark={handleBookmarkClick}
          onSortChange={handleSortModelChange}
          isBookmarked={isBookmarked}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Integrated Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <RuleFilterBar />
        
        {/* Secondary Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          {/* Left section - Bookmarks */}
          <ToggleButton
            value="bookmarks"
            selected={showBookmarkedOnly}
            onChange={handleToggleShowBookmarked}
            size="small"
            sx={{
              px: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {showBookmarkedOnly ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              Bookmarked ({bookmarkedRules.size})
            </Typography>
          </ToggleButton>

          {/* Center section - Results count */}
          <Typography variant="body2" color="text.secondary">
            {effectiveIsLoading ? (
              'Loading...'
            ) : (
              `${rulesToDisplay.length} of ${totalRules.toLocaleString()} rules`
            )}
          </Typography>

          {/* Right section - View & Actions */}
          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="list">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh} 
                disabled={effectiveIsLoading}
                size="small"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More Actions">
              <IconButton
                onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Items per page:
            </Typography>
            <Select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              size="small"
              variant="standard"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
          </Typography>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || effectiveIsLoading}
              size="small"
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || effectiveIsLoading}
              size="small"
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || effectiveIsLoading}
              size="small"
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || effectiveIsLoading}
              size="small"
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Main Content */}
      {renderContent()}

      {/* More Actions Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
      >
        <MenuItem onClick={handleExportRules}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/insights">
          <InsightsIcon fontSize="small" sx={{ mr: 1 }} />
          View Insights
        </MenuItem>
        <MenuItem component={RouterLink} to="/mitre-attack">
          <SecurityIcon fontSize="small" sx={{ mr: 1 }} />
          MITRE ATT&CK Matrix
        </MenuItem>
      </Menu>

      {/* Rule Detail Drawer - Fixed positioning below header */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={handleCloseDetail}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '500px', md: '600px' },
            maxWidth: '90vw',
            top: 64, // Position below the 64px header
            height: 'calc(100% - 64px)', // Adjust height to account for header
          },
        }}
      >
        {selectedRuleIdForDetail && (
          <RuleDetailComponent
            rule={selectedRuleFullDetail}
            isLoading={isLoadingDetail}
            isError={isDetailError}
            error={detailError}
            isBookmarked={isBookmarked(selectedRuleIdForDetail)}
            onClose={handleCloseDetail}
            onBookmark={() => toggleBookmark(selectedRuleIdForDetail)}
            onShare={(ruleId) => {
              const url = `${window.location.origin}/rules/${ruleId}`;
              navigator.clipboard.writeText(url);
            }}
          />
        )}
      </Drawer>
    </Box>
  );
};

export default RulesExplorer;