import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProductSituationScoreThresholds } from '@/features/insight-dashboard/logic/types'
import { CHART_CARD_CAPTION_CLASS } from '@/features/insight-dashboard/components/chart-card-tokens'
import { formatBoundaryScore } from '@/features/insight-dashboard/components/product-situation-bubble-matrix/helpers'

interface BubbleZoneLegendProps {
  scoreThresholds: ProductSituationScoreThresholds
  focusedSinglePoint: boolean
}

export function BubbleZoneLegend({ scoreThresholds, focusedSinglePoint }: BubbleZoneLegendProps) {
  if (focusedSinglePoint) {
    return (
      <p className={CHART_CARD_CAPTION_CLASS}>
        Зеленая: до {formatBoundaryScore(scoreThresholds.lower)} · Желтая:{' '}
        {formatBoundaryScore(scoreThresholds.lower)}–{formatBoundaryScore(scoreThresholds.upper)} · Красная: от{' '}
        {formatBoundaryScore(scoreThresholds.upper)}
      </p>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', CHART_CARD_CAPTION_CLASS)}>
      <Badge variant="outline" className="gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Зеленая: до {formatBoundaryScore(scoreThresholds.lower)}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
        Желтая: {formatBoundaryScore(scoreThresholds.lower)}–{formatBoundaryScore(scoreThresholds.upper)}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        Красная: от {formatBoundaryScore(scoreThresholds.upper)}
      </Badge>
    </div>
  )
}
