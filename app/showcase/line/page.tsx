'use client'

import { useMemo, useState } from 'react'

import { MetricsLineChart } from '@/components/metrics-line-chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  METRICS,
  SECTORS,
  generateEventStream,
  generateMetricsDataFromEvents,
  type Sector,
} from '@/lib/metrics-data'

const IDS = ['sla', 'aht', 'queueLoad', 'abandonment'] as const

export default function ShowcaseLinePage() {
  const [sector, setSector] = useState<Sector>('БММБ')

  const events = useMemo(
    () => generateEventStream(36000, 180, 42, sector),
    [sector]
  )
  const metricsData = useMemo(
    () => generateMetricsDataFromEvents(events, 90),
    [events]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl tracking-tight">Line Charts</h1>
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

      <div className="grid gap-4 lg:grid-cols-2">
        {IDS.map((id) => (
          <MetricsLineChart
            key={id}
            data={(metricsData[id] ?? []).slice(-60)}
            metric={METRICS[id]}
          />
        ))}
      </div>
    </div>
  )
}
