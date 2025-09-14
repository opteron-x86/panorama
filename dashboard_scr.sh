#!/bin/bash

# Create Dashboard structure
BASE_DIR="src/pages/Dashboard"

# Create directories
mkdir -p "$BASE_DIR/components/stats"
mkdir -p "$BASE_DIR/components/charts"
mkdir -p "$BASE_DIR/components/coverage"
mkdir -p "$BASE_DIR/components/activity"
mkdir -p "$BASE_DIR/hooks"

# Create core files
cat > "$BASE_DIR/types.ts" << 'EOF'
// Dashboard-specific type definitions
export interface DashboardMetrics {
  totalRules: number;
  totalTechniques: number;
  coveredTechniques: number;
  coveragePercentage: number;
}

export interface PlatformCoverage {
  platform: string;
  coveredTechniques: number;
  totalTechniques: number;
  coveragePercentage: number;
}
EOF

cat > "$BASE_DIR/utils.ts" << 'EOF'
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
EOF

# Stats components
cat > "$BASE_DIR/components/stats/StatCard.types.ts" << 'EOF'
import { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  isLoading?: boolean;
  color?: string;
}
EOF

cat > "$BASE_DIR/components/stats/StatCard.tsx" << 'EOF'
import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { Card } from '@/components/common';
import { StatCardProps } from './StatCard.types';

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  isLoading, 
  color 
}) => {
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      borderLeft: `4px solid ${color || 'primary.main'}` 
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexGrow: 1 
      }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton width={80} height={32} />
          ) : (
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          )}
        </Box>
        {icon && <Box sx={{ color: 'text.secondary' }}>{icon}</Box>}
      </Box>
    </Card>
  );
};
EOF

cat > "$BASE_DIR/components/stats/index.ts" << 'EOF'
export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard.types';
EOF

# Charts components
cat > "$BASE_DIR/components/charts/SeverityDonutChart.types.ts" << 'EOF'
export interface SeverityData {
  [key: string]: number;
}

export interface SeverityDonutChartProps {
  data: SeverityData | undefined;
  isLoading: boolean;
}
EOF

cat > "$BASE_DIR/components/charts/SeverityDonutChart.tsx" << 'EOF'
import React from 'react';
import { SeverityDonutChartProps } from './SeverityDonutChart.types';

export const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({ 
  data, 
  isLoading 
}) => {
  // Component implementation
  return <div>SeverityDonutChart</div>;
};
EOF

cat > "$BASE_DIR/components/charts/BreakdownCard.types.ts" << 'EOF'
import { ReactNode } from 'react';

export interface BreakdownCardProps {
  title: string;
  data: Record<string, number> | undefined;
  isLoading: boolean;
  colorMap?: Record<string, string>;
  icon?: ReactNode;
  onItemClick?: (item: string) => void;
}
EOF

cat > "$BASE_DIR/components/charts/BreakdownCard.tsx" << 'EOF'
import React from 'react';
import { BreakdownCardProps } from './BreakdownCard.types';

export const BreakdownCard: React.FC<BreakdownCardProps> = ({ 
  title, 
  data, 
  isLoading, 
  colorMap, 
  icon, 
  onItemClick 
}) => {
  // Component implementation
  return <div>BreakdownCard</div>;
};
EOF

cat > "$BASE_DIR/components/charts/index.ts" << 'EOF'
export { SeverityDonutChart } from './SeverityDonutChart';
export { BreakdownCard } from './BreakdownCard';
export type { SeverityDonutChartProps } from './SeverityDonutChart.types';
export type { BreakdownCardProps } from './BreakdownCard.types';
EOF

# Coverage components
cat > "$BASE_DIR/components/coverage/PlatformCoveragePanel.types.ts" << 'EOF'
export interface PlatformCoveragePanelProps {
  className?: string;
}
EOF

cat > "$BASE_DIR/components/coverage/PlatformCoveragePanel.tsx" << 'EOF'
import React from 'react';
import { PlatformCoveragePanelProps } from './PlatformCoveragePanel.types';

export const PlatformCoveragePanel: React.FC<PlatformCoveragePanelProps> = ({ 
  className 
}) => {
  // Component implementation
  return <div>PlatformCoveragePanel</div>;
};
EOF

cat > "$BASE_DIR/components/coverage/CoverageGapsPanel.types.ts" << 'EOF'
export interface CoverageGapsPanelProps {
  className?: string;
}
EOF

cat > "$BASE_DIR/components/coverage/CoverageGapsPanel.tsx" << 'EOF'
import React from 'react';
import { CoverageGapsPanelProps } from './CoverageGapsPanel.types';

export const CoverageGapsPanel: React.FC<CoverageGapsPanelProps> = ({ 
  className 
}) => {
  // Component implementation
  return <div>CoverageGapsPanel</div>;
};
EOF

cat > "$BASE_DIR/components/coverage/index.ts" << 'EOF'
export { PlatformCoveragePanel } from './PlatformCoveragePanel';
export { CoverageGapsPanel } from './CoverageGapsPanel';
export type { PlatformCoveragePanelProps } from './PlatformCoveragePanel.types';
export type { CoverageGapsPanelProps } from './CoverageGapsPanel.types';
EOF

# Activity components
cat > "$BASE_DIR/components/activity/RecentActivityPanel.types.ts" << 'EOF'
export interface RecentActivityPanelProps {
  className?: string;
}
EOF

cat > "$BASE_DIR/components/activity/RecentActivityPanel.tsx" << 'EOF'
import React from 'react';
import { RecentActivityPanelProps } from './RecentActivityPanel.types';

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({ 
  className 
}) => {
  // Component implementation
  return <div>RecentActivityPanel</div>;
};
EOF

cat > "$BASE_DIR/components/activity/index.ts" << 'EOF'
export { RecentActivityPanel } from './RecentActivityPanel';
export type { RecentActivityPanelProps } from './RecentActivityPanel.types';
EOF

# Main components barrel export
cat > "$BASE_DIR/components/index.ts" << 'EOF'
export * from './stats';
export * from './charts';
export * from './coverage';
export * from './activity';
EOF

# Hooks
cat > "$BASE_DIR/hooks/useDashboardData.ts" << 'EOF'
import { useRuleStatsQuery, useTechniqueCoverageQuery } from '@/api/queries';
import { useMemo } from 'react';

export const useDashboardData = () => {
  const ruleStats = useRuleStatsQuery();
  const coverage = useTechniqueCoverageQuery();

  const metrics = useMemo(() => {
    const totalRules = ruleStats.data?.total_rules ?? 0;
    const totalTechniques = coverage.data?.total_techniques ?? 0;
    const coveredTechniques = coverage.data?.techniques?.filter(t => t.count > 0).length ?? 0;
    const coveragePercentage = totalTechniques > 0 
      ? Math.round((coveredTechniques / totalTechniques) * 100) 
      : 0;

    return {
      totalRules,
      totalTechniques,
      coveredTechniques,
      coveragePercentage,
    };
  }, [ruleStats.data, coverage.data]);

  return {
    metrics,
    ruleStats,
    coverage,
    isLoading: ruleStats.isLoading || coverage.isLoading,
    isError: ruleStats.isError || coverage.isError,
  };
};
EOF

cat > "$BASE_DIR/hooks/index.ts" << 'EOF'
export { useDashboardData } from './useDashboardData';
EOF

echo "Dashboard structure created successfully"