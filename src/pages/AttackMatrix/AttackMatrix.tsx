// src/pages/AttackMatrix/AttackMatrix.tsx
import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import { useMitreMatrixQuery } from '@/api/queries';
import { ErrorDisplay, LoadingIndicator } from '@/components/common';
import { MitreTactic } from '@/api/types';

export default function AttackMatrix() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { data, isLoading, error, refetch } = useMitreMatrixQuery(selectedPlatforms);

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const handleTechniqueClick = (techniqueId: string) => {
    console.log('Technique clicked:', techniqueId);
    // TODO: Open technique details drawer
  };

  const getTechniqueColor = (ruleCount: number) => {
    if (ruleCount === 0) return 'transparent';
    if (ruleCount < 5) return 'rgba(59, 130, 246, 0.1)';
    if (ruleCount < 10) return 'rgba(59, 130, 246, 0.3)';
    if (ruleCount < 20) return 'rgba(59, 130, 246, 0.5)';
    return 'rgba(59, 130, 246, 0.7)';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      <Paper sx={{ p: 2, mb: 2, mx: 2 }}>
        <Typography variant="h5" gutterBottom>
          MITRE ATT&CK Matrix
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {['Windows', 'Linux', 'macOS'].map(platform => (
            <Button
              key={platform}
              variant={selectedPlatforms.includes(platform) ? 'contained' : 'outlined'}
              size="small"
              onClick={() => {
                setSelectedPlatforms(prev =>
                  prev.includes(platform)
                    ? prev.filter(p => p !== platform)
                    : [...prev, platform]
                );
              }}
            >
              {platform}
            </Button>
          ))}
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
        <Grid container spacing={2}>
          {data?.matrix.map((tactic: MitreTactic) => (
            <Grid key={tactic.tactic_id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {tactic.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {tactic.technique_count} techniques
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {tactic.techniques.map(technique => (
                    <Box
                      key={technique.technique_id}
                      onClick={() => handleTechniqueClick(technique.technique_id)}
                      sx={{
                        p: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        bgcolor: getTechniqueColor(technique.rule_count),
                        border: '1px solid',
                        borderColor: technique.rule_count > 0 ? 'primary.light' : 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Typography variant="body2" fontWeight={technique.rule_count > 0 ? 500 : 400}>
                        {technique.technique_id}: {technique.name}
                      </Typography>
                      {technique.rule_count > 0 && (
                        <Typography variant="caption" color="primary">
                          {technique.rule_count} rules
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}