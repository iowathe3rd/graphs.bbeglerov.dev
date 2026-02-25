import { HEALTH_SCORE_ZONE_THRESHOLDS } from '@/features/insight-dashboard/config/constants'
import type { ProductSituationScoreThresholds } from '@/features/insight-dashboard/domain/types'

export interface InsightHelpDialogSectionCopy {
  title: string
  points: readonly string[]
}

export interface InsightHelpDialogCopy {
  title: string
  description: string
  sections: readonly InsightHelpDialogSectionCopy[]
  zoneThresholds?: {
    lower: number
    upper: number
  }
}

function resolveThresholds(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): { lower: number; upper: number } {
  const green = scoreThresholds?.green ?? scoreThresholds?.lower ?? HEALTH_SCORE_ZONE_THRESHOLDS.green
  const red = scoreThresholds?.red ?? scoreThresholds?.upper ?? HEALTH_SCORE_ZONE_THRESHOLDS.red

  return {
    lower: Math.min(green, red),
    upper: Math.max(green, red),
  }
}

function buildDocTextPoints(): string[] {
  return [
    'Дашборд формирует температурную карту с помощью метрики «Оценка неудовлетворенности продукта», которая рассчитывается на базе обращений клиентов. Это позволяет объективно сравнивать продукты: чем выше значение метрики, тем хуже их состояние и тем быстрее нужно устранять причины негативных индикаторов.',
    '«Оценка неудовлетворенности продукта» рассчитывается как сумма произведений: доля каждого индикатора × весовой коэффициент соответствующего индикатора.',
    '• Доля каждого индикатора— это рассчитанная как % обращений по данному индикатору от общего количества обращений по конкретному продукту.',
    '• Весовой коэффициент индикатора — это математический множитель, который определяет степень влияния конкретного индикатора на итоговую «Оценку неудовлетворенности продукта». По итогам расчета продукт попадает в соответствующую зону на температурной карте (Зеленую, Желтую или Красную).',
    'Балльные границы в температурной карте — это аналитически заданные пороговые значения метрики «Оценка неудовлетворенности продукта». Они представляют собой фиксированные пороги, которые определяют, в какую цветовую зону попадет продукт, и показывают, насколько его текущее состояние соответствует принятым нормам.',
    'Состояние продукта классифицируется по трем зонам:',
    '• Целевые нормативы для Зеленой зоны: максимально допустимая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
    'o «Техническая проблема/сбои» ≤ 10%',
    'o «Запрос не решен» ≤ 30%',
    'o «Отрицательный продуктовый фидбэк» ≤ 5%',
    'o «Угроза ухода/отказа» ≤ 2%.',
    '• Критические нормативы для Красной зоны: критическая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
    'o «Техническая проблема/сбои» ≥ 20%',
    'o «Запрос не решен» ≥ 60%',
    'o «Отрицательный продуктовый фидбэк» ≥ 10%',
    'o «Угроза ухода/отказа» ≥ 5%.',
    '• Промежуточные значения для Желтой зоны: формируются автоматически как интервал между зеленой и красной зонами. Продукт попадает сюда, если доля индикаторов превысила целевую норму, но еще не достигла критического уровня.',
    'Размер пузыря пропорционален числу обращений.',
  ]
}

function buildUnifiedTooltipCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  const thresholds = resolveThresholds(scoreThresholds)

  return {
    title: 'Оценка неудовлетворенности продукта',
    description: '',
    zoneThresholds: thresholds,
    sections: [
      {
        title: 'Документация',
        points: buildDocTextPoints(),
      },
    ],
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
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return buildUnifiedTooltipCopy(scoreThresholds)
}

export const INSIGHT_HELP_DIALOG_COPY = {
  healthIndex: buildUnifiedTooltipCopy(),
  overlap: buildUnifiedTooltipCopy(),
  kpiIndicator: buildUnifiedTooltipCopy(),
  combinedIndicator: buildUnifiedTooltipCopy(),
  consultationCoverage: buildUnifiedTooltipCopy(),
} as const
