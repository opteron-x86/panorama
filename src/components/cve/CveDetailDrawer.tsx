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
  
  // Fetch rules that reference this CVE - pass enabled in options spread
  const rulesQuery = useRulesQuery(
    { offset: 0, limit: 100 },
    open && !!cveId ? { cve_ids: [cveId] } : {}
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{cve?.cve_id || 'Loading...'}</Typography>
            <Stack direction="row" spacing={1}>
              {cve && (
                <IconButton onClick={() => handleCopy(cve.cve_id)} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
          
          {cve && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={cve.severity}
                size="small"
                sx={{
                  bgcolor: getSeverityColor(cve.severity),
                  color: 'white',
                  fontWeight: 500,
                }}
              />
              {cve.cvss_v3_score && (
                <Chip 
                  label={`CVSS: ${cve.cvss_v3_score}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Failed to load CVE details
          </Alert>
        ) : cve ? (
          <>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2 }}>
              <Tab label="Overview" />
              <Tab label={`Rules (${rulesQuery.data?.total || 0})`} />
              <Tab label="Technical Details" />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {cve.description}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Dates
                    </Typography>
                    <Stack spacing={1}>
                      {cve.published_date && (
                        <Typography variant="body2">
                          Published: {formatDate(cve.published_date)}
                        </Typography>
                      )}
                      {cve.modified_date && (
                        <Typography variant="body2">
                          Modified: {formatDate(cve.modified_date)}
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  {cve.cwe_ids?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        CWE References
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {cve.cwe_ids.map(cweId => (
                          <Chip key={cweId} label={cweId} size="small" variant="outlined" />
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
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Typography variant="subtitle1">{rule.name}</Typography>
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
                        </Stack>
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
        ) : null}
      </Box>
    </Drawer>
  );
}

export default CveDetailDrawer;