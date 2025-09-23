// src/components/rules/RuleDetailDrawer.tsx
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRuleQuery } from '@/api/queries';
import { getSeverityColor, formatDate } from '@/api/utils';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface RuleDetailDrawerProps {
  ruleId: string;
  open: boolean;
  onClose: () => void;
  // Optional context for when opened from CVE detail
  cveContext?: {
    cveId: string;
    onBack: () => void;
  };
}

export function RuleDetailDrawer({ 
  ruleId, 
  open, 
  onClose,
  cveContext 
}: RuleDetailDrawerProps) {
  const { data: rule, isLoading, error } = useRuleQuery(ruleId);
  const [tabValue, setTabValue] = useState(0);

  const handleCopyRule = () => {
    if (rule?.rule_content) {
      navigator.clipboard.writeText(rule.rule_content);
      toast.success('Rule content copied');
    }
  };

  const handleCopyId = () => {
    if (rule?.rule_id) {
      navigator.clipboard.writeText(rule.rule_id);
      toast.success('Rule ID copied');
    }
  };

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', md: 800 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          {cveContext && (
            <Box sx={{ mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={cveContext.onBack}
                size="small"
              >
                Back to {cveContext.cveId}
              </Button>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              {rule && (
                <>
                  <Typography variant="h5" gutterBottom>
                    {rule.name}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={rule.severity}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(rule.severity),
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                    <Chip label={rule.rule_type} size="small" />
                    <Chip 
                      label={rule.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={rule.is_active ? 'success' : 'default'}
                    />
                    <Chip label={rule.source} size="small" variant="outlined" />
                  </Stack>
                </>
              )}
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">Failed to load rule details</Alert>
          </Box>
        )}

        {rule && (
          <>
            <Tabs 
              value={tabValue} 
              onChange={(_, v) => setTabValue(v)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
            >
              <Tab label="Overview" />
              <Tab label="Rule Content" />
              <Tab label="MITRE Mapping" />
              <Tab label="CVEs" />
              <Tab label="Metadata" />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {/* Tab panels content remains the same as original */}
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography>
                      {rule.description || 'No description available'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Rule ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontFamily="monospace">{rule.rule_id}</Typography>
                      <Tooltip title="Copy ID">
                        <IconButton size="small" onClick={handleCopyId}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {rule.tags && rule.tags.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {rule.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {rule.confidence_score !== null && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Confidence Score
                      </Typography>
                      <Typography>{rule.confidence_score}%</Typography>
                    </Box>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {rule.rule_content ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyRule}
                        size="small"
                      >
                        Copy Rule
                      </Button>
                    </Box>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.900',
                        color: 'common.white',
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        '& code': {
                          fontFamily: 'inherit',
                        }
                      }}
                    >
                      <code>{rule.rule_content}</code>
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="info">Rule content not available</Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                {rule.mitre_details && rule.mitre_details.length > 0 ? (
                  <Stack spacing={2}>
                    {rule.mitre_details.map(technique => (
                      <Box 
                        key={technique.technique_id}
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip label={technique.technique_id} size="small" color="primary" />
                          <Typography variant="subtitle1">{technique.name}</Typography>
                        </Stack>
                        {technique.tactic && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Tactic: {technique.tactic}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No MITRE techniques mapped</Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                {rule.cve_details && rule.cve_details.length > 0 ? (
                  <Stack spacing={2}>
                    {rule.cve_details.map(cve => (
                      <Box 
                        key={cve.cve_id}
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle1">{cve.cve_id}</Typography>
                          <Chip 
                            label={cve.severity}
                            size="small"
                            sx={{
                              bgcolor: getSeverityColor(cve.severity),
                              color: 'white',
                            }}
                          />
                          {cve.cvss_score && (
                            <Chip label={`CVSS: ${cve.cvss_score}`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No CVEs associated</Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={4}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                    <Typography>{formatDate(rule.created_date)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography>{formatDate(rule.updated_date)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Source</Typography>
                    <Typography>{rule.source}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Internal ID</Typography>
                    <Typography fontFamily="monospace">{rule.id}</Typography>
                  </Box>
                </Stack>
              </TabPanel>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default RuleDetailDrawer;