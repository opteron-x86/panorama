// src/components/rules/MitreTechniquesDropdown.tsx

import React, { useState, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  ListItemText,
  Box,
  Chip,
  InputAdornment,
  ListSubheader,
  Typography,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useMitreTechniquesQuery } from '@/api/queries';

interface MitreTechniquesDropdownProps {
  value: string[];
  onChange: (techniques: string[]) => void;
  size?: 'small' | 'medium';
  minWidth?: number;
}

export function MitreTechniquesDropdown({
  value = [],
  onChange,
  size = 'small',
  minWidth = 200,
}: MitreTechniquesDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch all techniques without pagination for dropdown
  const { data, isLoading } = useMitreTechniquesQuery(
    { offset: 0, limit: 1000 }, 
    { include_deprecated: false }
  );

  const filteredTechniques = useMemo(() => {
    if (!data?.techniques) return [];
    if (!searchTerm) return data.techniques;

    const term = searchTerm.toLowerCase();
    return data.techniques.filter(
      (technique) =>
        technique.technique_id.toLowerCase().includes(term) ||
        technique.name.toLowerCase().includes(term)
    );
  }, [data?.techniques, searchTerm]);

  const handleChange = (event: any) => {
    const selected = event.target.value as string[];
    onChange(selected);
  };

  const handleRemoveChip = (techniqueId: string) => {
    onChange(value.filter(id => id !== techniqueId));
  };

  const renderValue = (selected: string[]) => {
    if (selected.length === 0) return '';
    return `${selected.length} technique${selected.length === 1 ? '' : 's'}`;
  };

  const getTechniqueName = (techniqueId: string) => {
    const technique = data?.techniques.find(t => t.technique_id === techniqueId);
    return technique ? `${technique.technique_id} - ${technique.name}` : techniqueId;
  };

  return (
    <FormControl size={size} sx={{ minWidth }}>
      <InputLabel>MITRE Techniques</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => {
          setIsOpen(false);
          setSearchTerm('');
        }}
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 450,
              width: 400,
            },
          },
          // Keep menu open when interacting with search field
          autoFocus: false,
        }}
      >
        {/* Search field pinned at top */}
        <ListSubheader
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1.5,
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search techniques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <CloseIcon
                    fontSize="small"
                    sx={{ cursor: 'pointer', opacity: 0.6, '&:hover': { opacity: 1 } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </ListSubheader>

        {/* Loading state */}
        {isLoading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={20} />
          </Box>
        )}

        {/* No results */}
        {!isLoading && filteredTechniques.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No techniques found' : 'No techniques available'}
            </Typography>
          </MenuItem>
        )}
        
        {/* Results count when searching */}
        {!isLoading && searchTerm && filteredTechniques.length > 0 && (
          <MenuItem disabled sx={{ py: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {filteredTechniques.length} technique{filteredTechniques.length === 1 ? '' : 's'} found
            </Typography>
          </MenuItem>
        )}

        {/* Technique list */}
        {filteredTechniques.map((technique) => (
          <MenuItem
            key={technique.technique_id}
            value={technique.technique_id}
            sx={{ 
              whiteSpace: 'normal',
              py: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.Mui-selected': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <Checkbox 
              checked={value.includes(technique.technique_id)} 
              size="small"
              sx={{ mr: 1 }}
            />
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {technique.technique_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {technique.name}
                  </Typography>
                </Box>
              }
              sx={{ my: 0 }}
            />
          </MenuItem>
        ))}
      </Select>

      {/* Selected techniques chips */}
      {value.length > 0 && !isOpen && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {value.slice(0, 2).map((techniqueId) => (
            <Chip
              key={techniqueId}
              label={techniqueId}
              size="small"
              onDelete={() => handleRemoveChip(techniqueId)}
              title={getTechniqueName(techniqueId)}
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          ))}
          {value.length > 2 && (
            <Chip
              label={`+${value.length - 2} more`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Box>
      )}
    </FormControl>
  );
}

export default MitreTechniquesDropdown;