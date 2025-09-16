import { useRuleStatsQuery, useMitreCoverageQuery } from '@/api/queries';
import type { MitreTechniqueCoverage } from '@/api/types';
import { useMemo } from 'react';

export const useDashboardData = () => {
  const ruleStats = useRuleStatsQuery();
  const coverage = useMitreCoverageQuery();

  const metrics = useMemo(() => {
    const totalRules = ruleStats.data?.total_rules ?? 0;
    const totalTechniques = coverage.data?.total_techniques ?? 0;
    const coveredTechniques = coverage.data?.techniques?.filter(
      (t: MitreTechniqueCoverage) => (t.count ?? 0) > 0
    ).length ?? 0;
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
