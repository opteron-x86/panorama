// src/pages/Dashboard/Dashboard.tsx
import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Stack,
  Paper,
  Alert,
  useTheme,
  Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';

// Icons
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LanguageIcon from '@mui/icons-material/Language';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

// Components
import { Card, ErrorDisplay } from '@/components/common';
import { StatCard, SeverityDonutChart, BreakdownCard, ActivityTrend } from './components';

// API
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/api/client';

// Types
interface DashboardData {
  metrics: {
    total_rules: number;
    active_rules: number;
    inactive_rules: number;
    rules_with_mitre: number;
    rules_with_cves: number;
    rules_with_both: number;
  };
  distributions: {
    by_severity: Record<string, number>;
    by_platform: Record<string, number>;
    by_source: Record<string, number>;
  };
  coverage: {
    total_techniques: number;
    covered_techniques: number;
    coverage_percentage: number;
  };
  trends: {
    daily_activity: Array<{
      date: string;
      rules_created: number;
      rules_updated: number;
    }>;
  };
}

// Transform trend data for ActivityTrend component
const transformTrendData = (dashboardData: DashboardData | undefined) => {
  if (!dashboardData?.trends?.daily_activity) return undefined;
  
  const dailyStats = dashboardData.trends.daily_activity.map(item => ({
    date: item.date,
    rules_created: item.rules_created,
    rules_updated: item.rules_updated,
    rules_deleted: 0
  }));

  const totalCreated = dailyStats.reduce((sum, stat) => sum + stat.rules_created, 0);
  const totalUpdated = dailyStats.reduce((sum, stat) => sum + stat.rules_updated, 0);
  
  return {
    daily_stats: dailyStats,
    summary: {
      total_created: totalCreated,
      total_updated: totalUpdated,
      total_deleted: 0,
      average_per_day: Math.round((totalCreated + totalUpdated) / Math.max(dailyStats.length, 1)),
      most_active_day: null
    }
  };
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/analytics/dashboard'),
    staleTime: 60 * 1000,
    retry: 2
  });

  // Calculate derived metrics
  const enrichmentPercentage = useMemo(() => {
    if (!data?.metrics) return 0;
    const { total_rules, rules_with_mitre } = data.metrics;
    return total_rules > 0 
      ? Math.round((rules_with_mitre / total_rules) * 100)
      : 0;
  }, [data]);

  const platformCount = useMemo(() => {
    if (!data?.distributions?.by_platform) return 0;
    return Object.keys(data.distributions.by_platform).length;
  }, [data]);

  const transformedTrendData = useMemo(() => 
    transformTrendData(data), 
    [data]
  );

  // Navigation handlers
  const handleNavigateToRules = (filter?: string) => {
    if (filter) {
      navigate(`/rules?platform=${encodeURIComponent(filter)}`);
    } else {
      navigate('/rules');
    }
  };

  const handleNavigateToMitre = () => navigate('/mitre');

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorDisplay 
          error={error as Error}
          title="Dashboard Error"
          message="Failed to load dashboard data"
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Security Analytics Dashboard
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary" mr={2}>
            Auto-refreshes every minute
          </Typography>
          <RefreshIcon 
            sx={{ 
              cursor: 'pointer', 
              color: 'action.active',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => refetch()}
          />
        </Box>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Detection Rules"
            value={data?.metrics.total_rules.toLocaleString() ?? '-'}
            icon={<SecurityIcon fontSize="large" />}
            isLoading={isLoading}
            color={theme.palette.primary.main}
            onClick={() => handleNavigateToRules()}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="MITRE Coverage"
            value={`${data?.coverage.coverage_percentage ?? 0}%`}
            icon={<HubIcon fontSize="large" />}
            isLoading={isLoading}
            color={theme.palette.success.main}
            trend={data?.coverage.coverage_percentage ? {
              value: data.coverage.coverage_percentage,
              direction: data.coverage.coverage_percentage >= 30 ? 'up' : 'down'
            } : undefined}
            onClick={handleNavigateToMitre}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Techniques Covered"
            value={data ? `${data.coverage.covered_techniques}/${data.coverage.total_techniques}` : '-'}
            icon={<AssessmentIcon fontSize="large" />}
            isLoading={isLoading}
            color={theme.palette.info.main}
            onClick={handleNavigateToMitre}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="MITRE Enrichment"
            value={`${enrichmentPercentage}%`}
            icon={<LanguageIcon fontSize="large" />}
            isLoading={isLoading}
            color={theme.palette.warning.main}
            trend={enrichmentPercentage > 0 ? {
              value: enrichmentPercentage,
              direction: enrichmentPercentage >= 50 ? 'up' : 'down'
            } : undefined}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SeverityDonutChart 
            data={data?.distributions.by_severity} 
            isLoading={isLoading} 
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {data?.distributions.by_platform && Object.keys(data.distributions.by_platform).length > 0 ? (
            <BreakdownCard
              title="Rules by Platform"
              data={data.distributions.by_platform}
              isLoading={isLoading}
              icon={<LanguageIcon />}
              onItemClick={handleNavigateToRules}
            />
          ) : (
            <Card sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isLoading ? (
                <Skeleton variant="rectangular" width="100%" height={300} />
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <WarningIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    No platform data available
                  </Typography>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Rules may not have platform metadata configured
                  </Typography>
                </Stack>
              )}
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Activity Trend */}
      {transformedTrendData && (
        <Grid container spacing={3} mb={3}>
          <Grid size={12}>
            <ActivityTrend
              data={transformedTrendData}
              isLoading={isLoading}
              daysBack={7}
              height={250}
            />
          </Grid>
        </Grid>
      )}

      {/* Summary Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Rule Status
            </Typography>
            <Stack spacing={1} mt={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Active Rules</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.metrics.active_rules.toLocaleString() ?? '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Inactive Rules</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.metrics.inactive_rules.toLocaleString() ?? '-'}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Enrichment Status
            </Typography>
            <Stack spacing={1} mt={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">With MITRE</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.metrics.rules_with_mitre.toLocaleString() ?? '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">With CVEs</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.metrics.rules_with_cves.toLocaleString() ?? '-'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Both</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.metrics.rules_with_both.toLocaleString() ?? '-'}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Platform Coverage
            </Typography>
            <Stack spacing={1} mt={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Platforms Covered</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {platformCount}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Coverage Rate</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data?.coverage.coverage_percentage ?? 0}%
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: 'action.hover',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => handleNavigateToRules()}
          >
            <Typography variant="body1">→ Browse Detection Rules</Typography>
          </Paper>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: 'action.hover',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={handleNavigateToMitre}
          >
            <Typography variant="body1">→ MITRE ATT&CK Matrix</Typography>
          </Paper>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              flex: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: 'action.hover',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate('/insights')}
          >
            <Typography variant="body1">→ Analytics & Insights</Typography>
          </Paper>
        </Stack>
      </Card>
    </Box>
  );
};

export default Dashboard;