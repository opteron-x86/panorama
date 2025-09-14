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
