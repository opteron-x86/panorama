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
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
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
  Clear as ClearIcon,
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

// MITRE ATT&CK kill chain order
const TACTIC_ORDER = [
  'reconnaissance',
  'resource-development',
  'initial-access',
  'execution',
  'persistence',
  'privilege-escalation',
  'defense-evasion',
  'credential-access',
  'discovery',
  'lateral-movement',
  'collection',
  'command-and-control',
  'exfiltration',
  'impact'
];

// Available platforms 
const AVAILABLE_PLATFORMS = [
  'Enterprise',
  'PRE',
  'Windows',
  'macOS',
  'Linux',
  'Cloud',
  'Office Suite',
  'Identity Provider',
  'SaaS',
  'IaaS',
  'Network Devices',
  'Containers',
  'ESXi'
];

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
  const theme = useTheme();
  const coverage = getCoverageInfo(technique.rule_count);
  const hasSubtechniques = technique.subtechniques.length > 0;
  
  // Calculate aggregate coverage including subtechniques
  const totalRuleCount = technique.rule_count + 
    technique.subtechniques.reduce((sum, sub) => sum + sub.rule_count, 0);
  const aggregateCoverage = getCoverageInfo(totalRuleCount);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubtechniques) {
      onToggleExpand();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' 
          ? totalRuleCount > 0 ? `${aggregateCoverage.color}.dark` : 'background.paper'
          : totalRuleCount > 0 ? `${aggregateCoverage.color}.50` : 'background.paper',
      }}
    >
      <Box
        sx={{
          p: 2,
          cursor: hasSubtechniques ? 'default' : 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' 
              ? 'action.hover' 
              : 'action.hover',
          },
        }}
        onClick={!hasSubtechniques ? () => onClick(technique.technique_id) : undefined}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box 
            flex={1}
            onClick={hasSubtechniques ? () => onClick(technique.technique_id) : undefined}
            sx={{ cursor: hasSubtechniques ? 'pointer' : 'default' }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography 
                variant="subtitle2" 
                fontWeight="bold" 
                color="primary"
              >
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
            {technique.platforms && technique.platforms.length > 0 && (
              <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                {technique.platforms.map((platform: string) => (
                  <Chip
                    key={platform}
                    label={platform}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem', mb: 0.5 }}
                  />
                ))}
              </Stack>
            )}
          </Box>
          {hasSubtechniques && (
            <IconButton size="small" onClick={handleExpandClick}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Stack>
      </Box>
      
      {/* Subtechniques */}
      <Collapse in={expanded}>
        {hasSubtechniques && (
          <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
            <Divider />
            {technique.subtechniques.map((sub) => {
              const subCoverage = getCoverageInfo(sub.rule_count);
              return (
                <Box
                  key={sub.technique_id}
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => onClick(sub.technique_id)}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SubtechniqueIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="primary" fontWeight={500}>
                      {sub.technique_id}
                    </Typography>
                    <Chip
                      icon={subCoverage.icon}
                      label={subCoverage.label}
                      size="small"
                      color={subCoverage.color}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    {sub.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

export default function AttackMatrix() {
  const theme = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedTechniques, setExpandedTechniques] = useState<Set<string>>(new Set());
  
  // Pass single platform or undefined
  const { data, isLoading, error, refetch } = useMitreMatrixQuery(
    selectedPlatform || undefined
  );

  const handlePlatformChange = (event: SelectChangeEvent<string>) => {
    setSelectedPlatform(event.target.value);
  };

  const handleClearPlatform = () => {
    setSelectedPlatform('');
  };

  // Sort tactics by kill chain order
  const sortedData = useMemo(() => {
    if (!data) return null;
    
    const sortedMatrix = [...data.matrix].sort((a, b) => {
      const aIndex = TACTIC_ORDER.indexOf(a.tactic_id.toLowerCase());
      const bIndex = TACTIC_ORDER.indexOf(b.tactic_id.toLowerCase());
      
      // If not found in order, put at end
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
    
    return { ...data, matrix: sortedMatrix };
  }, [data]);

  // Group techniques by parent/subtechnique relationship
  const groupedData = useMemo(() => {
    if (!sortedData) return null;

    return {
      ...sortedData,
      matrix: sortedData.matrix.map((tactic: any) => {
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
  }, [sortedData]);

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTechniqueClick = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    setDetailsOpen(true);
  };

  const toggleTechniqueExpansion = (techniqueId: string) => {
    setExpandedTechniques(prev => {
      const newSet = new Set(prev);
      if (newSet.has(techniqueId)) {
        newSet.delete(techniqueId);
      } else {
        newSet.add(techniqueId);
      }
      return newSet;
    });
  };

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      {/* Header - Matching RulesExplorer/CveExplorer style */}
      <Paper sx={{ p: 2, mb: 2, mx: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">MITRE ATT&CK</Typography>
            
            {/* Coverage Badge */}
            <Stack direction="row" spacing={2}>
              <Chip
                icon={<SecurityIcon />}
                label={`${coverageStats.covered}/${coverageStats.total} techniques`}
                color="primary"
                variant="outlined"
              />
              <Box sx={{ minWidth: 100 }}>
                <Typography variant="caption" color="text.secondary">
                  Coverage: {coverageStats.percentage}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={coverageStats.percentage}
                  color={coverageStats.percentage > 70 ? 'success' : coverageStats.percentage > 40 ? 'warning' : 'error'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Stack>
          </Box>

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

            {/* Platform Filter - Single Select */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={selectedPlatform}
                onChange={handlePlatformChange}
                input={<OutlinedInput label="Platform" />}
                displayEmpty
              >
                <MenuItem value="">

                </MenuItem>
                {AVAILABLE_PLATFORMS.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedPlatform && (
              <Button
                size="small"
                onClick={handleClearPlatform}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          mx: 2,
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        }}
      >
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
          {filteredData?.matrix.map((tactic: any) => {
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
                      max={99}
                    />
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Content */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          mx: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.default',
        }}
      >
        {filteredData?.matrix.map((tactic: any, index: number) => (
          <TabPanel key={tactic.tactic_id} value={tabValue} index={index}>
            {tactic.techniques.length === 0 ? (
              <Alert severity="info">
                No techniques found for this tactic
              </Alert>
            ) : (
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 2,
                alignItems: 'start', // Critical: allows independent card heights
              }}>
                {tactic.techniques.map((technique: GroupedTechnique) => (
                  <TechniqueCard
                    key={technique.technique_id}
                    technique={technique}
                    onClick={handleTechniqueClick}
                    expanded={expandedTechniques.has(technique.technique_id)}
                    onToggleExpand={() => toggleTechniqueExpansion(technique.technique_id)}
                  />
                ))}
              </Box>
            )}
          </TabPanel>
        ))}
      </Box>

      {/* Technique Details Drawer */}
      {selectedTechnique && (
        <TechniqueDetailDrawer
          techniqueId={selectedTechnique}
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedTechnique(null);
          }}
        />
      )}
    </Box>
  );
}