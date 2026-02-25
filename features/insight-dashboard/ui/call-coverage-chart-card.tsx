'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildConsultationCoverageHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import type { CallCoverageBucket } from '@/features/insight-dashboard/domain/types'
import {
  CHART_CARD_CAPTION_CLASS,
  CHART_CARD_CONTENT_CLASS,
  CHART_CARD_CONTENT_COMPACT_CLASS,
  CHART_CARD_HEADER_CLASS,
  CHART_CARD_HEADER_COMPACT_CLASS,
  CHART_CARD_TITLE_CLASS,
} from '@/features/insight-dashboard/ui/chart-card-tokens'
import { InsightHelpDialogButton } from '@/features/insight-dashboard/ui/insight-help-dialog-button'
import { StackedPortionBarChart } from '@/features/insight-dashboard/ui/stacked-portion-bar-chart'
import type { OverlapGranularity } from '@/lib/metrics-data'
import { cn } from '@/lib/utils'

interface CallCoverageChartCardProps {
  data: CallCoverageBucket[]
  loading?: boolean
  compact?: boolean
  className?: string
  granularity?: OverlapGranularity
}

export function CallCoverageChartCard({
  data,
  loading = false,
  compact = false,
  className,
  granularity = 'week',
}: CallCoverageChartCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden',
        compact ? 'min-h-0' : 'min-h-[260px]',
        className
      )}
    >
      <CardHeader className={compact ? CHART_CARD_HEADER_COMPACT_CLASS : CHART_CARD_HEADER_CLASS}>
        <div className="flex items-center gap-1.5">
          <CardTitle className={CHART_CARD_TITLE_CLASS}>Консультационные обращения</CardTitle>
          <InsightHelpDialogButton
            copy={buildConsultationCoverageHelpDialogCopy()}
            ariaLabel="Как читать график консультационных обращений"
            triggerClassName="h-4 w-4 border-0"
          />
        </div>
        <p className={CHART_CARD_CAPTION_CLASS}>
          Серый столбец — все обращения, оранжевый — консультационные обращения.
        </p>
      </CardHeader>

      <CardContent className={compact ? CHART_CARD_CONTENT_COMPACT_CLASS : CHART_CARD_CONTENT_CLASS}>
        {loading ? (
          <div className="flex h-full min-h-[180px] items-center justify-center text-xs text-muted-foreground">
            Загрузка звонков…
          </div>
        ) : (
          <StackedPortionBarChart
            data={data}
            xKey="bucketLabel"
            totalKey="n1TotalCalls"
            partKey="n2ConsultationCalls"
            compact={compact}
            xAxisLabel="Период"
            totalLabel="Все обращения"
            partLabel="Консультационные обращения"
            coverageLabel="Доля консультаций"
            granularity={granularity}
            valueFormatter={(value) => Math.round(value).toLocaleString('ru-RU')}
          />
        )}
      </CardContent>
    </Card>
  )
}
