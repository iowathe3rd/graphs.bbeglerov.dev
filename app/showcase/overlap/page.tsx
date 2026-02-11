'use client'

import { useMemo, useState } from 'react'

import { MetricsOverlapZonesChart } from '@/components/metrics-overlap-zones-chart'
import { Button } from '@/components/ui/button'
import {
  SECTORS,
  generateEventStream,
  generateOverlapAnalytics,
  type OverlapDimension,
  type OverlapGranularity,
  type Sector,
} from '@/lib/metrics-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ShowcaseOverlapPage() {
  const [sector, setSector] = useState<Sector>('БММБ')
  const [dimension, setDimension] = useState<OverlapDimension>('domain')
  const [granularity, setGranularity] = useState<OverlapGranularity>('week')
  const [activeLabel, setActiveLabel] = useState<string | undefined>(undefined)

  const events = useMemo(
    () => generateEventStream(36000, 180, 42, sector),
    [sector]
  )

  const data = useMemo(
    () =>
      generateOverlapAnalytics(events, {
        dimension,
        granularity,
        topN: 8,
      }),
    [dimension, events, granularity]
  )

  const handleDimensionChange = (value: OverlapDimension) => {
    setDimension(value)
    setActiveLabel(undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl tracking-tight">Overlap Zones</h1>
        <div className="flex items-center gap-2">
          {activeLabel && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setActiveLabel(undefined)}
            >
              Clear
            </Button>
          )}
          <Select value={sector} onValueChange={(value) => setSector(value as Sector)}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MetricsOverlapZonesChart
        data={data}
        dimension={dimension}
        granularity={granularity}
        activeLabel={activeLabel}
        onDimensionChange={handleDimensionChange}
        onGranularityChange={setGranularity}
        onEntitySelect={(selection) => setActiveLabel(selection.value)}
      />
    </div>
  )
}
