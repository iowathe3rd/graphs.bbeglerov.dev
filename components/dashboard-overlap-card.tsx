'use client'

import { OverlapMultiLineChart } from '@/components/overlap/overlap-multi-line-chart'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type {
  OverlapAnalytics,
  OverlapGranularity,
  OverlapZoneConfig,
} from '@/lib/metrics-data'

interface DashboardOverlapCardProps {
  data: OverlapAnalytics
  granularity: OverlapGranularity
  selectedSeries: string[]
  onSelectedSeriesChange: (next: string[]) => void
  seriesColorMap?: Record<string, string>
  zones?: OverlapZoneConfig
  compact?: boolean
  className?: string
  contentClassName?: string
}

export function DashboardOverlapCard({
  data,
  granularity,
  selectedSeries,
  onSelectedSeriesChange,
  seriesColorMap,
  zones,
  compact = false,
  className,
  contentClassName,
}: DashboardOverlapCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        compact ? 'min-h-0' : 'min-h-[320px]',
        className
      )}
    >
      <CardContent
        className={cn(
          'h-full w-full p-0',
          compact ? 'min-h-0' : 'min-h-[320px]',
          contentClassName
        )}
      >
        <OverlapMultiLineChart
          analytics={data}
          title="Температурная карта"
          granularity={granularity}
          selectedSeries={selectedSeries}
          onSelectedSeriesChange={onSelectedSeriesChange}
          seriesColorMap={seriesColorMap}
          zones={zones}
        />
      </CardContent>
    </Card>
  )
}
