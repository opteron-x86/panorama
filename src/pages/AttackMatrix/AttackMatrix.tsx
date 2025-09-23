// src/pages/AttackMatrix/AttackMatrix.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useMitreMatrixQuery, useFiltersQuery } from '@/api/queries';
import { LoadingIndicator, ErrorDisplay } from '@/components/common';

export default function AttackMatrix() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const filtersQuery = useFiltersQuery();
  const matrixQuery = useMitreMatrixQuery(selectedPlatforms);
  
  if (matrixQuery.error) {
    return <ErrorDisplay error={matrixQuery.error} onRetry={matrixQuery.refetch} />;
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          MITRE ATT&CK Matrix
        </Typography>
        
        <FormControl sx={{ minWidth: 200, mt: 2 }}>
          <InputLabel>Platforms</InputLabel>
          <Select
            multiple
            value={selectedPlatforms}
            onChange={(e) => setSelectedPlatforms(e.target.value as string[])}
            renderValue={(selected) => selected.join(', ')}
          >
            {filtersQuery.data?.platforms.map(platform => (
              <MenuItem key={platform} value={platform}>
                {platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {matrixQuery.isLoading ? (
        <LoadingIndicator />
      ) : matrixQuery.data ? (
        <Grid container spacing={2}>
          {matrixQuery.data.matrix.map(tactic => (
            <Grid item key={tactic.tactic_id} xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tactic.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {tactic.technique_count} techniques
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {tactic.techniques.slice(0, 5).map(technique => (
                      <Chip
                        key={technique.technique_id}
                        label={`${technique.technique_id} (${technique.rule_count})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {tactic.techniques.length > 5 && (
                      <Chip
                        label={`+${tactic.techniques.length - 5} more`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">No data available</Alert>
      )}
    </Box>
  );
}