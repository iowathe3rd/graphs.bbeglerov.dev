'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CallCoverageBucket } from '@/features/insight-dashboard/domain/types'
import { StackedPortionBarChart } from '@/features/insight-dashboard/ui/stacked-portion-bar-chart'
import { cn } from '@/lib/utils'

interface CallCoverageChartCardProps {
  data: CallCoverageBucket[]
  loading?: boolean
  compact?: boolean
  className?: string
}

export function CallCoverageChartCard({
  data,
  loading = false,
  compact = false,
  className,
}: CallCoverageChartCardProps) {
  return (
    <Card className={cn('flex h-full flex-col', compact ? 'min-h-0' : 'min-h-[260px]', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Обращения с проблемными тегами</CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Серый столбец — все обращения, оранжевый — обращения, где есть хотя бы один тег.
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
            partKey="n2CallsWithAnyIndicator"
            height={190}
            xAxisLabel="Дата"
            totalLabel="Все обращения"
            partLabel="Проблемные обращения"
            valueFormatter={(value) => Math.round(value).toLocaleString('ru-RU')}
          />
        )}
      </CardContent>
    </Card>
  )
}
