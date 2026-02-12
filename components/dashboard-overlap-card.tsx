'use client'

import { OverlapMultiLineChart } from '@/components/overlap/overlap-multi-line-chart'
import { Card, CardContent } from '@/components/ui/card'
import type {
  OverlapAnalytics,
  OverlapGranularity,
  OverlapZoneConfig,
} from '@/lib/metrics-data'

interface DashboardOverlapCardProps {
  data: OverlapAnalytics
  granularity: OverlapGranularity
  selectedSeries: string[]
  onGranularityChange: (granularity: OverlapGranularity) => void
  onSelectedSeriesChange: (next: string[]) => void
  seriesColorMap?: Record<string, string>
  zones?: OverlapZoneConfig
}

export function DashboardOverlapCard({
  data,
  granularity,
  selectedSeries,
  onGranularityChange,
  onSelectedSeriesChange,
  seriesColorMap,
  zones,
}: DashboardOverlapCardProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardContent className=" h-full min-h-0 p-0 w-full">
        <OverlapMultiLineChart
          analytics={data}
          title="Общий график"
          granularity={granularity}
          onGranularityChange={onGranularityChange}
          selectedSeries={selectedSeries}
          onSelectedSeriesChange={onSelectedSeriesChange}
          seriesColorMap={seriesColorMap}
          zones={zones}
        />
      </CardContent>
    </Card>
  )
}
