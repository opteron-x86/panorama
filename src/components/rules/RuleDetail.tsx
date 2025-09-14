// src/components/rules/RuleDetail.tsx

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
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
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VerifiedIcon from '@mui/icons-material/Verified';
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

const RuleDetail: React.FC<RuleDetailProps> = ({
  rule,
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
  
  const [tabValue, setTabValue] = useState(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(1.0);
  const [showAllTechniques, setShowAllTechniques] = useState(false);
  const [dismissedDeprecationWarning, setDismissedDeprecationWarning] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metadata: true,
    technical: false,
    references: false,
  });

  // Deprecation calculations
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
          <Typography variant="subtitle2" fontWeight="bold">
            {technique.technique_id}
          </Typography>
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
        {technique.description && (
          <Typography variant="caption" color="text.secondary">
            {technique.description}
          </Typography>
        )}
        {onBookmark && (
          <IconButton
            size="small"
            onClick={() => onBookmark(String(rule?.id))}
            sx={{ ml: 'auto' }}
          >
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
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
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Rule Details
          </Typography>
          {onShare && (
            <Tooltip title="Share">
              <IconButton size="small" onClick={() => onShare(String(rule.id))}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          )}
          {onBookmark && (
            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}>
              <IconButton size="small" onClick={() => onBookmark(String(rule.id))}>
                {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </Paper>

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

        {/* Basic Info */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {rule.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {rule.description}
            </Typography>
          </Box>

          {/* Metadata Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Severity
              </Typography>
              <Chip
                label={rule.severity}
                size="small"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  backgroundColor: alpha(getSeverityColor(rule.severity), 0.1),
                  color: getSeverityColor(rule.severity),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2">{rule.status}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Source
              </Typography>
              <Typography variant="body2">{rule.rule_source}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary">
                Modified
              </Typography>
              <Typography variant="body2">
                {rule.modified_date ? formatDate(rule.modified_date) : '-'}
              </Typography>
            </Grid>
          </Grid>

          {/* Tags */}
          {rule.tags && rule.tags.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {rule.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Technical Details" />
              <Tab label="MITRE ATT&CK" />
              <Tab label="CVE References" />
              <Tab label="Metadata" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              {/* Rule Content */}
              {rule.rule_content && (
                <Accordion
                  expanded={expandedSections.technical}
                  onChange={() => toggleSection('technical')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Rule Query</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
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
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                      }}>
                        {rule.rule_content}
                      </pre>
                    </Paper>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Platforms */}
              {rule.rule_platforms && rule.rule_platforms.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Platforms
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {rule.rule_platforms.map((platform, index) => (
                      <Chip
                        key={index}
                        label={platform}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              {/* Confidence Filter */}
              {rule.mitre_techniques && rule.mitre_techniques.length > 0 && (
                <>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
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
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAllTechniques}
                          onChange={(e) => setShowAllTechniques(e.target.checked)}
                        />
                      }
                      label="Show all techniques"
                    />
                  </Box>

                  {/* Techniques List */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Mapped Techniques ({filteredTechniques.length})
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
                        <Typography variant="subtitle2" fontWeight="bold">
                          {cve.cve_id}
                        </Typography>
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

          <TabPanel value={tabValue} index={3}>
            <Stack spacing={2}>
              {/* Author Info */}
              {rule.author && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Author
                  </Typography>
                  <Typography variant="body2">{rule.author}</Typography>
                </Box>
              )}

              {/* SIEM Platform */}
              {rule.siem_platform && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    SIEM Platform
                  </Typography>
                  <Typography variant="body2">{rule.siem_platform}</Typography>
                </Box>
              )}

              {/* Data Sources */}
              {rule.data_sources && rule.data_sources.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data Sources
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {rule.data_sources.map((source, index) => (
                      <Chip
                        key={index}
                        label={source}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Additional Metadata */}
              {rule.rule_metadata && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Raw Metadata</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <pre style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}>
                      {JSON.stringify(rule.rule_metadata, null, 2)}
                    </pre>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          </TabPanel>
        </Stack>
      </Box>
    </Box>
  );
};

export default RuleDetail;