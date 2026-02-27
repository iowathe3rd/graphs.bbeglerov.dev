import { PRODUCT_DISSATISFACTION_SCORE_ZONE_THRESHOLDS } from '@/features/insight-dashboard/config/constants'
import type { ProductSituationScoreThresholds } from '@/features/insight-dashboard/logic/types'

export type InsightHelpDialogVariant =
  | 'product-dissatisfaction-score-main'
  | 'product-dissatisfaction-score-detailed'
  | 'consultation-coverage'
  | 'combined-indicator-line'

export interface InsightHelpDialogCopy {
  title: string
  description?: string
  variant: InsightHelpDialogVariant
  metricId?: string
  zoneThresholds?: {
    lower: number
    upper: number
  }
}

function resolveThresholds(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): { lower: number; upper: number } {
  const green =
    scoreThresholds?.green ??
    scoreThresholds?.lower ??
    PRODUCT_DISSATISFACTION_SCORE_ZONE_THRESHOLDS.green
  const red =
    scoreThresholds?.red ??
    scoreThresholds?.upper ??
    PRODUCT_DISSATISFACTION_SCORE_ZONE_THRESHOLDS.red

  return {
    lower: Math.min(green, red),
    upper: Math.max(green, red),
  }
}

export function buildMainProductDissatisfactionHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Дашборд: Температурная карта',
    variant: 'product-dissatisfaction-score-main',
    zoneThresholds: resolveThresholds(scoreThresholds),
  }
}

export function buildDetailedProductDissatisfactionHelpDialogCopy(): InsightHelpDialogCopy {
  return {
    title: 'Состояние продукта по зонам',
    variant: 'product-dissatisfaction-score-detailed',
  }
}

export function buildConsultationCoverageHelpDialogCopy(): InsightHelpDialogCopy {
  return {
    title: 'Консультационные обращения',
    variant: 'consultation-coverage',
  }
}

export function buildCombinedIndicatorHelpDialogCopy(metricId: string): InsightHelpDialogCopy {
  return {
    title: 'Описание индикатора',
    variant: 'combined-indicator-line',
    metricId,
  }
}

export const INSIGHT_HELP_DIALOG_COPY = {
  productDissatisfactionScoreMain: buildMainProductDissatisfactionHelpDialogCopy(),
  productDissatisfactionScoreDetailed: buildDetailedProductDissatisfactionHelpDialogCopy(),
  consultationCoverage: buildConsultationCoverageHelpDialogCopy(),
} as const
