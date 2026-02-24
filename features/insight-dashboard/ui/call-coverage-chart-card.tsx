'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildConsultationCoverageHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import type { CallCoverageBucket } from '@/features/insight-dashboard/domain/types'
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
    <Card className={cn('flex h-full flex-col', compact ? 'min-h-0' : 'min-h-[260px]', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm">Консультационные обращения</CardTitle>
          <InsightHelpDialogButton
            copy={buildConsultationCoverageHelpDialogCopy()}
            ariaLabel="Как читать график консультационных обращений"
            triggerClassName="h-4 w-4 border-0"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Серый столбец — все обращения, оранжевый — консультационные обращения.
        </p>
      </CardHeader>

      <CardContent className="flex-1 pb-3 pt-0">
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
            height={190}
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
