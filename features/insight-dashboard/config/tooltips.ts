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
}

function formatScore(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

function resolveThresholds(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): ProductSituationScoreThresholds {
  const fallbackGreen = HEALTH_SCORE_ZONE_THRESHOLDS.green
  const fallbackRed = HEALTH_SCORE_ZONE_THRESHOLDS.red
  const green = scoreThresholds?.green ?? scoreThresholds?.lower ?? fallbackGreen
  const red = scoreThresholds?.red ?? scoreThresholds?.upper ?? fallbackRed
  const lower = Math.min(green, red)
  const upper = Math.max(green, red)

  return {
    green,
    red,
    lower,
    upper,
  }
}

function buildDocTextPoints(thresholds: ProductSituationScoreThresholds): string[] {
  return [
    'Дашборд формирует температурную карту с помощью метрики «Оценка неудовлетворенности продукта», которая рассчитывается на базе обращений клиентов. Это позволяет объективно сравнивать продукты: чем выше значение метрики, тем хуже их состояние и тем быстрее нужно устранять причины негативных индикаторов.',
    '«Оценка неудовлетворенности продукта» рассчитывается как сумма произведений: доля каждого индикатора × весовой коэффициент соответствующего индикатора.',
    'Доля каждого индикатора— это рассчитанная как % обращений по данному индикатору от общего количества обращений по конкретному продукту.',
    'Весовой коэффициент индикатора — это математический множитель, который определяет степень влияния конкретного индикатора на итоговую «Оценку неудовлетворенности продукта». По итогам расчета продукт попадает в соответствующую зону на температурной карте (Зеленую, Желтую или Красную).',
    'Балльные границы в температурной карте — это аналитически заданные пороговые значения метрики «Оценка неудовлетворенности продукта». Они представляют собой фиксированные пороги, которые определяют, в какую цветовую зону попадет продукт, и показывают, насколько его текущее состояние соответствует принятым нормам.',
    'Состояние продукта классифицируется по трем зонам:',
    'Скоры твои остаются',
    `Зеленая зона: Health Index ≤ ${formatScore(thresholds.lower)}.`,
    `Желтая зона: Health Index ${formatScore(thresholds.lower)}–${formatScore(thresholds.upper)}.`,
    `Красная зона: Health Index ≥ ${formatScore(thresholds.upper)}.`,
    'Целевые нормативы для Зеленой зоны: максимально допустимая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
    '«Техническая проблема/сбои» ≤ 10%',
    '«Запрос не решен» ≤ 30%',
    '«Отрицательный продуктовый фидбэк» ≤ 5%',
    '«Угроза ухода/отказа» ≤ 2%.',
    'Критические нормативы для Красной зоны: критическая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
    '«Техническая проблема/сбои» ≥ 20%',
    '«Запрос не решен» ≥ 60%',
    '«Отрицательный продуктовый фидбэк» ≥ 10%',
    '«Угроза ухода/отказа» ≥ 5%.',
    'Промежуточные значения для Желтой зоны: формируются автоматически как интервал между зеленой и красной зонами. Продукт попадает сюда, если доля индикаторов превысила целевую норму, но еще не достигла критического уровня.',
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
    sections: [
      {
        title: 'Документация',
        points: buildDocTextPoints(thresholds),
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
