'use client'

import { useMemo, useState } from 'react'

import { MetricsHeatmapChart } from '@/components/metrics-heatmap-chart'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SECTORS,
  generateEventStream,
  generateHeatmapData,
  type Sector,
} from '@/lib/metrics-data'

interface HeatmapSelection {
  channel?: string
  hour?: number
}

export default function ShowcaseHeatmapPage() {
  const [sector, setSector] = useState<Sector>('БММБ')
  const [selection, setSelection] = useState<HeatmapSelection>({})

  const events = useMemo(
    () => generateEventStream(32000, 180, 42, sector),
    [sector]
  )
  const data = useMemo(
    () => generateHeatmapData(events, { axisX: 'hour', axisY: 'channel' }),
    [events]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-xl tracking-tight">Heatmap</h1>
        <div className="flex items-center gap-2">
          {(selection.channel || selection.hour !== undefined) && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setSelection({})}
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

      <MetricsHeatmapChart
        data={data}
        activeSelection={selection}
        onCellSelect={setSelection}
      />
    </div>
  )
}
