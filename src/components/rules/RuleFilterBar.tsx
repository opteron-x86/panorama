// src/components/rules/RuleFilterBar.tsx
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useFilterStore } from '@/store/filterStore';
import { useFiltersQuery } from '@/api/queries';
import { MitreTechniquesDropdown } from './MitreTechniquesDropdown';

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
        
        <FormControl 
          size="small" 
          sx={{ minWidth: 150 }}
          variant="outlined"
        >
          <InputLabel 
            id="severity-label"
            shrink={filters.severities && filters.severities.length > 0}
          >
            Severity
          </InputLabel>
          <Select<string[]>
            labelId="severity-label"
            multiple
            value={filters.severities || []}
            onChange={(e: SelectChangeEvent<string[]>) => setFilters({ 
              severities: e.target.value as string[] 
            })}
            renderValue={(selected) => (selected as string[]).join(', ')}
            label="Severity"
            notched={filters.severities && filters.severities.length > 0}
          >
            {filtersQuery.data?.severities.map(severity => (
              <MenuItem key={severity} value={severity}>
                {severity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl 
          size="small" 
          sx={{ minWidth: 150 }}
          variant="outlined"
        >
          <InputLabel 
            id="type-label"
            shrink={filters.rule_types && filters.rule_types.length > 0}
          >
            Type
          </InputLabel>
          <Select<string[]>
            labelId="type-label"
            multiple
            value={filters.rule_types || []}
            onChange={(e: SelectChangeEvent<string[]>) => setFilters({ 
              rule_types: e.target.value as string[] 
            })}
            renderValue={(selected) => (selected as string[]).join(', ')}
            label="Type"
            notched={filters.rule_types && filters.rule_types.length > 0}
          >
            {filtersQuery.data?.rule_types.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl 
          size="small" 
          sx={{ minWidth: 150 }}
          variant="outlined"
        >
          <InputLabel 
            id="source-label"
            shrink={filters.source_ids && filters.source_ids.length > 0}
          >
            Source
          </InputLabel>
          <Select<string[]>
            labelId="source-label"
            multiple
            value={filters.source_ids || []}
            onChange={(e: SelectChangeEvent<string[]>) => setFilters({ 
              source_ids: e.target.value as string[] 
            })}
            renderValue={(selected) => (selected as string[]).join(', ')}
            label="Source"
            notched={filters.source_ids && filters.source_ids.length > 0}
          >
            {filtersQuery.data?.sources.map(source => (
              <MenuItem key={source.value} value={source.value}>
                {source.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* MITRE Techniques Dropdown */}
        <MitreTechniquesDropdown
          value={filters.mitre_techniques || []}
          onChange={(techniques) => setFilters({ 
            mitre_techniques: techniques.length > 0 ? techniques : undefined 
          })}
          size="small"
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
      </Box>
    </Stack>
  );
}

export default RuleFilterBar;