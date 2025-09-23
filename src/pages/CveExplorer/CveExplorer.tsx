// src/pages/CveExplorer/CveExplorer.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowParams,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import { useCvesQuery, useFiltersQuery } from '@/api/queries';
import { Cve } from '@/api/types';
import { CveDetailDrawer } from '@/components/cve';
import { useCveStore } from '@/store/cveStore';
import { pageToOffset } from '@/api/pagination';
import { getSeverityColor, formatDateOnly } from '@/api/utils';

export default function CveExplorer() {
  const { filters, page, pageSize, setFilters, clearFilters, setPage, setPageSize } = useCveStore();
  const filtersQuery = useFiltersQuery();
  const [selectedCveId, setSelectedCveId] = useState<string | null>(null);
  
  const pagination = pageToOffset(page, pageSize);
  const cvesQuery = useCvesQuery(pagination, filters);
  
  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0)
  );
  
  const columns: GridColDef<Cve>[] = [
    {
      field: 'cve_id',
      headerName: 'CVE ID',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 350,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
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
      field: 'cvss_score',
      headerName: 'CVSS',
      width: 80,
      renderCell: (params) => {
        if (!params.value) return '-';
        return (
          <Typography variant="body2" fontWeight={600}>
            {Number(params.value).toFixed(1)}
          </Typography>
        );
      },
    },
    {
      field: 'published_date',
      headerName: 'Published',
      width: 140,
      renderCell: (params) => {
        if (!params.value) return '-';
        return formatDateOnly(params.value);
      },
    },
  ];
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      <Paper sx={{ p: 2, mb: 2, mx: 2 }}>
        <Typography variant="h5" gutterBottom>
          CVE Database
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            size="small"
            placeholder="Search CVEs..."
            value={filters.query || ''}
            onChange={(e) => setFilters({ query: e.target.value || undefined })}
            sx={{ flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              multiple
              value={filters.severities || []}
              onChange={(e) => setFilters({ 
                severities: e.target.value as string[] 
              })}
              renderValue={(selected) => selected.join(', ')}
            >
              {filtersQuery.data?.severities.map(severity => (
                <MenuItem key={severity} value={severity}>
                  {severity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            type="number"
            label="Days Back"
            value={filters.days_back || ''}
            onChange={(e) => setFilters({ 
              days_back: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            sx={{ width: 120 }}
          />
          
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Paper>
      
      <Paper sx={{ flex: 1, display: 'flex', mx: 2 }}>
        <DataGrid
          rows={cvesQuery.data?.cves || []}
          columns={columns}
          getRowId={(row) => row.cve_id}
          rowCount={cvesQuery.data?.total || 0}
          loading={cvesQuery.isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{
            page: page - 1,
            pageSize,
          }}
          onPaginationModelChange={(model: GridPaginationModel) => {
            if (model.page !== page - 1) setPage(model.page + 1);
            if (model.pageSize !== pageSize) setPageSize(model.pageSize);
          }}
          onRowClick={(params: GridRowParams<Cve>) => {
            setSelectedCveId(params.row.cve_id);
          }}
          paginationMode="server"
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
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
      </Paper>

      {selectedCveId && (
        <CveDetailDrawer
          cveId={selectedCveId}
          open={!!selectedCveId}
          onClose={() => setSelectedCveId(null)}
        />
      )}
    </Box>
  );
}