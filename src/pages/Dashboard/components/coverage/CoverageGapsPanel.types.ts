import { MitreTechnique } from '@/api/types';

export interface CoverageGapsPanelProps {
  className?: string;
  maxItems?: number;
  onTechniqueClick?: (technique: MitreTechnique) => void;
  onViewMore?: () => void;
}