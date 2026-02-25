import { HEALTH_SCORE_ZONE_THRESHOLDS } from '@/features/insight-dashboard/config/constants'
import type { ProductSituationScoreThresholds } from '@/features/insight-dashboard/domain/types'

export type InsightHelpDialogVariant =
  | 'health-index'
  | 'consultation-coverage'
  | 'detailed-product-zones'

export interface InsightHelpDialogCopy {
  title: string
  description?: string
  variant?: InsightHelpDialogVariant
  zoneThresholds?: {
    lower: number
    upper: number
  }
}

function resolveThresholds(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): { lower: number; upper: number } {
  const green =
    scoreThresholds?.green ?? scoreThresholds?.lower ?? HEALTH_SCORE_ZONE_THRESHOLDS.green
  const red = scoreThresholds?.red ?? scoreThresholds?.upper ?? HEALTH_SCORE_ZONE_THRESHOLDS.red

  return {
    lower: Math.min(green, red),
    upper: Math.max(green, red),
  }
}

function buildUnifiedTooltipCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Дашборд: Температурная карта',
    variant: 'health-index',
    zoneThresholds: resolveThresholds(scoreThresholds),
  }
}

export function buildHealthIndexHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return buildUnifiedTooltipCopy(scoreThresholds)
}

export function buildOverlapHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return buildUnifiedTooltipCopy(scoreThresholds)
}

export function buildKpiIndicatorHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return buildUnifiedTooltipCopy(scoreThresholds)
}

export function buildCombinedIndicatorHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return buildUnifiedTooltipCopy(scoreThresholds)
}

export function buildConsultationCoverageHelpDialogCopy(
  _scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Консультационные обращения',
    variant: 'consultation-coverage',
  }
}

export function buildDetailedProductZonesHelpDialogCopy(
  _scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Состояние продукта по зонам',
    variant: 'detailed-product-zones',
  }
}

export const INSIGHT_HELP_DIALOG_COPY = {
  healthIndex: buildHealthIndexHelpDialogCopy(),
  overlap: buildOverlapHelpDialogCopy(),
  kpiIndicator: buildKpiIndicatorHelpDialogCopy(),
  combinedIndicator: buildCombinedIndicatorHelpDialogCopy(),
  consultationCoverage: buildConsultationCoverageHelpDialogCopy(),
  detailedProductZones: buildDetailedProductZonesHelpDialogCopy(),
} as const
