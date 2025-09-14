import { TechniqueCoverageDetail } from '@/api/types';

export interface CoverageGapsPanelProps {
  className?: string;
  maxItems?: number;
  onTechniqueClick?: (technique: TechniqueCoverageDetail) => void;
  onViewMore?: () => void;
}