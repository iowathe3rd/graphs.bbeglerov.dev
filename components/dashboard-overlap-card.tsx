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
  onSelectedSeriesChange: (next: string[]) => void
  seriesColorMap?: Record<string, string>
  zones?: OverlapZoneConfig
}

export function DashboardOverlapCard({
  data,
  granularity,
  selectedSeries,
  onSelectedSeriesChange,
  seriesColorMap,
  zones,
}: DashboardOverlapCardProps) {
  return (
    <Card className="flex h-full min-h-[320px] flex-col">
      <CardContent className="h-full min-h-[320px] w-full p-0">
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
