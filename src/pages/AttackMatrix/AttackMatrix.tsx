// src/pages/AttackMatrix/AttackMatrix.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SubdirectoryArrowRight as SubtechniqueIcon,
} from '@mui/icons-material';
import { useMitreMatrixQuery } from '@/api/queries';
import { ErrorDisplay, LoadingIndicator } from '@/components/common';
import { MitreTactic } from '@/api/types';
import TechniqueDetailDrawer from '@/components/mitre/TechniqueDetailDrawer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface GroupedTechnique {
  technique_id: string;
  name: string;
  rule_count: number;
  platforms?: string[];
  subtechniques: Array<{
    technique_id: string;
    name: string;
    rule_count: number;
    platforms?: string[];
  }>;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tactic-tabpanel-${index}`}
      aria-labelledby={`tactic-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function getCoverageInfo(ruleCount: number) {
  if (ruleCount === 0) {
    return { 
      color: 'error' as const, 
      icon: <WarningIcon fontSize="small" />, 
      label: 'No Coverage',
    };
  }
  if (ruleCount < 5) {
    return { 
      color: 'warning' as const, 
      icon: <InfoIcon fontSize="small" />, 
      label: `${ruleCount} rule${ruleCount > 1 ? 's' : ''}`,
    };
  }
  return { 
    color: 'success' as const, 
    icon: <CheckCircleIcon fontSize="small" />, 
    label: `${ruleCount} rules`,
  };
}

function TechniqueCard({ 
  technique, 
  onClick,
  expanded,
  onToggleExpand,
}: { 
  technique: GroupedTechnique;
  onClick: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const coverage = getCoverageInfo(technique.rule_count);
  const hasSubtechniques = technique.subtechniques.length > 0;
  
  // Calculate aggregate coverage including subtechniques
  const totalRuleCount = technique.rule_count + 
    technique.subtechniques.reduce((sum, sub) => sum + sub.rule_count, 0);
  const aggregateCoverage = getCoverageInfo(totalRuleCount);

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: totalRuleCount > 0 ? `${aggregateCoverage.color}.50` : 'background.paper',
      }}
    >
      <Box
        sx={{
          p: 2,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => hasSubtechniques ? onToggleExpand() : onClick(technique.technique_id)}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                {technique.technique_id}
              </Typography>
              <Chip
                icon={coverage.icon}
                label={coverage.label}
                size="small"
                color={coverage.color}
                variant="outlined"
              />
              {hasSubtechniques && (
                <Chip
                  label={`${technique.subtechniques.length} subtechniques`}
                  size="small"
                  variant="filled"
                  color="default"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.primary">
              {technique.name}
            </Typography>
            {technique.platforms && (
              <Stack direction="row" spacing={0.5} mt={1}>
                {technique.platforms.map((platform: string) => (
                  <Chip
                    key={platform}
                    label={platform}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SecurityIcon color={aggregateCoverage.color} />
            {hasSubtechniques && (
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {hasSubtechniques && (
        <Collapse in={expanded}>
          <Divider />
          <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
            {technique.subtechniques.map((subtech) => {
              const subCoverage = getCoverageInfo(subtech.rule_count);
              return (
                <Box
                  key={subtech.technique_id}
                  onClick={() => onClick(subtech.technique_id)}
                  sx={{
                    p: 1.5,
                    mb: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SubtechniqueIcon fontSize="small" color="action" />
                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="500" color="primary">
                          {subtech.technique_id}
                        </Typography>
                        <Chip
                          icon={subCoverage.icon}
                          label={subCoverage.label}
                          size="small"
                          color={subCoverage.color}
                          variant="outlined"
                          sx={{ height: 18, '& .MuiChip-label': { px: 1 } }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {subtech.name}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
}

export default function AttackMatrix() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set());
  
  const { data, isLoading, error, refetch } = useMitreMatrixQuery(selectedPlatforms);

  // Group techniques by parent/subtechnique relationship
  const groupedData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      matrix: data.matrix.map((tactic: any) => {
        const techniqueMap = new Map<string, GroupedTechnique>();
        
        // First pass: identify parents and subtechniques
        tactic.techniques.forEach((tech: any) => {
          const parts = tech.technique_id.split('.');
          const isSubtechnique = parts.length > 1;
          
          if (isSubtechnique) {
            const parentId = parts[0];
            if (!techniqueMap.has(parentId)) {
              // Create placeholder parent if it doesn't exist
              techniqueMap.set(parentId, {
                technique_id: parentId,
                name: 'Parent Technique',
                rule_count: 0,
                platforms: [],
                subtechniques: [],
              });
            }
            techniqueMap.get(parentId)!.subtechniques.push(tech);
          } else {
            if (!techniqueMap.has(tech.technique_id)) {
              techniqueMap.set(tech.technique_id, {
                ...tech,
                subtechniques: [],
              });
            } else {
              // Update existing placeholder
              techniqueMap.set(tech.technique_id, {
                ...tech,
                subtechniques: techniqueMap.get(tech.technique_id)!.subtechniques,
              });
            }
          }
        });

        // Sort techniques and their subtechniques
        const sortedTechniques = Array.from(techniqueMap.values())
          .sort((a, b) => a.technique_id.localeCompare(b.technique_id));
        
        sortedTechniques.forEach(tech => {
          tech.subtechniques.sort((a, b) => 
            a.technique_id.localeCompare(b.technique_id)
          );
        });

        return {
          ...tactic,
          techniques: sortedTechniques,
        };
      }),
    };
  }, [data]);

  // Filter techniques based on search
  const filteredData = useMemo(() => {
    if (!groupedData || !searchQuery) return groupedData;

    const query = searchQuery.toLowerCase();
    
    return {
      ...groupedData,
      matrix: groupedData.matrix.map((tactic: any) => ({
        ...tactic,
        techniques: tactic.techniques.filter((technique: GroupedTechnique) => {
          // Check parent technique
          const parentMatch = 
            technique.name.toLowerCase().includes(query) ||
            technique.technique_id.toLowerCase().includes(query);
          
          // Check subtechniques
          const hasMatchingSubtechnique = technique.subtechniques.some(sub =>
            sub.name.toLowerCase().includes(query) ||
            sub.technique_id.toLowerCase().includes(query)
          );
          
          return parentMatch || hasMatchingSubtechnique;
        }),
      })),
    };
  }, [groupedData, searchQuery]);

  // Calculate coverage statistics
  const coverageStats = useMemo(() => {
    if (!data) return { total: 0, covered: 0, percentage: 0 };
    
    const allTechniques = data.matrix.flatMap((t: any) => t.techniques);
    const total = allTechniques.length;
    const covered = allTechniques.filter((t: any) => t.rule_count > 0).length;
    const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;
    
    return { total, covered, percentage };
  }, [data]);

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const handleTechniqueClick = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    setDetailsOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleExpanded = (techniqueId: string) => {
    setExpandedTechniques(prev => {
      const next = new Set(prev);
      if (next.has(techniqueId)) {
        next.delete(techniqueId);
      } else {
        next.add(techniqueId);
      }
      return next;
    });
  };

  const platforms = ['Windows', 'Linux', 'macOS', 'Cloud', 'Mobile'];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 0 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="600">
              MITRE ATT&CK Coverage Matrix
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore techniques by tactic and track detection coverage across your environment
            </Typography>
          </Box>

          {/* Coverage Stats */}
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Coverage</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight="bold">
                  {coverageStats.percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({coverageStats.covered}/{coverageStats.total})
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <LinearProgress 
                variant="determinate" 
                value={coverageStats.percentage} 
                sx={{ height: 8, borderRadius: 4, flex: 1 }}
              />
            </Box>
          </Stack>

          {/* Controls */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Search */}
            <TextField
              placeholder="Search techniques..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Platform Filters */}
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
                Platforms:
              </Typography>
              {platforms.map(platform => (
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
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {platform}
                </Button>
              ))}
              {selectedPlatforms.length > 0 && (
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => setSelectedPlatforms([])}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem',
            } 
          }}
        >
          {filteredData?.matrix.map((tactic: any, index: number) => {
            // Count all techniques including subtechniques
            const allTechniques = tactic.techniques.flatMap((t: GroupedTechnique) => 
              [t, ...t.subtechniques]
            );
            const techniqueCount = allTechniques.length;
            const coveredCount = allTechniques.filter((t: any) => t.rule_count > 0).length;
            
            return (
              <Tab
                key={tactic.tactic_id}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">{tactic.name}</Typography>
                    <Badge 
                      badgeContent={techniqueCount} 
                      color={coveredCount > 0 ? 'primary' : 'default'}
                      max={999}
                    />
                    {coveredCount > 0 && (
                      <Chip
                        label={`${Math.round((coveredCount / techniqueCount) * 100)}%`}
                        size="small"
                        color="success"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>
                }
                id={`tactic-tab-${index}`}
                aria-controls={`tactic-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
        {filteredData?.matrix.map((tactic: any, index: number) => (
          <TabPanel key={tactic.tactic_id} value={tabValue} index={index}>
            {tactic.techniques.length === 0 ? (
              <Alert severity="info">
                {searchQuery 
                  ? `No techniques found matching "${searchQuery}" in ${tactic.name}`
                  : `No techniques available for ${tactic.name}`}
              </Alert>
            ) : (
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                  gap: 2,
                  alignItems: 'start', // Prevent cards from stretching to row height
                }}
              >
                {tactic.techniques.map((technique: GroupedTechnique) => (
                  <TechniqueCard
                    key={technique.technique_id}
                    technique={technique}
                    onClick={handleTechniqueClick}
                    expanded={expandedTechniques.has(technique.technique_id)}
                    onToggleExpand={() => toggleExpanded(technique.technique_id)}
                  />
                ))}
              </Box>
            )}
          </TabPanel>
        ))}
      </Box>

      {/* Technique Details Drawer */}
      <TechniqueDetailDrawer
        techniqueId={selectedTechnique}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedTechnique(null);
        }}
      />
    </Box>
  );
}