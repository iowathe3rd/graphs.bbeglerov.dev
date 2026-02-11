'use client'

import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HeatmapCell } from '@/lib/metrics-data'

interface MetricsHeatmapChartProps {
  data: HeatmapCell[]
  title?: string
  activeSelection?: {
    channel?: string
    hour?: number
  }
  onCellSelect: (selection: { channel: string; hour: number }) => void
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

export function MetricsHeatmapChart({
  data,
  title = 'Heatmap: Hour × Channel',
  activeSelection,
  onCellSelect,
}: MetricsHeatmapChartProps) {
  const channels = useMemo(() => {
    const unique = new Set<string>()

    for (const cell of data) {
      unique.add(cell.channel)
    }

    return Array.from(unique)
  }, [data])

  const maxCount = useMemo(() => {
    let max = 0

    for (const cell of data) {
      if (cell.count > max) {
        max = cell.count
      }
    }

    return max
  }, [data])

  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()

    for (const cell of data) {
      map.set(`${cell.channel}|${cell.hour}`, cell)
    }

    return map
  }, [data])

  if (!channels.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных для Heatmap</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-auto">
          <div className="min-w-[880px]">
            <div className="mb-2 grid grid-cols-[180px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground">
              <div className="px-2">Channel / Hour</div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={`head-${hour}`} className="text-center">
                  {hour}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel}
                  className="grid grid-cols-[180px_repeat(24,minmax(0,1fr))] gap-1"
                >
                  <div className="flex items-center rounded border border-border bg-card px-2 text-xs">
                    {channel}
                  </div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = cellMap.get(`${channel}|${hour}`)
                    const count = cell?.count ?? 0
                    const breaches = cell?.slaBreaches ?? 0
                    const intensity = maxCount > 0 ? count / maxCount : 0
                    const alpha = 0.08 + intensity * 0.82
                    const selected =
                      activeSelection?.channel === channel && activeSelection?.hour === hour

                    return (
                      <button
                        key={`${channel}-${hour}`}
                        type="button"
                        onClick={() => onCellSelect({ channel, hour })}
                        className="h-9 rounded border text-[10px] font-medium transition"
                        style={{
                          borderColor: selected
                            ? 'hsl(var(--primary))'
                            : 'hsl(var(--border))',
                          backgroundColor: `hsl(var(--chart-1) / ${alpha})`,
                          color: selected
                            ? 'hsl(var(--primary-foreground))'
                            : 'hsl(var(--foreground))',
                        }}
                        title={`${channel} ${formatHour(hour)} • count:${count} • breaches:${breaches}`}
                      >
                        {count}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="h-2 w-40 rounded bg-[linear-gradient(to_right,hsl(var(--chart-1)_/_0.12),hsl(var(--chart-1)_/_0.95))]" />
          <span>High</span>
        </div>

        {activeSelection?.channel && activeSelection.hour !== undefined && (
          <Badge variant="outline">
            selected: {activeSelection.channel} • {formatHour(activeSelection.hour)}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
