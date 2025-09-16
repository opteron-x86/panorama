// src/components/rules/RuleDetail.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Link,
  Button,
  Alert,
  AlertTitle,
  Grid,
  Tabs,
  Tab,
  Slider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import StorageIcon from '@mui/icons-material/Storage';
import { RuleDetail as RuleDetailType, MitreMapping } from '@/api/types';
import { LoadingIndicator, ErrorDisplay } from '@/components/common';
import { formatDate } from '@/utils/format';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

interface RuleDetailProps {
  rule?: RuleDetailType | null;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isBookmarked?: boolean;
  onClose?: () => void;
  onBookmark?: (ruleId: string) => void;
  onShare?: (ruleId: string) => void;
  onUpdateDeprecated?: (ruleId: string) => void;
}

interface ExtendedRuleDetail extends RuleDetailType {
  metadata?: {
    author?: string;
    source_org?: string;
    data_sources?: string[];
    references?: string[];
    [key: string]: any;
  };
  source?: {
    id: number;
    name: string;
    source_type?: string;
  };
  updated_date?: string;
  name?: string;
}

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule: baseRule,
  isLoading = false,
  isError = false,
  error,
  isBookmarked = false,
  onClose,
  onBookmark,
  onShare,
  onUpdateDeprecated,
}) => {
  const theme = useTheme();
  const rule = baseRule as ExtendedRuleDetail | null | undefined;
  
  const [tabValue, setTabValue] = useState(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [showAllTechniques, setShowAllTechniques] = useState(false);
  const [dismissedDeprecationWarning, setDismissedDeprecationWarning] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    query: false,
    references: false,
    metadata: false,
  });

  const deprecationInfo = useMemo(() => {
    if (!rule?.deprecated_technique_warnings) {
      return { hasDeprecated: false, count: 0, hasRevoked: false, hasReplacements: false };
    }
    const warnings = rule.deprecated_technique_warnings;
    return {
      hasDeprecated: warnings.length > 0,
      count: warnings.length,
      hasRevoked: warnings.some(w => w.revoked),
      hasReplacements: warnings.some(w => w.superseded_by),
    };
  }, [rule?.deprecated_technique_warnings]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const filteredTechniques = useMemo(() => {
    if (!rule?.mitre_techniques) return [];
    if (showAllTechniques) return rule.mitre_techniques;
    return rule.mitre_techniques.filter(t => 
      (t.mapping_confidence ?? 1) >= confidenceThreshold
    );
  }, [rule?.mitre_techniques, showAllTechniques, confidenceThreshold]);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: theme.palette.error.main,
      high: theme.palette.error.light,
      medium: theme.palette.warning.main,
      low: theme.palette.info.main,
      informational: theme.palette.text.secondary,
    };
    return colors[severity?.toLowerCase()] || theme.palette.text.secondary;
  };

  const renderMitreTechnique = (technique: MitreMapping) => (
    <Paper
      key={technique.technique_id}
      variant="outlined"
      sx={{
        p: 2,
        mb: 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        borderColor: technique.is_deprecated
          ? theme.palette.warning.main
          : alpha(theme.palette.divider, 0.3),
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link
            href={`https://attack.mitre.org/techniques/${technique.technique_id.replace('.', '/')}/`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.875rem',
              color: 'primary.main',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {technique.technique_id}
            <OpenInNewIcon sx={{ fontSize: '0.875rem' }} />
          </Link>
          {technique.mapping_confidence && (
            <Chip
              label={`${(technique.mapping_confidence * 100).toFixed(0)}%`}
              size="small"
              variant="outlined"
              sx={{ opacity: 0.7 }}
            />
          )}
          {technique.is_deprecated && (
            <Chip
              label="Deprecated"
              size="small"
              color="warning"
              icon={<WarningIcon />}
            />
          )}
          {technique.revoked && (
            <Chip
              label="Revoked"
              size="small"
              color="error"
              icon={<ErrorIcon />}
            />
          )}
        </Box>
        <Typography variant="body2">{technique.name}</Typography>
        {technique.tactic && (
          <Chip
            label={technique.tactic}
            size="small"
            variant="outlined"
            sx={{ width: 'fit-content' }}
          />
        )}
        {technique.description && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {technique.description}
          </Typography>
        )}
      </Stack>
    </Paper>
  );

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <LoadingIndicator />
      </Box>
    );
  }

  if (isError || !rule) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay
          message={error?.message || "Failed to load rule details"}
          onRetry={onClose}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            p: 2,
            pb: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 400,
              pr: 12,
            }}
          >
            {rule.name || rule.title}
          </Typography>
        </Box>
        
        <Stack 
          direction="row" 
          spacing={0.5}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          {onShare && (
            <IconButton size="small" onClick={() => onShare(String(rule.id))}>
              <ShareIcon fontSize="small" />
            </IconButton>
          )}
          {onBookmark && (
            <IconButton size="small" onClick={() => onBookmark(String(rule.id))}>
              {isBookmarked ? <BookmarkIcon fontSize="small" color="primary" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          )}
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Deprecation Warning */}
        {deprecationInfo.hasDeprecated && !dismissedDeprecationWarning && (
          <Alert
            severity="warning"
            action={
              <Stack direction="row" spacing={1}>
                {onUpdateDeprecated && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => onUpdateDeprecated(String(rule.id))}
                  >
                    Update Mappings
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={() => setDismissedDeprecationWarning(true)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>Deprecated Techniques Detected</AlertTitle>
            This rule references {deprecationInfo.count} deprecated MITRE technique(s).
            {deprecationInfo.hasRevoked && " Some techniques have been revoked."}
            {deprecationInfo.hasReplacements && " Replacement techniques are available."}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Description */}
          <Typography variant="body2" color="text.secondary">
            {rule.description}
          </Typography>


          {/* Key Metadata */}
          <Paper
            variant="outlined"
            sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.3) }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    label={rule.severity}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getSeverityColor(rule.severity), 0.1),
                      color: getSeverityColor(rule.severity),
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rule.status}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Source
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rule.source?.name || rule.rule_source || 'Unknown'}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Source Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rule.source?.source_type || 'Community'}
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Author
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rule.metadata?.author || rule.author}
                  </Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Modified
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rule.modified_date || rule.updated_date ? 
                      formatDate(rule.modified_date || rule.updated_date || '') : '-'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Tags */}
          {rule.tags && rule.tags.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {rule.tags.map((tag: string, index: number) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Data Sources */}
          {rule.metadata?.data_sources && rule.metadata.data_sources.length > 0 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <StorageIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="subtitle2">
                  Data Sources
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {rule.metadata.data_sources.map((source: string, index: number) => (
                  <Chip
                    key={index}
                    label={source}
                    size="small"
                    variant="filled"
                    sx={{ 
                      mb: 0.5,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* References */}
          {rule.metadata?.references && rule.metadata.references.length > 0 && (
            <Accordion
              expanded={expandedSections.references}
              onChange={() => toggleSection('references')}
              elevation={0}
              sx={{ 
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: 48 }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LinkIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2">
                    References ({rule.metadata.references.length})
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {rule.metadata.references.map((ref: string, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.action.hover, 0.04),
                        },
                        p: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      <Link
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {ref}
                      </Link>
                      <IconButton
                        size="small"
                        onClick={() => window.open(ref, '_blank')}
                        sx={{ flexShrink: 0 }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable">
              <Tab label="Rule Query" />
              <Tab label={`MITRE ATT&CK (${rule.mitre_techniques?.length || 0})`} />
              <Tab label={`CVE References (${rule.cve_references?.length || 0})`} />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            {rule.rule_content && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  position: 'relative',
                }}
              >
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => copyToClipboard(rule.rule_content || '')}
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                }}>
                  {rule.rule_content}
                </pre>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              {rule.mitre_techniques && rule.mitre_techniques.length > 0 && (
                <>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Confidence Threshold
                      </Typography>
                      <Slider
                        value={confidenceThreshold}
                        onChange={(_, value) => setConfidenceThreshold(value as number)}
                        min={0}
                        max={1}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                        sx={{ flex: 1, maxWidth: 300 }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showAllTechniques}
                            onChange={(e) => setShowAllTechniques(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Show all"
                      />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Showing {filteredTechniques.length} of {rule.mitre_techniques.length} techniques
                    </Typography>
                    {filteredTechniques.map(renderMitreTechnique)}
                  </Box>
                </>
              )}

              {(!rule.mitre_techniques || rule.mitre_techniques.length === 0) && (
                <Alert severity="info">
                  <AlertTitle>No MITRE Techniques</AlertTitle>
                  This rule has not been mapped to any MITRE ATT&CK techniques yet.
                </Alert>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              {rule.cve_references && rule.cve_references.length > 0 ? (
                rule.cve_references.map((cve, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 2 }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link
                          href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {cve.cve_id}
                          <OpenInNewIcon sx={{ fontSize: '0.875rem' }} />
                        </Link>
                        <Chip
                          label={cve.severity}
                          size="small"
                          color={
                            cve.severity === 'critical' ? 'error' :
                            cve.severity === 'high' ? 'error' :
                            cve.severity === 'medium' ? 'warning' :
                            'info'
                          }
                        />
                        {cve.cvss_v3_score && (
                          <Chip
                            label={`CVSS: ${cve.cvss_v3_score}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {cve.description && (
                        <Typography variant="body2" color="text.secondary">
                          {cve.description}
                        </Typography>
                      )}
                      {cve.published_date && (
                        <Typography variant="caption" color="text.secondary">
                          Published: {formatDate(cve.published_date)}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Alert severity="info">
                  <AlertTitle>No CVE References</AlertTitle>
                  This rule does not reference any known CVEs.
                </Alert>
              )}
            </Stack>
          </TabPanel>
        </Stack>
      </Box>
    </Box>
  );
};

export default RuleDetail;