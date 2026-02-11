'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type {
  OverlapAnalytics,
  OverlapDimension,
  OverlapGranularity,
  OverlapZone,
} from '@/lib/metrics-data'

interface MetricsOverlapZonesChartProps {
  data: OverlapAnalytics
  dimension: OverlapDimension
  granularity: OverlapGranularity
  title?: string
  activeLabel?: string
  onDimensionChange: (dimension: OverlapDimension) => void
  onGranularityChange: (granularity: OverlapGranularity) => void
  onEntitySelect: (selection: { dimension: OverlapDimension; value: string }) => void
}

const SERIES_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
] as const

function zoneFill(zone: OverlapZone) {
  if (zone === 'red') {
    return 'rgba(204, 67, 67, 0.35)'
  }

  if (zone === 'yellow') {
    return 'rgba(214, 173, 38, 0.38)'
  }

  return 'rgba(59, 179, 94, 0.34)'
}

function zoneStroke(zone: OverlapZone) {
  if (zone === 'red') {
    return 'rgb(171, 35, 35)'
  }

  if (zone === 'yellow') {
    return 'rgb(157, 120, 3)'
  }

  return 'rgb(34, 130, 64)'
}

function zoneLabel(zone: OverlapZone) {
  if (zone === 'red') {
    return 'красная'
  }

  if (zone === 'yellow') {
    return 'жёлтая'
  }

  return 'зелёная'
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatDateLabel(dateKey: string, granularity: OverlapGranularity) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  if (granularity === 'month') {
    return `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(
      date.getUTCFullYear()
    ).slice(-2)}`
  }

  const base = `${String(date.getUTCDate()).padStart(2, '0')}.${String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')}`
  return granularity === 'week' ? `нед. ${base}` : base
}

function bucketLabel(granularity: OverlapGranularity) {
  if (granularity === 'month') {
    return 'Месяцы'
  }

  return granularity === 'week' ? 'Недели' : 'Дни'
}

export function MetricsOverlapZonesChart({
  data,
  dimension,
  granularity,
  title = 'Наслаивания проблем',
  activeLabel,
  onDimensionChange,
  onGranularityChange,
  onEntitySelect,
}: MetricsOverlapZonesChartProps) {
  const chartConfig = {
    overlap: {
      label: 'Доля пересечений',
      color: 'hsl(var(--chart-1))',
    },
  }

  const snapshotData = useMemo(
    () => [...data.snapshot].sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    [data.snapshot]
  )

  const maxSnapshotIntersections = useMemo(() => {
    let max = 0
    for (const point of snapshotData) {
      if (point.intersections > max) {
        max = point.intersections
      }
    }
    return max
  }, [snapshotData])

  const timelineRows = useMemo(() => {
    const rows = new Map<string, Record<string, string | number>>()

    for (const series of data.timeline) {
      for (const point of series.points) {
        const current = rows.get(point.date) ?? { date: point.date }
        current[series.id] = point.overlapRate
        current[`${series.id}__intersections`] = point.intersections
        current[`${series.id}__zone`] = point.zone
        rows.set(point.date, current)
      }
    }

    return Array.from(rows.values()).sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    )
  }, [data.timeline])

  const maxTimelineIntersections = useMemo(() => {
    let max = 0
    for (const series of data.timeline) {
      for (const point of series.points) {
        if (point.intersections > max) {
          max = point.intersections
        }
      }
    }
    return max
  }, [data.timeline])

  if (snapshotData.length === 0 || data.timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Нет данных для графика пересечений
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={dimension === 'domain' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onDimensionChange('domain')}
              >
                Домены
              </Button>
              <Button
                size="sm"
                variant={dimension === 'indicator' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onDimensionChange('indicator')}
              >
                Индикаторы
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant={granularity === 'day' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onGranularityChange('day')}
              >
                Дни
              </Button>
              <Button
                size="sm"
                variant={granularity === 'week' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onGranularityChange('week')}
              >
                Недели
              </Button>
              <Button
                size="sm"
                variant={granularity === 'month' ? 'default' : 'outline'}
                className="h-8"
                onClick={() => onGranularityChange('month')}
              >
                Месяцы
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Состояние по {dimension === 'domain' ? 'доменам' : 'индикаторам'}
          </h3>
          <ChartContainer config={chartConfig} className="h-[340px] w-full">
            <ScatterChart margin={{ left: 6, right: 18, top: 10, bottom: 56 }}>
              <ReferenceArea y1={0} y2={10} fill={zoneFill('green')} />
              <ReferenceArea y1={10} y2={30} fill={zoneFill('yellow')} />
              <ReferenceArea y1={30} y2={100} fill={zoneFill('red')} />
              <CartesianGrid strokeDasharray="2 8" stroke="hsl(var(--border))" />
              <XAxis
                type="category"
                dataKey="label"
                interval={0}
                angle={-55}
                textAnchor="end"
                height={72}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="number"
                dataKey="overlapRate"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={56}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ZAxis
                dataKey="intersections"
                range={[90, 600]}
                domain={[0, Math.max(1, maxSnapshotIntersections)]}
              />
              <RechartsTooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null
                  }

                  const point = payload[0]?.payload as
                    | (typeof snapshotData)[number]
                    | undefined

                  if (!point) {
                    return null
                  }

                  return (
                    <BerekeChartTooltip
                      title={point.label}
                      rows={[
                        {
                          id: `${point.label}-rate`,
                          label: 'Доля пересечений',
                          value: formatPercent(point.overlapRate),
                          strong: true,
                        },
                        {
                          id: `${point.label}-intersections`,
                          label: 'Наслаиваний',
                          value: `${point.intersections}`,
                        },
                        {
                          id: `${point.label}-total`,
                          label: 'Обращений',
                          value: `${point.totalCases}`,
                        },
                      ]}
                    />
                  )
                }}
              />
              <Scatter
                data={snapshotData}
                shape={(props: any) => {
                  const point = props?.payload as (typeof snapshotData)[number] | undefined
                  if (!point) {
                    return <g />
                  }

                  const area = Number(props?.size ?? 120)
                  const radius = Math.max(6, Math.sqrt(area / Math.PI))
                  const selected = activeLabel === point.label

                  return (
                    <g
                      onClick={() =>
                        onEntitySelect({
                          dimension,
                          value: point.label,
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={radius}
                        fill={zoneFill(point.zone)}
                        stroke={selected ? 'hsl(var(--primary))' : zoneStroke(point.zone)}
                        strokeWidth={selected ? 3 : 1.5}
                      />
                    </g>
                  )
                }}
              />
            </ScatterChart>
          </ChartContainer>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Динамика наслаиваний ({bucketLabel(granularity).toLowerCase()})
          </h3>
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <LineChart data={timelineRows} margin={{ left: 6, right: 18, top: 12, bottom: 18 }}>
              <ReferenceArea y1={0} y2={10} fill={zoneFill('green')} />
              <ReferenceArea y1={10} y2={30} fill={zoneFill('yellow')} />
              <ReferenceArea y1={30} y2={100} fill={zoneFill('red')} />
              <CartesianGrid strokeDasharray="2 8" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatDateLabel(String(value), granularity)}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                minTickGap={24}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={56}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null
                  }

                  const rows = payload
                    .filter((item) => Number(item.value) > 0)
                    .sort((a, b) => Number(b.value) - Number(a.value))
                    .map((item) => {
                      const seriesId = String(item.dataKey)
                      const row = item.payload as Record<string, string | number>
                      const intersections = Number(
                        row[`${seriesId}__intersections`] ?? 0
                      )
                      const zone = String(row[`${seriesId}__zone`] ?? 'green')

                      return {
                        id: seriesId,
                        label: `${item.name} · ${zoneLabel(zone as OverlapZone)} · ${intersections}`,
                        value: formatPercent(Number(item.value)),
                        color:
                          typeof item.color === 'string'
                            ? item.color
                            : 'hsl(var(--chart-1))',
                      }
                    })

                  return (
                    <BerekeChartTooltip
                      title={formatDateLabel(String(label), granularity)}
                      rows={rows}
                    />
                  )
                }}
              />

              {data.timeline.map((series, index) => {
                const color = SERIES_COLORS[index % SERIES_COLORS.length]
                const seriesId = series.id

                return (
                  <Line
                    key={seriesId}
                    type="linear"
                    name={series.label}
                    dataKey={seriesId}
                    stroke={color}
                    strokeWidth={activeLabel === series.label ? 3 : 2}
                    connectNulls={false}
                    dot={(props: any) => {
                      const row = props?.payload as Record<string, string | number> | undefined
                      if (!row) {
                        return <g />
                      }

                      const intersections = Number(
                        row[`${seriesId}__intersections`] ?? 0
                      )
                      if (intersections <= 0) {
                        return <g />
                      }

                      const zone = String(
                        row[`${seriesId}__zone`] ?? 'green'
                      ) as OverlapZone
                      const selected = activeLabel === series.label
                      const radius =
                        3 +
                        (maxTimelineIntersections > 0
                          ? (intersections / maxTimelineIntersections) * 6
                          : 0)
                      const dotKey = `${seriesId}-${String(row.date ?? 'unknown')}`

                      return (
                        <g
                          key={dotKey}
                          onClick={() =>
                            onEntitySelect({
                              dimension,
                              value: series.label,
                            })
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={radius}
                            fill={zoneFill(zone)}
                            stroke={selected ? 'hsl(var(--primary))' : color}
                            strokeWidth={selected ? 2.6 : 1.6}
                          />
                        </g>
                      )
                    }}
                    activeDot={{
                      r: 6,
                      stroke: 'hsl(var(--primary))',
                      strokeWidth: 2,
                    }}
                  />
                )
              })}
            </LineChart>
          </ChartContainer>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(59,179,94,0.78)]" />
            0-10%: зелёная
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(214,173,38,0.78)]" />
            11-30%: жёлтая
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(204,67,67,0.78)]" />
            31-100%: красная
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {data.timeline.map((series, index) => (
            <Badge
              key={series.id}
              variant={activeLabel === series.label ? 'default' : 'secondary'}
              className="cursor-pointer"
              style={
                activeLabel === series.label
                  ? undefined
                  : {
                      backgroundColor: `${SERIES_COLORS[index % SERIES_COLORS.length]}22`,
                      color: SERIES_COLORS[index % SERIES_COLORS.length],
                    }
              }
              onClick={() =>
                onEntitySelect({
                  dimension,
                  value: series.label,
                })
              }
            >
              {series.label} · {series.intersections}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
