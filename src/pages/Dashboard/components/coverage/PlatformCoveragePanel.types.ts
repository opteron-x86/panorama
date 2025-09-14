export interface PlatformCoveragePanelProps {
  className?: string;
  maxItems?: number;
  onPlatformClick?: (platform: string) => void;
}

export interface PlatformCoverageData {
  platform: string;
  totalTechniques: number;
  coveredTechniques: number;
  coveragePercentage: number;
}