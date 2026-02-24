import {
  HEALTH_SCORE_CRITICAL_WEIGHT,
  HEALTH_SCORE_REFERENCE_SHARES,
  HEALTH_SCORE_ZONE_THRESHOLDS,
} from '@/features/insight-dashboard/config/constants'
import type {
  ProductSituationScoreThresholds,
  ProductSituationTag,
} from '@/features/insight-dashboard/domain/types'

export interface InsightHelpDialogSectionCopy {
  title: string
  points: readonly string[]
}

export interface InsightHelpDialogCopy {
  title: string
  description: string
  sections: readonly InsightHelpDialogSectionCopy[]
}

const INDICATOR_ORDER: readonly ProductSituationTag[] = [
  'Технические проблемы/сбои',
  'Запрос не решен',
  'Отрицательный продуктовый фидбэк',
  'Угроза ухода/отказа от продуктов банка',
]

const INDICATOR_LABELS: Record<ProductSituationTag, string> = {
  'Технические проблемы/сбои': 'Техническая проблема/сбои',
  'Запрос не решен': 'Запрос не решен',
  'Отрицательный продуктовый фидбэк': 'Отрицательный продуктовый фидбэк',
  'Угроза ухода/отказа от продуктов банка': 'Угроза ухода/отказа',
}

function formatScore(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

function formatPercent(share: number): string {
  const percent = share * 100
  const rounded = Math.round(percent * 10) / 10
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return `${Math.round(rounded)}%`
  }

  return `${rounded.toFixed(1).replace(/\.0$/, '')}%`
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

function buildGreenNormativePoints(): string[] {
  return INDICATOR_ORDER.map((tag) => `${INDICATOR_LABELS[tag]} ≤ ${formatPercent(HEALTH_SCORE_REFERENCE_SHARES.green[tag])}.`)
}

function buildRedNormativePoints(): string[] {
  return INDICATOR_ORDER.map((tag) => `${INDICATOR_LABELS[tag]} ≥ ${formatPercent(HEALTH_SCORE_REFERENCE_SHARES.red[tag])}.`)
}

function buildZoneInterpretationPoints(thresholds: ProductSituationScoreThresholds): string[] {
  return [
    `Зеленая зона: Health Index ≤ ${formatScore(thresholds.lower)}.`,
    `Желтая зона: Health Index ${formatScore(thresholds.lower)}–${formatScore(thresholds.upper)}.`,
    `Красная зона: Health Index ≥ ${formatScore(thresholds.upper)}.`,
  ]
}

const DOC_POINTS = {
  dashboardPurpose:
    'Цель данного дашборда— расчет единой взвешенной метрики «Оценка продукта» на основе данных по обращениям клиентов для того, чтобы сформировать единую температурную карту, объективно сравнить продукты между собой и сразу увидеть, какой из них чувствует себя хуже других.',
  dashboardPrinciple:
    'Основной принцип расчета: чем выше итоговое значение метрики «Оценка продукта», тем хуже ситуация.',
  dashboardProblemSignal:
    'Так как этот показатель складывается исключительно из проблемных обращений клиентов, его высокое значение сигнализирует о том, что необходимо устранить причину этих негативных индикаторов.',
  formula:
    '«Оценка продукта» рассчитывается как сумма произведений: доля каждого индикатора × весовой коэффициент соответствующего индикатора.',
  shareDefinition:
    'Доля каждого индикатора— это рассчитанная как процент обращений по данному индикатору от общего количества обращений по конкретному продукту.',
  weightDefinition:
    'Весовой коэффициент индикатора — это математический множитель, который определяет степень влияния конкретного индикатора на итоговую «Оценку продукта».',
  zoneColoring:
    'По итогам расчета продукт окрашивается в соответствующий цвет на температурной карте (Зеленая, Желтая или Красная зона).',
  scoreBounds:
    'Балльные границы — это аналитически заданные пороговые значения метрики «Оценка продукта».',
  scoreBoundsMeaning:
    'Они представляют собой фиксированные пороги, которые определяют, в какую цветовую зону попадет продукт, и показывают, насколько его текущее состояние соответствует принятым стандартам.',
  zoneClassification: 'Состояние продукта классифицируется по трем зонам:',
  greenNormatives:
    'Целевые нормативы для Зеленой зоны: максимально допустимая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
  redNormatives:
    'Критические нормативы для Красной зоны: критическая доля индикаторов от общего числа обращений по конкретному продукту составляет:',
  yellowNormatives:
    'Промежуточные значения для Желтой зоны: формируются автоматически как интервал между зеленой и красной зонами. Продукт попадает сюда, если доля индикаторов превысила целевую норму, но еще не достигла критического уровня.',
  bubbleSizeA: 'Размер пузыря пропорционален числу обращений.',
  bubbleSizeB: 'Размер шара отражает общее количество всех обращений.',
} as const

export function buildHealthIndexHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  const thresholds = resolveThresholds(scoreThresholds)

  return {
    title: 'Health Index («Оценка продукта»)',
    description:
      'Дашборд формирует температурную карту с помощью метрики «Оценка продукта», которая рассчитывается на базе обращений клиентов.',
    sections: [
      {
        title: 'Цель дашборда',
        points: [
          DOC_POINTS.dashboardPurpose,
          DOC_POINTS.dashboardPrinciple,
          DOC_POINTS.dashboardProblemSignal,
        ],
      },
      {
        title: 'Формула расчета',
        points: [
          DOC_POINTS.formula,
          DOC_POINTS.shareDefinition,
          DOC_POINTS.weightDefinition,
          DOC_POINTS.zoneColoring,
          `Скоры остаются по текущей конфигурации проекта (критический вес индикатора = ${HEALTH_SCORE_CRITICAL_WEIGHT}).`,
        ],
      },
      {
        title: 'Балльные границы и зоны',
        points: [
          DOC_POINTS.scoreBounds,
          DOC_POINTS.scoreBoundsMeaning,
          DOC_POINTS.zoneClassification,
          ...buildZoneInterpretationPoints(thresholds),
        ],
      },
      {
        title: 'Нормативы долей индикаторов',
        points: [
          DOC_POINTS.greenNormatives,
          ...buildGreenNormativePoints(),
          DOC_POINTS.redNormatives,
          ...buildRedNormativePoints(),
          DOC_POINTS.yellowNormatives,
        ],
      },
      {
        title: 'Размер пузыря',
        points: [
          DOC_POINTS.bubbleSizeA,
          DOC_POINTS.bubbleSizeB,
        ],
      },
    ],
  }
}

export function buildOverlapHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  const thresholds = resolveThresholds(scoreThresholds)

  return {
    title: 'Температурная карта',
    description:
      'Дашборд формирует температурную карту с помощью метрики «Оценка продукта», которая рассчитывается на базе обращений клиентов.',
    sections: [
      {
        title: 'Смысл метрики',
        points: [
          'Это позволяет объективно сравнивать продукты: чем выше значение метрики, тем хуже их состояние и тем быстрее нужно устранять причины негативных индикаторов.',
          DOC_POINTS.formula,
          DOC_POINTS.shareDefinition,
          DOC_POINTS.weightDefinition,
          DOC_POINTS.zoneColoring,
        ],
      },
      {
        title: 'Балльные границы и зоны',
        points: [
          DOC_POINTS.scoreBounds,
          DOC_POINTS.scoreBoundsMeaning,
          DOC_POINTS.zoneClassification,
          ...buildZoneInterpretationPoints(thresholds),
          DOC_POINTS.yellowNormatives,
        ],
      },
      {
        title: 'Нормативы индикаторов',
        points: [
          DOC_POINTS.greenNormatives,
          ...buildGreenNormativePoints(),
          DOC_POINTS.redNormatives,
          ...buildRedNormativePoints(),
        ],
      },
    ],
  }
}

function buildStandardZoneSection(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogSectionCopy {
  const thresholds = resolveThresholds(scoreThresholds)

  return {
    title: 'Балльные границы и зоны',
    points: [
      DOC_POINTS.scoreBounds,
      DOC_POINTS.scoreBoundsMeaning,
      DOC_POINTS.zoneClassification,
      ...buildZoneInterpretationPoints(thresholds),
      DOC_POINTS.yellowNormatives,
    ],
  }
}

export function buildKpiIndicatorHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Оценка продукта',
    description:
      'Дашборд формирует температурную карту с помощью метрики «Оценка продукта», которая рассчитывается на базе обращений клиентов.',
    sections: [
      {
        title: 'Формула расчета',
        points: [
          DOC_POINTS.formula,
          DOC_POINTS.shareDefinition,
          DOC_POINTS.weightDefinition,
          DOC_POINTS.zoneColoring,
        ],
      },
      {
        title: 'Нормативы долей индикаторов',
        points: [
          DOC_POINTS.greenNormatives,
          ...buildGreenNormativePoints(),
          DOC_POINTS.redNormatives,
          ...buildRedNormativePoints(),
        ],
      },
      buildStandardZoneSection(scoreThresholds),
    ],
  }
}

export function buildCombinedIndicatorHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Оценка продукта',
    description:
      'Дашборд формирует температурную карту с помощью метрики «Оценка продукта», которая рассчитывается на базе обращений клиентов.',
    sections: [
      {
        title: 'Смысл метрики',
        points: [
          'Это позволяет объективно сравнивать продукты: чем выше значение метрики, тем хуже их состояние и тем быстрее нужно устранять причины негативных индикаторов.',
          DOC_POINTS.formula,
          DOC_POINTS.shareDefinition,
          DOC_POINTS.weightDefinition,
        ],
      },
      {
        title: 'Нормативы долей индикаторов',
        points: [
          DOC_POINTS.greenNormatives,
          ...buildGreenNormativePoints(),
          DOC_POINTS.redNormatives,
          ...buildRedNormativePoints(),
        ],
      },
      buildStandardZoneSection(scoreThresholds),
    ],
  }
}

export function buildConsultationCoverageHelpDialogCopy(
  scoreThresholds?: Partial<ProductSituationScoreThresholds>
): InsightHelpDialogCopy {
  return {
    title: 'Оценка продукта',
    description:
      'Дашборд формирует температурную карту с помощью метрики «Оценка продукта», которая рассчитывается на базе обращений клиентов.',
    sections: [
      {
        title: 'Формула расчета',
        points: [
          DOC_POINTS.formula,
          DOC_POINTS.shareDefinition,
          DOC_POINTS.weightDefinition,
          DOC_POINTS.zoneColoring,
        ],
      },
      {
        title: 'Нормативы долей индикаторов',
        points: [
          DOC_POINTS.greenNormatives,
          ...buildGreenNormativePoints(),
          DOC_POINTS.redNormatives,
          ...buildRedNormativePoints(),
        ],
      },
      buildStandardZoneSection(scoreThresholds),
    ],
  }
}

export const INSIGHT_HELP_DIALOG_COPY = {
  healthIndex: buildHealthIndexHelpDialogCopy(),
  overlap: buildOverlapHelpDialogCopy(),
  kpiIndicator: buildKpiIndicatorHelpDialogCopy(),
  combinedIndicator: buildCombinedIndicatorHelpDialogCopy(),
  consultationCoverage: buildConsultationCoverageHelpDialogCopy(),
} as const
