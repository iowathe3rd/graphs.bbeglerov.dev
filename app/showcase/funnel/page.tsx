'use client'

import { useMemo, useState } from 'react'

import { MetricsFunnelChart } from '@/components/metrics-funnel-chart'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FUNNEL_STAGES,
  SECTORS,
  generateEventStream,
  generateFunnelData,
  type EventStage,
  type Sector,
} from '@/lib/metrics-data'

export default function ShowcaseFunnelPage() {
  const [sector, setSector] = useState<Sector>('БММБ')
  const [activeStage, setActiveStage] = useState<EventStage | undefined>(undefined)

  const events = useMemo(
    () => generateEventStream(34000, 180, 42, sector),
    [sector]
  )
  const data = useMemo(
    () => generateFunnelData(events, { stages: FUNNEL_STAGES }),
    [events]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-xl tracking-tight">Funnel</h1>
        <div className="flex items-center gap-2">
          {activeStage && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setActiveStage(undefined)}
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

      <MetricsFunnelChart
        data={data}
        activeStage={activeStage}
        onStageSelect={setActiveStage}
      />
    </div>
  )
}
