// src/components/rules/RulesTable.tsx
import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridRowParams,
} from '@mui/x-data-grid';
import { Chip, Box } from '@mui/material';
import { Rule } from '@/api/types';
import { formatDate, getSeverityColor } from '@/api/utils';

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
  const columns: GridColDef<Rule>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
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
    },
    {
      field: 'mitre_techniques',
      headerName: 'MITRE',
      width: 180,
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
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 90,
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
      pageSizeOptions={[10, 25, 50, 100]}
      paginationModel={{
        page: page - 1,
        pageSize,
      }}
      onPaginationModelChange={(model: GridPaginationModel) => {
        if (model.page !== page - 1) onPageChange(model.page + 1);
        if (model.pageSize !== pageSize) onPageSizeChange(model.pageSize);
      }}
      onRowClick={(params: GridRowParams<Rule>) => {
        onRuleSelect?.(params.row.rule_id);
      }}
      paginationMode="server"
      disableRowSelectionOnClick
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