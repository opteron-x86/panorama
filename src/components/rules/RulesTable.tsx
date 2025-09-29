// src/components/rules/RulesTable.tsx
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridRowParams,
  GridSortModel,
} from '@mui/x-data-grid';
import { Chip, Box } from '@mui/material';
import { Rule } from '@/api/types';
import { formatDate, formatDateOnly, getSeverityColor } from '@/api/utils';
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
  loading,
}: RulesTableProps) {
  const { sortBy, sortDir, setSorting } = useFilterStore();
  
  // Map backend field names to DataGrid sort model
  const sortModel: GridSortModel = sortBy ? [{
    field: sortBy,
    sort: sortDir || 'desc'
  }] : [];

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      setSorting(field, sort as 'asc' | 'desc');
    } else {
      // Default sorting when cleared
      setSorting('updated_date', 'desc');
    }
  };

  const columns: GridColDef<Rule>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 250,
      sortable: true,
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      sortable: true,
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
      sortable: true,
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      sortable: false, // Backend doesn't support sorting by source
    },
    {
      field: 'mitre_techniques',
      headerName: 'MITRE',
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
      headerName: 'Last Updated',
      width: 140,
      sortable: true,
      valueGetter: (value: any) => formatDateOnly(value),
    },
    {
      field: 'created_date',
      headerName: 'Created',
      width: 140,
      sortable: true,
      valueGetter: (value: any) => formatDateOnly(value),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 90,
      sortable: false,
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
      paginationModel={{
        page: page - 1,
        pageSize,
      }}
      onPaginationModelChange={(model: GridPaginationModel) => {
        if (model.page !== page - 1) onPageChange(model.page + 1);
        if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
      }}
      paginationMode="server"
      
      // Sorting configuration - server-side sorting
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={handleSortModelChange}
      
      // Row interaction
      onRowClick={(params: GridRowParams<Rule>) => {
        onRuleSelect?.(params.row.rule_id);
      }}
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