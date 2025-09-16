// src/components/rules/RulesTable.tsx

import React, { useMemo, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridValueGetter,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import { RuleSummary } from '@/api/types';
import { StatusBadge } from '@/components/common';
import { formatDate } from '@/utils/format';

interface RulesTableProps {
  rules: RuleSummary[];
  isLoading?: boolean;
  sortModel?: GridSortModel;
  onRuleSelect: (rule: RuleSummary) => void;
  onBookmark: (ruleId: string) => void;
  onSortChange: (model: GridSortModel) => void;
  isBookmarked: (ruleId: string) => boolean;
}

type SeverityColor = 'error' | 'warning' | 'info' | 'default' | 'primary' | 'secondary' | 'success';

const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  isLoading = false,
  sortModel = [],
  onRuleSelect,
  onBookmark,
  onSortChange,
  isBookmarked,
}) => {
  const theme = useTheme();

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'bookmark',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(String(params.row.id));
          }}
        >
          {isBookmarked(String(params.row.id)) ? (
            <BookmarkIcon fontSize="small" color="primary" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      ),
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 2,
      minWidth: 200,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => (
        <StatusBadge 
          status={params.value} 
          label={params.value === 'active' ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        const severityColorMap: Record<string, SeverityColor> = {
          critical: 'error',
          high: 'error',
          medium: 'warning',
          low: 'info',
          informational: 'default',
        };
        
        const severityValue = params.value?.toLowerCase() || '';
        const chipColor = severityColorMap[severityValue] || 'default';
        
        return (
          <Chip
            label={params.value}
            size="small"
            color={chipColor}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'rule_source',
      headerName: 'Source',
      width: 150,
      sortable: true,
    },
    {
      field: 'rule_platforms',
      headerName: 'Platforms',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const platforms = params.value || [];
        if (!platforms.length) return '-';
        
        return (
          <Stack direction="row" spacing={0.5}>
            {platforms.slice(0, 2).map((platform: string, index: number) => (
              <Chip
                key={index}
                label={platform}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {platforms.length > 2 && (
              <Chip
                label={`+${platforms.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Stack>
        );
      },
    },
    {
      field: 'enrichment',
      headerName: 'Enrichment',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const hasMitre = params.row.has_mitre_mapping;
        const hasCve = params.row.has_cve_references;
        
        return (
          <Stack direction="row" spacing={1}>
            {hasMitre && (
              <Tooltip title="MITRE ATT&CK Mapped">
                <SecurityIcon fontSize="small" color="primary" />
              </Tooltip>
            )}
            {hasCve && (
              <Tooltip title="CVE References">
                <BugReportIcon fontSize="small" color="warning" />
              </Tooltip>
            )}
            {!hasMitre && !hasCve && (
              <Typography variant="caption" color="text.disabled">
                None
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'modified_date',
      headerName: 'Modified',
      width: 120,
      sortable: true,
      valueGetter: ((value: string | null) => {
        return value ? new Date(value) : null;
      }) as GridValueGetter<RuleSummary, Date | null>,
      renderCell: (params: GridRenderCellParams) => {
        return params.value ? formatDate(params.value) : '-';
      },
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const tags = params.value || [];
        if (!tags.length) return '-';
        
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
            ))}
            {tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{tags.length - 3}
              </Typography>
            )}
          </Stack>
        );
      },
    },
  ], [theme, onBookmark, isBookmarked]);

  const handleRowClick = useCallback((params: GridRowParams<RuleSummary>) => {
    onRuleSelect(params.row);
  }, [onRuleSelect]);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rules}
        columns={columns}
        loading={isLoading}
        sortModel={sortModel}
        onSortModelChange={onSortChange}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        disableColumnFilter
        hideFooter
        rowHeight={60}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
};

export default RulesTable;