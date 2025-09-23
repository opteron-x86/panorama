// src/components/rules/RuleFilterBar.tsx
import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useFilterStore } from '@/store/filterStore';
import { useFiltersQuery } from '@/api/queries';

export function RuleFilterBar() {
  const { filters, setFilters, clearFilters } = useFilterStore();
  const filtersQuery = useFiltersQuery();
  
  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0)
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search rules..."
          value={filters.query || ''}
          onChange={(e) => setFilters({ query: e.target.value || undefined })}
          sx={{ flex: '1 1 300px' }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
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
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            multiple
            value={filters.rule_types || []}
            onChange={(e) => setFilters({ 
              rule_types: e.target.value as string[] 
            })}
            renderValue={(selected) => selected.join(', ')}
          >
            {filtersQuery.data?.rule_types.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Source</InputLabel>
          <Select
            multiple
            value={filters.source_ids || []}
            onChange={(e) => setFilters({ 
              source_ids: e.target.value as string[] 
            })}
            renderValue={(selected) => selected.join(', ')}
          >
            {filtersQuery.data?.sources.map(source => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
          >
            Clear
          </Button>
        )}
      </Box>
    </Stack>
  );
}

export default RuleFilterBar;