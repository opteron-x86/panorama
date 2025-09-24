// src/components/mitre/TechniqueDetailDrawer.tsx
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SubdirectoryArrowRight as SubtechniqueIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useTechniqueDetailQuery } from '@/api/queries';
import { LoadingIndicator } from '@/components/common';

interface TechniqueDetailDrawerProps {
  techniqueId: string | null;
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`technique-tabpanel-${index}`}
      aria-labelledby={`technique-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function getCoverageColor(level: string) {
  switch (level) {
    case 'high': return 'success';
    case 'medium': return 'warning';
    case 'low': return 'error';
    default: return 'inherit';
  }
}

function getCoverageIcon(level: string) {
  switch (level) {
    case 'high': return <CheckCircleIcon />;
    case 'medium': return <InfoIcon />;
    case 'low': return <WarningIcon />;
    default: return <SecurityIcon />;
  }
}

export default function TechniqueDetailDrawer({
  techniqueId,
  open,
  onClose,
}: TechniqueDetailDrawerProps) {
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description']));
  
  const { data: technique, isLoading, error } = useTechniqueDetailQuery(techniqueId);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 600 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              {technique && (
                <>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Chip
                      label={technique.technique_id}
                      color="primary"
                      size="small"
                    />
                    {technique.is_deprecated && (
                      <Chip label="Deprecated" color="error" size="small" />
                    )}
                    {technique.revoked && (
                      <Chip label="Revoked" color="error" size="small" />
                    )}
                  </Stack>
                  <Typography variant="h5" gutterBottom>
                    {technique.name}
                  </Typography>
                  {technique.tactic && (
                    <Typography variant="body2" color="text.secondary">
                      Tactic: {technique.tactic.name}
                    </Typography>
                  )}
                </>
              )}
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {isLoading && (
          <Box sx={{ p: 3 }}>
            <LoadingIndicator />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">Failed to load technique details</Alert>
          </Box>
        )}

        {technique && (
          <>
            {/* Coverage Summary */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  {getCoverageIcon(technique.coverage.coverage_level)}
                  <Typography variant="subtitle1" fontWeight="bold">
                    Detection Coverage
                  </Typography>
                </Stack>
                <Chip
                  label={`${technique.coverage.rule_count} detection rules`}
                  color={getCoverageColor(technique.coverage.coverage_level)}
                  size="small"
                />
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(technique.coverage.rule_count * 20, 100)}
                    color={getCoverageColor(technique.coverage.coverage_level)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 3,
              }}
            >
              <Tab label="Overview" />
              <Tab label={`Detection Rules (${technique.coverage.rule_count})`} />
              <Tab label="Technical Details" />
              {technique.related_techniques.length > 0 && (
                <Tab label={`Related (${technique.related_techniques.length})`} />
              )}
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={2}>
                  {/* Description */}
                  <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <ListItemButton
                      onClick={() => toggleSection('description')}
                      sx={{ borderBottom: expandedSections.has('description') ? 1 : 0, borderColor: 'divider' }}
                    >
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText primary="Description" />
                      {expandedSections.has('description') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                    <Collapse in={expandedSections.has('description')}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {technique.description || 'No description available'}
                        </Typography>
                      </Box>
                    </Collapse>
                  </Paper>

                  {/* Platforms */}
                  {technique.platforms.length > 0 && (
                    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Platforms
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {technique.platforms.map(platform => (
                          <Chip
                            key={platform}
                            label={platform}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Mitigations */}
                  {technique.mitigation_description && (
                    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                      <ListItemButton
                        onClick={() => toggleSection('mitigations')}
                        sx={{ borderBottom: expandedSections.has('mitigations') ? 1 : 0, borderColor: 'divider' }}
                      >
                        <ListItemIcon>
                          <ShieldIcon />
                        </ListItemIcon>
                        <ListItemText primary="Mitigations" />
                        {expandedSections.has('mitigations') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItemButton>
                      <Collapse in={expandedSections.has('mitigations')}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" whiteSpace="pre-wrap">
                            {technique.mitigation_description}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Paper>
                  )}

                  {/* Detection */}
                  {technique.detection_description && (
                    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                      <ListItemButton
                        onClick={() => toggleSection('detection')}
                        sx={{ borderBottom: expandedSections.has('detection') ? 1 : 0, borderColor: 'divider' }}
                      >
                        <ListItemIcon>
                          <BugReportIcon />
                        </ListItemIcon>
                        <ListItemText primary="Detection Guidance" />
                        {expandedSections.has('detection') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItemButton>
                      <Collapse in={expandedSections.has('detection')}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" whiteSpace="pre-wrap">
                            {technique.detection_description}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Paper>
                  )}
                </Stack>
              </TabPanel>

              {/* Detection Rules Tab */}
              <TabPanel value={tabValue} index={1}>
                {technique.detection_rules.length > 0 ? (
                  <Stack spacing={1}>
                    {technique.detection_rules.map(rule => (
                      <Paper
                        key={rule.rule_id}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2">{rule.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rule.rule_id}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={rule.severity}
                              size="small"
                              color={
                                rule.severity === 'critical' ? 'error' :
                                rule.severity === 'high' ? 'warning' :
                                'default'
                              }
                            />
                            {rule.confidence && (
                              <Chip
                                label={`${Math.round(rule.confidence * 100)}% confidence`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="warning">
                    No detection rules mapped to this technique yet
                  </Alert>
                )}
              </TabPanel>

              {/* Technical Details Tab */}
              <TabPanel value={tabValue} index={2}>
                <Stack spacing={2}>
                  {/* Data Sources */}
                  {technique.data_sources.length > 0 && (
                    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <StorageIcon fontSize="small" />
                        <Typography variant="subtitle2">Data Sources</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {technique.data_sources.map(source => (
                          <Chip key={source} label={source} size="small" />
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Kill Chain Phases */}
                  {technique.kill_chain_phases.length > 0 && (
                    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <SecurityIcon fontSize="small" />
                        <Typography variant="subtitle2">Kill Chain Phases</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {technique.kill_chain_phases.map(phase => (
                          <Chip key={phase} label={phase} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Metadata */}
                  <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>Metadata</Typography>
                    <Stack spacing={1}>
                      {technique.version && (
                        <Typography variant="body2" color="text.secondary">
                          Version: {technique.version}
                        </Typography>
                      )}
                      {technique.created_date && (
                        <Typography variant="body2" color="text.secondary">
                          Created: {new Date(technique.created_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {technique.updated_date && (
                        <Typography variant="body2" color="text.secondary">
                          Updated: {new Date(technique.updated_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {technique.deprecated_date && (
                        <Typography variant="body2" color="text.secondary">
                          Deprecated: {new Date(technique.deprecated_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {technique.deprecation_reason && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Deprecation reason: {technique.deprecation_reason}
                        </Alert>
                      )}
                      {technique.superseded_by && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Superseded by: {technique.superseded_by}
                        </Alert>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </TabPanel>

              {/* Related Techniques Tab */}
              {technique.related_techniques.length > 0 && (
                <TabPanel value={tabValue} index={3}>
                  <Stack spacing={1}>
                    {technique.related_techniques.map(related => (
                      <Paper
                        key={related.technique_id}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => {
                          // Update the drawer to show the related technique
                          // This will trigger a re-render with new data
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {related.relationship === 'subtechnique' && <SubtechniqueIcon fontSize="small" />}
                          <Chip
                            label={related.technique_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2">{related.name}</Typography>
                          <Chip
                            label={related.relationship}
                            size="small"
                            variant="filled"
                            color="default"
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </TabPanel>
              )}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}