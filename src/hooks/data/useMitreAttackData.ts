// src/hooks/data/useMitreAttackData.ts
import { useMemo } from 'react';
import {
  useMitreMatrixQuery, 
  useMitreCoverageQuery,
  useFilterOptionsQuery,
} from '@/api/queries';
import { MitreTactic, TechniquesCoverageResponse, MitreTechnique } from '@/api/types';

// Extended type for techniques with coverage data
interface MitreTechniqueCoverage extends MitreTechnique {
  count?: number;
  rule_count?: number;
}

interface ProcessedCoverageResponse extends Omit<TechniquesCoverageResponse, 'techniques'> {
  techniques: MitreTechniqueCoverage[];
}

/**
 * Custom hook to fetch and process MITRE ATT&CK data with coverage information.
 */
export const useMitreAttackData = (platformFilter?: string, rulePlatformFilter?: string) => {
  const {
    data: matrixData,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
    error: errorMatrix,
    refetch: refetchMatrix
  } = useMitreMatrixQuery();

  const {
    data: coverageData,
    isLoading: isLoadingCoverage,
    isError: isErrorCoverage,
    error: errorCoverage,
    refetch: refetchCoverage
  } = useMitreCoverageQuery(platformFilter, rulePlatformFilter);

  const {
    data: filterOptionsData,
  } = useFilterOptionsQuery();

  // Process matrix data to ensure consistent structure
  const processedMatrix = useMemo(() => {
    if (!matrixData) return null;
    
    return {
      ...matrixData,
      tactics: matrixData.tactics.map(tactic => ({
        ...tactic,
        techniques: tactic.techniques.map(technique => ({
          ...technique,
          technique_id: technique.technique_id || technique.id,
          // Remove subtechniques reference - field doesn't exist
        }))
      }))
    };
  }, [matrixData]);

  // Extract available platforms from matrix data
  const availablePlatforms = useMemo(() => {
    if (!processedMatrix) return [];
    
    const platforms = new Set<string>();
    processedMatrix.tactics.forEach(tactic => {
      tactic.techniques.forEach(technique => {
        if (technique.platforms) {
          technique.platforms.forEach(platform => platforms.add(platform));
        }
      });
    });
    
    return Array.from(platforms).sort();
  }, [processedMatrix]);

  // Get available rule sources from filter options
  const availableRuleSources = useMemo(() => {
    if (filterOptionsData?.rule_sources) {
      return filterOptionsData.rule_sources.map(s => ({
        value: s.value,
        label: s.label,
        count: s.count ?? 0
      }));
    }
    return [];
  }, [filterOptionsData]);

  // Process coverage data with proper typing
  const processedCoverage = useMemo((): ProcessedCoverageResponse | null => {
    if (!coverageData) return null;
    
    return {
      ...coverageData,
      techniques: coverageData.techniques.map(tech => ({
        ...tech,
        technique_id: tech.technique_id,
        // Ensure count is available for coverage calculations
        count: (tech as MitreTechniqueCoverage).count ?? 0,
        rule_count: (tech as MitreTechniqueCoverage).rule_count ?? 0
      }))
    };
  }, [coverageData]);

  // Create a map for quick coverage lookups
  const coverageMap = useMemo(() => {
    if (!processedCoverage) return new Map<string, MitreTechniqueCoverage>();
    
    const map = new Map<string, MitreTechniqueCoverage>();
    processedCoverage.techniques.forEach(tech => {
      map.set(tech.technique_id, tech);
    });
    return map;
  }, [processedCoverage]);

  return {
    matrix: processedMatrix,
    coverage: processedCoverage,
    coverageMap,
    availablePlatforms,
    availableRuleSources,
    isLoading: isLoadingMatrix || isLoadingCoverage,
    isError: isErrorMatrix || isErrorCoverage,
    error: errorMatrix || errorCoverage,
    refetch: () => {
      refetchMatrix();
      refetchCoverage();
    }
  };
};

export default useMitreAttackData;