import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { formatBucketLabel } from '@/features/insight-dashboard/logic/date-bucketing'
import type { PeriodGranularity } from '@/features/insight-dashboard/logic/metrics-catalog'
import type { ProductSituationScoreThresholds } from '@/features/insight-dashboard/logic/types'
import {
  type MatrixPoint,
  ZONE_LABELS,
  formatPercent,
  formatScore,
  zoneByScore,
  zoneStyles,
} from '@/features/insight-dashboard/components/product-situation-bubble-matrix/helpers'

interface BubbleTooltipContentProps {
  point: MatrixPoint
  scoreThresholds: ProductSituationScoreThresholds
  xMode: 'products' | 'periods'
  periodGranularity: PeriodGranularity
  tooltipEntityLabel?: string
}

export function BubbleTooltipContent({
  point,
  scoreThresholds,
  xMode,
  periodGranularity,
  tooltipEntityLabel,
}: BubbleTooltipContentProps) {
  const visualZone = zoneByScore(point.productDissatisfactionScore, scoreThresholds)
  const styles = zoneStyles(visualZone)
  const periodTitle =
    xMode === 'periods' && point.periodKey
      ? formatBucketLabel(point.periodKey, periodGranularity, 'long')
      : point.label
  const tooltipTitle =
    xMode === 'periods'
      ? `${tooltipEntityLabel ?? point.label} · ${periodTitle}`
      : point.label

  return (
    <BerekeChartTooltip
      title={tooltipTitle}
      rows={[
        {
          id: 'product-dissatisfaction-score',
          label: 'Оценка неудовлетворенности продуктом',
          value: formatScore(point.productDissatisfactionScore),
          color: styles.stroke,
          strong: true,
        },
        {
          id: 'indicator-1-share',
          label: 'Тех. проблемы',
          value: formatPercent(point.indicator1Share),
          color: '#2563eb',
        },
        {
          id: 'indicator-2-share',
          label: 'Запрос не решен',
          value: formatPercent(point.indicator2Share),
          color: '#f97316',
        },
        {
          id: 'indicator-3-share',
          label: 'Негативный продуктовый фидбэк',
          value: formatPercent(point.indicator3Share),
          color: '#0f766e',
        },
        {
          id: 'indicator-4-share',
          label: 'Риск ухода',
          value: formatPercent(point.indicator4Share),
          color: '#dc2626',
        },
        {
          id: 'zone',
          label: 'Зона',
          value: ZONE_LABELS[visualZone],
          color: styles.stroke,
        },
      ]}
    />
  )
}
