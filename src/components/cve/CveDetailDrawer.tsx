// src/components/cve/CveDetailDrawer.tsx
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useCveQuery, useRulesQuery } from '@/api/queries';
import { getSeverityColor, formatDate } from '@/api/utils';
import { RuleDetailDrawer } from '@/components/rules';
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

interface CveDetailDrawerProps {
  cveId: string;
  open: boolean;
  onClose: () => void;
}

export function CveDetailDrawer({ cveId, open, onClose }: CveDetailDrawerProps) {
  const { data: cve, isLoading, error } = useCveQuery(open ? cveId : undefined);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  // Fetch rules that reference this CVE
  const rulesQuery = useRulesQuery(
    { offset: 0, limit: 100 },
    open && !!cveId ? 
      { cve_ids: [cveId] } : undefined,
    { enabled: open && !!cveId }
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(cveId);
    toast.success('CVE ID copied');
  };

  const handleRuleClick = (ruleId: string) => {
    setSelectedRuleId(ruleId);
  };

  const handleRuleDrawerBack = () => {
    setSelectedRuleId(null);
  };

  const handleRuleDrawerClose = () => {
    // Close both rule and CVE drawers
    setSelectedRuleId(null);
    onClose();
  };

  return (
    <>
      <Drawer 
        anchor="right" 
        open={open && !selectedRuleId} 
        onClose={onClose}
        PaperProps={{
          sx: { 
            width: { xs: '100%', md: 800 }
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="h5" gutterBottom>
                  {cveId}
                </Typography>
                {cve && (
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={cve.severity}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(cve.severity),
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                    {cve.cvss_score && (
                      <Chip label={`CVSS ${cve.cvss_score}`} size="small" />
                    )}
                    <IconButton size="small" onClick={handleCopyId}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
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
              <Alert severity="error">Failed to load CVE details</Alert>
            </Box>
          )}

          {cve && (
            <>
              <Tabs 
                value={tabValue} 
                onChange={(_, v) => setTabValue(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
              >
                <Tab label="Overview" />
                <Tab label="Linked Rules" />
                <Tab label="Technical Details" />
              </Tabs>

              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <TabPanel value={tabValue} index={0}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography>
                        {cve.description || 'No description available'}
                      </Typography>
                    </Box>

                    {cve.published_date && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Published Date
                        </Typography>
                        <Typography>{formatDate(cve.published_date)}</Typography>
                      </Box>
                    )}

                    {cve.modified_date && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Modified
                        </Typography>
                        <Typography>{formatDate(cve.modified_date)}</Typography>
                      </Box>
                    )}

                    {cve.cwe_ids && cve.cwe_ids.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          CWE IDs
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {cve.cwe_ids.map(cwe => (
                            <Chip key={cwe} label={cwe} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {rulesQuery.isLoading ? (
                    <CircularProgress />
                  ) : rulesQuery.data?.rules.length ? (
                    <Stack spacing={2}>
                      {rulesQuery.data.rules.map(rule => (
                        <Box 
                          key={rule.rule_id}
                          onClick={() => handleRuleClick(rule.rule_id)}
                          sx={{ 
                            p: 2, 
                            border: 1, 
                            borderColor: 'divider',
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              bgcolor: 'action.hover',
                              borderColor: 'primary.main',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={500}>
                            {rule.name}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip 
                              label={rule.severity}
                              size="small"
                              sx={{
                                bgcolor: getSeverityColor(rule.severity),
                                color: 'white',
                              }}
                            />
                            <Chip label={rule.rule_type} size="small" variant="outlined" />
                            <Chip label={rule.source} size="small" variant="outlined" />
                            {rule.is_active && (
                              <Chip label="Active" size="small" color="success" />
                            )}
                          </Stack>
                          {rule.description && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {rule.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info">No rules currently reference this CVE</Alert>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Stack spacing={2}>
                    {cve.cvss_v3_vector && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          CVSS v3 Vector
                        </Typography>
                        <Typography fontFamily="monospace" variant="body2">
                          {cve.cvss_v3_vector}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Detection Coverage
                      </Typography>
                      <Typography>
                        {cve.rule_count || 0} detection rules available
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        External References
                      </Typography>
                      <Link 
                        href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on NVD
                      </Link>
                    </Box>
                  </Stack>
                </TabPanel>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Rule Detail Drawer with CVE context */}
      {selectedRuleId && (
        <RuleDetailDrawer
          ruleId={selectedRuleId}
          open={!!selectedRuleId}
          onClose={handleRuleDrawerClose}
          cveContext={{
            cveId: cveId,
            onBack: handleRuleDrawerBack
          }}
        />
      )}
    </>
  );
}

export default CveDetailDrawer;