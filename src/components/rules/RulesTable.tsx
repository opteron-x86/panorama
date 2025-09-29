// src/components/rules/RulesTable.tsx
import React, { useMemo, useCallback } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridPaginationModel,
  GridSortModel,
  GridRowParams,
  GridRenderCellParams 
} from '@mui/x-data-grid';
import { Chip, Box, Typography } from '@mui/material';
import { Rule } from '@/api/types';
import { formatDate, getSeverityColor } from '@/api/utils';
import { useFilterStore } from '@/store/filterStore';

interface RulesTableProps {
  rules: Rule[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRuleSelect?: (ruleId: string) => void;
  loading?: boolean;
}

export function RulesTable({
  rules,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRuleSelect,
  loading = false,
}: RulesTableProps) {
  const { sortBy, sortDir, setSorting } = useFilterStore();
  
  // Memoize pagination model to prevent unnecessary updates
  const paginationModel = useMemo(() => ({
    page: page - 1,
    pageSize,
  }), [page, pageSize]);

  // Memoize sort model
  const sortModel = useMemo<GridSortModel>(() => {
    if (sortBy) {
      return [{
        field: sortBy,
        sort: sortDir as 'asc' | 'desc'
      }];
    }
    return [];
  }, [sortBy, sortDir]);

  // Stable callback for pagination changes
  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    // Only update if values actually changed
    if (model.page !== page - 1) {
      onPageChange(model.page + 1);
    }
    if (model.pageSize !== pageSize) {
      onPageSizeChange(model.pageSize);
    }
  }, [page, pageSize, onPageChange, onPageSizeChange]);

  // Stable callback for sort changes
  const handleSortModelChange = useCallback((model: GridSortModel) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      if (field && sort) {
        setSorting(field, sort);
      }
    }
  }, [setSorting]);

  // Stable callback for row clicks
  const handleRowClick = useCallback((params: GridRowParams<Rule>) => {
    onRuleSelect?.(params.row.rule_id);
  }, [onRuleSelect]);

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 250,
    },
    { 
      field: 'severity', 
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value}
          size="small"
          sx={{
            bgcolor: getSeverityColor(params.value),
            color: 'white',
            fontWeight: 500,
          }}
        />
      ),
    },
    { 
      field: 'rule_type',
      headerName: 'Type',
      width: 120,
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Unknown'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'mitre_techniques',
      headerName: 'ATT&CK Techniques',
      width: 180,
      sortable: false, // Complex field, not sortable
      renderCell: (params: GridRenderCellParams<Rule, string[]>) => {
        if (!params.value || params.value.length === 0) return '-';
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {params.value.slice(0, 2).map(technique => (
              <Chip key={technique} label={technique} size="small" variant="outlined" />
            ))}
            {params.value.length > 2 && (
              <Chip label={`+${params.value.length - 2}`} size="small" variant="outlined" />
            )}
          </Box>
        );
      },
    },
    {
      field: 'updated_date',
      headerName: 'Updated',
      width: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
  ];

  return (
    <DataGrid
      rows={rules}
      columns={columns}
      getRowId={(row) => row.rule_id}
      rowCount={total}
      loading={loading}
      
      // Pagination configuration
      pageSizeOptions={[10, 25, 50, 100]}
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
      paginationMode="server"
      
      // Sorting configuration - server-side sorting
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={handleSortModelChange}
      
      // Row interaction
      onRowClick={handleRowClick}
      disableRowSelectionOnClick
      disableColumnSelector
      hideFooterSelectedRowCount
      
      // Styling
      sx={{
        border: 'none',
        '& .MuiDataGrid-cell': {
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiDataGrid-row:hover': {
          bgcolor: 'action.hover',
        },
        '& .MuiDataGrid-row.Mui-selected': {
          bgcolor: 'transparent',
        },
        '& .MuiDataGrid-row.Mui-selected:hover': {
          bgcolor: 'action.hover',
        },
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-cell:focus-within': {
          outline: 'none',
        },
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: 'background.paper',
          borderBottom: 2,
          borderColor: 'divider',
        },
      }}
    />
  );
}

export default RulesTable;