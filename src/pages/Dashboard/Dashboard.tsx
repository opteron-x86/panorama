// src/pages/Dashboard/Dashboard.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Stack,
  IconButton,
  Tooltip,
  useTheme 
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';

// Icons
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import LanguageIcon from '@mui/icons-material/Language';

// Components
import { Card, ErrorDisplay } from '@/components/common';
import { 
  StatCard, 
  SeverityDonutChart, 
  BreakdownCard,
  PlatformCoveragePanel,
  CoverageGapsPanel,
  RecentActivityPanel,
  ActivityTrend,
} from './components';
import { DateRangeSelector } from './components/controls';

// Hooks & API
import { useFilterStore } from '@/store';
import { 
  useRuleStatsQuery, 
  useTechniqueCoverageQuery,
  useTrendAnalysisQuery 
} from '@/api/queries';

// Constants
import { PLATFORM_COLORS } from '@/utils/constants';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setRulePlatforms, clearFilters } = useFilterStore();
  
  const [daysBack, setDaysBack] = useState(30);
  
  // Data fetching
  const { 
    data: ruleStatsData, 
    isLoading: isLoadingRuleStats, 
    isError: isErrorRuleStats, 
    error: errorRuleStats,
    refetch: refetchStats,
  } = useRuleStatsQuery();
  
  const { 
    data: coverageData, 
    isLoading: isLoadingCoverage, 
    isError: isErrorCoverage, 
    error: errorCoverage,
    refetch: refetchCoverage,
  } = useTechniqueCoverageQuery();

  const {
    data: trendData,
    isLoading: isLoadingTrend,
    refetch: refetchTrend,
  } = useTrendAnalysisQuery(daysBack);

  // Computed values
  const totalRules = ruleStatsData?.total_rules ?? 0;
  const statsBySeverity = ruleStatsData?.stats?.by_severity;
  const statsByRulePlatform = ruleStatsData?.stats?.by_rule_platform;
  const totalTechniques = coverageData?.total_techniques ?? 0;
  
  const coveredTechniques = useMemo(() => 
    coverageData?.techniques?.filter(t => t.count > 0).length ?? 0, 
    [coverageData]
  );
  
  const coveragePercentage = totalTechniques > 0 
    ? Math.round((coveredTechniques / totalTechniques) * 100) 
    : 0;

  const coverageImprovement = useMemo(() => {
    if (!trendData?.summary) return 0;
    const { total_created } = trendData.summary;
    return totalRules > 0 
      ? Math.round((total_created / totalRules) * 100 * 10) / 10
      : 0;
  }, [trendData, totalRules]);

  // Event handlers
  const handlePlatformClick = (platform: string) => {
    clearFilters();
    setRulePlatforms([platform]);
    navigate('/rules');
  };

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchCoverage();
    refetchTrend();
  }, [refetchStats, refetchCoverage, refetchTrend]);

  const handleTimeRangeChange = useCallback((newValue: number) => {
    setDaysBack(newValue);
  }, []);

  // Error state
  if (isErrorRuleStats || isErrorCoverage) {
    return (
      <Box p={3}>
        <ErrorDisplay 
          message="Failed to load dashboard data." 
          details={`${errorRuleStats?.message || ''} ${errorCoverage?.message || ''}`}
        />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <DateRangeSelector
              value={daysBack}
              onChange={handleTimeRangeChange}
              disabled={isLoadingRuleStats || isLoadingCoverage || isLoadingTrend}
            />
            
            <Tooltip title="Refresh Dashboard">
              <IconButton 
                onClick={handleRefresh} 
                disabled={isLoadingRuleStats || isLoadingCoverage || isLoadingTrend}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard 
            title="Total Detection Rules" 
            value={totalRules} 
            icon={<SecurityIcon />} 
            isLoading={isLoadingRuleStats} 
            color={theme.palette.primary.main}
            trend={coverageImprovement > 0 ? {
              value: coverageImprovement,
              direction: 'up'
            } : undefined}
            onClick={() => navigate('/rules')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard 
            title="ATT&CK Techniques Tracked" 
            value={totalTechniques} 
            icon={<HubIcon />} 
            isLoading={isLoadingCoverage} 
            color={theme.palette.secondary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard 
            title="Technique Coverage" 
            value={`${coveragePercentage}%`} 
            icon={<AssessmentIcon />} 
            isLoading={isLoadingCoverage} 
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Activity Trend */}
      {trendData && (
        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <ActivityTrend
                data={trendData}
                isLoading={isLoadingTrend}
                daysBack={daysBack}
                height={300}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Visual Breakdowns */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                borderBottom: 1, 
                borderColor: 'divider' 
              }}
            >
              <DonutLargeIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography variant="h6">Rules by Severity</Typography>
            </Box>
            <Box sx={{ p: 2, flexGrow: 1 }}>
              <SeverityDonutChart 
                data={statsBySeverity} 
                isLoading={isLoadingRuleStats} 
              />
            </Box>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <BreakdownCard
            title="Rules by Platform"
            data={statsByRulePlatform}
            isLoading={isLoadingRuleStats}
            colorMap={PLATFORM_COLORS}
            icon={<LanguageIcon />}
            onItemClick={handlePlatformClick}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <PlatformCoveragePanel />
        </Grid>
      </Grid>
      
      {/* Actionable Insights */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CoverageGapsPanel />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentActivityPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
