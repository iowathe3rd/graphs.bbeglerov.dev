'use client'

import { useMemo, useState } from 'react'

import { MetricsSankeyChart } from '@/components/metrics-sankey-chart'
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
  generateSankeyData,
  type Sector,
} from '@/lib/metrics-data'

interface SankeySelection {
  channel?: string
  process?: string
  status?: string
}

export default function ShowcaseSankeyPage() {
  const [sector, setSector] = useState<Sector>('БММБ')
  const [selection, setSelection] = useState<SankeySelection>({})

  const events = useMemo(
    () => generateEventStream(34000, 180, 42, sector),
    [sector]
  )
  const data = useMemo(
    () => generateSankeyData(events, { flow: 'channel-process-status' }),
    [events]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-xl tracking-tight">Sankey</h1>
        <div className="flex items-center gap-2">
          {(selection.channel || selection.process || selection.status) && (
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

      <MetricsSankeyChart
        data={data}
        activeSelection={selection}
        onNodeSelect={(node) => {
          if (node.nodeType === 'channel') {
            setSelection({ channel: node.value })
            return
          }

          if (node.nodeType === 'process') {
            setSelection({ process: node.value })
            return
          }

          setSelection({ status: node.value })
        }}
      />
    </div>
  )
}
