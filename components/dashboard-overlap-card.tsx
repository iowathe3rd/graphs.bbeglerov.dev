'use client'

import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  OverlapAnalytics,
  OverlapDimension,
  OverlapSnapshotPoint,
  OverlapZone,
} from '@/lib/metrics-data'

interface DashboardOverlapCardProps {
  data: OverlapAnalytics
  dimension: OverlapDimension
  activeLabel?: string
  onDimensionChange: (dimension: OverlapDimension) => void
  onSelect: (label: string) => void
  onClearSelection: () => void
}

type ZoneFilter = 'all' | OverlapZone

const SERIES_COLORS = [
  '#4A87D9',
  '#45A389',
  '#6D88C9',
  '#C08B54',
  '#B87595',
  '#7DA66A',
  '#8B7BC9',
  '#C17E7E',
] as const

function zoneFill(zone: OverlapZone) {
  if (zone === 'red') return 'rgba(217, 124, 124, 0.13)'
  if (zone === 'yellow') return 'rgba(216, 193, 122, 0.14)'
  return 'rgba(121, 188, 147, 0.13)'
}

function zoneLabel(zone: OverlapZone) {
  if (zone === 'red') return 'Красная'
  if (zone === 'yellow') return 'Жёлтая'
  return 'Зелёная'
}

function nextUpperBound(maxOverlapRate: number) {
  const target = Math.ceil((maxOverlapRate + 10) / 10) * 10
  return Math.max(40, Math.min(100, target))
}

function shortLabel(label: string) {
  if (label.length <= 12) return label
  return `${label.slice(0, 11)}...`
}

function formatDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return dateKey
  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')}`
}

type ChartRow = Record<string, string | number>

type LatestMarker = {
  date: string
  overlapRate: number
  seriesId: string
  label: string
  color: string
}

export function DashboardOverlapCard({
  data,
  dimension,
  activeLabel,
  onDimensionChange,
  onSelect,
  onClearSelection,
}: DashboardOverlapCardProps) {
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all')

  const snapshotByLabel = useMemo(() => {
    const map = new Map<string, OverlapSnapshotPoint>()
    for (const point of data.snapshot) {
      map.set(point.label, point)
    }
    return map
  }, [data.snapshot])

  const zoneStats = useMemo(() => {
    let green = 0
    let yellow = 0
    let red = 0

    for (const point of data.snapshot) {
      if (point.zone === 'green') green += 1
      if (point.zone === 'yellow') yellow += 1
      if (point.zone === 'red') red += 1
    }

    return { green, yellow, red }
  }, [data.snapshot])

  const allSeries = useMemo(() => data.timeline.slice(0, 12), [data.timeline])

  const visibleSeries = useMemo(() => {
    if (zoneFilter === 'all') return allSeries
    return allSeries.filter((series) => snapshotByLabel.get(series.label)?.zone === zoneFilter)
  }, [allSeries, snapshotByLabel, zoneFilter])

  const colorBySeriesId = useMemo(() => {
    const map = new Map<string, string>()
    for (let index = 0; index < allSeries.length; index += 1) {
      map.set(allSeries[index].id, SERIES_COLORS[index % SERIES_COLORS.length])
    }
    return map
  }, [allSeries])

  const chartRows = useMemo(() => {
    const rows = new Map<string, ChartRow>()

    for (const series of visibleSeries) {
      for (const point of series.points) {
        const row = rows.get(point.date) ?? { date: point.date }
        row[series.id] = point.overlapRate
        rows.set(point.date, row)
      }
    }

    return Array.from(rows.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    )
  }, [visibleSeries])

  const yMax = useMemo(() => {
    let maxRate = 0
    for (const series of visibleSeries) {
      for (const point of series.points) {
        if (point.overlapRate > maxRate) {
          maxRate = point.overlapRate
        }
      }
    }
    return nextUpperBound(maxRate)
  }, [visibleSeries])

  const latestMarkers = useMemo(() => {
    const markers: LatestMarker[] = []

    for (const series of visibleSeries) {
      const lastPoint = series.points[series.points.length - 1]
      if (!lastPoint) continue

      markers.push({
        date: lastPoint.date,
        overlapRate: lastPoint.overlapRate,
        seriesId: series.id,
        label: series.label,
        color: colorBySeriesId.get(series.id) ?? '#7C8EA3',
      })
    }

    return markers
  }, [colorBySeriesId, visibleSeries])

  const labelBySeriesId = useMemo(() => {
    const map = new Map<string, string>()
    for (const series of visibleSeries) {
      map.set(series.id, series.label)
    }
    return map
  }, [visibleSeries])

  const handleResetLocal = () => {
    setZoneFilter('all')
    onClearSelection()
  }

  return (
    <Card className="flex h-full min-h-0 flex-col border-border/70 bg-card/95">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Overlap</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={dimension === 'domain' ? 'default' : 'outline'}
              className="h-6 px-2 text-[10px]"
              onClick={() => {
                onDimensionChange('domain')
                setZoneFilter('all')
              }}
            >
              Домены
            </Button>
            <Button
              size="sm"
              variant={dimension === 'indicator' ? 'default' : 'outline'}
              className="h-6 px-2 text-[10px]"
              onClick={() => {
                onDimensionChange('indicator')
                setZoneFilter('all')
              }}
            >
              Индикаторы
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <Badge
              variant={zoneFilter === 'all' ? 'default' : 'outline'}
              className="h-5 cursor-pointer px-2 text-[10px]"
              onClick={() => setZoneFilter('all')}
            >
              Все ({allSeries.length})
            </Badge>
            <Badge
              variant={zoneFilter === 'green' ? 'default' : 'outline'}
              className="h-5 cursor-pointer px-2 text-[10px]"
              onClick={() => setZoneFilter('green')}
            >
              Зелёная ({zoneStats.green})
            </Badge>
            <Badge
              variant={zoneFilter === 'yellow' ? 'default' : 'outline'}
              className="h-5 cursor-pointer px-2 text-[10px]"
              onClick={() => setZoneFilter('yellow')}
            >
              Жёлтая ({zoneStats.yellow})
            </Badge>
            <Badge
              variant={zoneFilter === 'red' ? 'default' : 'outline'}
              className="h-5 cursor-pointer px-2 text-[10px]"
              onClick={() => setZoneFilter('red')}
            >
              Красная ({zoneStats.red})
            </Badge>
            {activeLabel && (
              <Badge variant="secondary" className="h-5 px-2 text-[10px]">
                {shortLabel(activeLabel)}
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px]"
            onClick={handleResetLocal}
          >
            Сброс
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pb-3 pt-0">
        {visibleSeries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Нет данных для выбранного фильтра
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartRows} margin={{ left: 0, right: 6, top: 4, bottom: 24 }}>
              <ReferenceArea y1={0} y2={Math.min(10, yMax)} fill={zoneFill('green')} />
              <ReferenceArea
                y1={Math.min(10, yMax)}
                y2={Math.min(30, yMax)}
                fill={zoneFill('yellow')}
              />
              <ReferenceArea y1={Math.min(30, yMax)} y2={yMax} fill={zoneFill('red')} />

              <CartesianGrid
                strokeDasharray="2 8"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={22}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatDateLabel(String(value))}
              />
              <YAxis
                domain={[0, yMax]}
                tickLine={false}
                axisLine={false}
                width={38}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null

                  const rows = payload
                    .filter(
                      (item) =>
                        typeof item.value === 'number' &&
                        item.dataKey &&
                        labelBySeriesId.has(String(item.dataKey))
                    )
                    .sort((a, b) => Number(b.value) - Number(a.value))
                    .slice(0, 8)

                  if (rows.length === 0) return null

                  return (
                    <div className="rounded-md border border-border bg-background px-2.5 py-2 text-xs shadow-sm">
                      <p className="mb-1 font-semibold">
                        {formatDateLabel(String(label))}
                      </p>
                      <div className="space-y-1">
                        {rows.map((item) => {
                          const key = String(item.dataKey)
                          const name = labelBySeriesId.get(key) ?? key
                          const color = colorBySeriesId.get(key) ?? '#7C8EA3'
                          return (
                            <div key={key} className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <span>{shortLabel(name)}</span>
                              </span>
                              <span className="font-medium">{Number(item.value).toFixed(1)}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }}
              />

              {visibleSeries.map((series) => {
                const color = colorBySeriesId.get(series.id) ?? '#7C8EA3'
                const selected = activeLabel === series.label

                return (
                  <Line
                    key={series.id}
                    type="linear"
                    dataKey={series.id}
                    stroke={color}
                    strokeWidth={selected ? 2.1 : 1.35}
                    strokeOpacity={selected ? 0.96 : 0.56}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                    onClick={() => onSelect(series.label)}
                  />
                )
              })}

              <Scatter
                data={latestMarkers}
                shape={(props: any) => {
                  const marker = props?.payload as LatestMarker | undefined
                  if (!marker) return <g />
                  const selected = activeLabel === marker.label

                  return (
                    <g onClick={() => onSelect(marker.label)} style={{ cursor: 'pointer' }}>
                      <circle cx={props.cx} cy={props.cy} r={7} fill="transparent" />
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={selected ? 3.6 : 3}
                        fill={marker.color}
                        stroke={selected ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                        strokeWidth={selected ? 1.8 : 1}
                      />
                    </g>
                  )
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
