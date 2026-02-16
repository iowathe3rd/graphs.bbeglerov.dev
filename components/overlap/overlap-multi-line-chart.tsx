'use client'

import { useMemo } from 'react'
import type { SVGProps } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CircleHelp, RotateCcw } from 'lucide-react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useIsMobile } from '@/hooks/use-mobile'
import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildOverlapBuckets,
  type OverlapAnalytics,
  type OverlapBucketSummary,
  type OverlapGranularity,
  type OverlapZoneConfig,
} from '@/lib/metrics-data'

interface OverlapMultiLineChartProps {
  analytics: OverlapAnalytics
  title?: string
  granularity: OverlapGranularity
  selectedSeries: string[]
  onSelectedSeriesChange: (next: string[]) => void
  seriesColorMap?: Record<string, string>
  zones?: OverlapZoneConfig
  yTickStep?: number
  valueFormatter?: (value: number) => string
  xLabelFormatter?: (bucket: string, granularity: OverlapGranularity) => string
  maxVisibleSeries?: {
    mobile: number
    desktop: number
  }
  topTooltipRows?: number
  curveType?: 'linear' | 'monotone'
}

type ChartRow = Record<string, string | number>

const SERIES_COLORS = [
  '#2E69D6',
  '#2F8F7A',
  '#5C7FDD',
  '#B5793D',
  '#A55A83',
  '#6A9A5F',
  '#6167D9',
  '#D77272',
  '#5E738F',
  '#3F97C7',
] as const

const DEFAULT_ZONES: Required<OverlapZoneConfig> = {
  greenMax: 20,
  yellowMax: 40,
  max: 100,
}

function mergeZones(zones?: OverlapZoneConfig): Required<OverlapZoneConfig> {
  if (!zones) {
    return DEFAULT_ZONES
  }

  const max = zones.max ?? DEFAULT_ZONES.max
  const greenMax = Math.max(0, Math.min(zones.greenMax, max))
  const yellowMax = Math.max(greenMax, Math.min(zones.yellowMax, max))

  return {
    greenMax,
    yellowMax,
    max,
  }
}

function zoneFill(zone: 'green' | 'yellow' | 'red') {
  if (zone === 'red') return 'rgba(217, 124, 124, 0.3)'
  if (zone === 'yellow') return 'rgba(216, 193, 122, 0.3)'
  return 'rgba(121, 188, 147, 0.3)'
}

function shortLabel(label: string) {
  if (label.length <= 22) return label
  return `${label.slice(0, 21)}...`
}

function defaultValueFormatter(value: number) {
  return `${value.toFixed(1)}%`
}

function defaultBucketLabelFormatter(dateKey: string, granularity: OverlapGranularity) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return dateKey

  if (granularity === 'day' || granularity === 'week' || granularity === 'month') {
    return format(date, 'dd.MM', { locale: ru })
  }

  return dateKey
}

function buildColorMap(labels: string[], seriesColorMap?: Record<string, string>) {
  const map = new Map<string, string>()
  for (let index = 0; index < labels.length; index += 1) {
    const label = labels[index]
    map.set(label, seriesColorMap?.[label] ?? SERIES_COLORS[index % SERIES_COLORS.length])
  }
  return map
}

function tooltipDateLabel(dateKey: string, granularity: OverlapGranularity) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  if (granularity === 'day' || granularity === 'week' || granularity === 'month') {
    return format(date, 'dd.MM.yyyy', { locale: ru })
  }

  return dateKey
}

function buildYTicks(step: number, max: number) {
  const safeStep = Math.max(1, Math.floor(step))
  const ticks: number[] = []

  for (let value = 0; value <= max; value += safeStep) {
    ticks.push(value)
  }

  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max)
  }

  return ticks
}

function buildZoneTicks(step: number, zoneConfig: Required<OverlapZoneConfig>) {
  const yTicks = buildYTicks(step, zoneConfig.max)
  const zoneTicks = [0, zoneConfig.greenMax, zoneConfig.yellowMax, zoneConfig.max]

  return Array.from(new Set([...yTicks, ...zoneTicks])).sort((a, b) => a - b)
}

function zoneTickColor(value: number, zoneConfig: Required<OverlapZoneConfig>) {
  if (value <= zoneConfig.greenMax) {
    return '#2F8F7A'
  }

  if (value <= zoneConfig.yellowMax) {
    return '#B5793D'
  }

  return '#D77272'
}

function formatAxisPercent(value: number) {
  return `${Math.round(value)}%`
}

function removeSeries(selectedSeries: string[], label: string) {
  return selectedSeries.filter((item) => item !== label)
}

function toggleSeries(selectedSeries: string[], label: string) {
  if (selectedSeries.includes(label)) {
    return removeSeries(selectedSeries, label)
  }

  return [...selectedSeries, label]
}

export function OverlapMultiLineChart({
  analytics,
  title = 'Температурная карта',
  granularity,
  selectedSeries,
  onSelectedSeriesChange,
  seriesColorMap,
  zones,
  yTickStep = 20,
  valueFormatter = defaultValueFormatter,
  xLabelFormatter = defaultBucketLabelFormatter,
  maxVisibleSeries = { mobile: 6, desktop: 10 },
  topTooltipRows = 6,
  curveType = 'monotone',
}: OverlapMultiLineChartProps) {
  const isMobile = useIsMobile()
  const visibleSeriesLimit = isMobile
    ? maxVisibleSeries.mobile
    : maxVisibleSeries.desktop
  const zoneConfig = useMemo(() => mergeZones(zones), [zones])
  const selectedSet = useMemo(() => new Set(selectedSeries), [selectedSeries])
  const hasSelection = selectedSet.size > 0

  const buckets = useMemo(
    () =>
      buildOverlapBuckets(analytics, {
        granularity,
        selectedSeries,
        visibleSeriesLimit,
        zones: zoneConfig,
        valueTransform: ({ avgOverlapRate }) => avgOverlapRate,
      }),
    [analytics, granularity, selectedSeries, visibleSeriesLimit, zoneConfig]
  )

  const seriesLabels = useMemo(() => {
    if (buckets.length === 0) return []
    return Object.keys(buckets[0].seriesValues)
  }, [buckets])

  const colorBySeries = useMemo(
    () => buildColorMap(seriesLabels, seriesColorMap),
    [seriesLabels, seriesColorMap]
  )

  const chartRows = useMemo(() => {
    const rows: ChartRow[] = []

    for (const bucket of buckets) {
      const row: ChartRow = {
        date: bucket.date,
      }

      for (const [label, value] of Object.entries(bucket.seriesValues)) {
        row[label] = value
      }

      rows.push(row)
    }

    return rows
  }, [buckets])

  const bucketByDate = useMemo(() => {
    const map = new Map<string, OverlapBucketSummary>()
    for (const bucket of buckets) {
      map.set(bucket.date, bucket)
    }
    return map
  }, [buckets])

  const yTicks = useMemo(() => buildZoneTicks(yTickStep, zoneConfig), [yTickStep, zoneConfig])

  const hasData = chartRows.length > 0 && seriesLabels.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col px-3 pb-3 pt-4 sm:px-4 sm:pt-5 md:px-6 md:pt-6">
      <div className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground/95">
            <span className="inline-flex items-center gap-1.5">
              {title}
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Расшифровка зон температурной карты"
                    >
                      <CircleHelp className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] text-xs leading-relaxed">
                    <p>
                      З — зелёная зона, Ж — жёлтая зона, К — красная зона.
                      Цифры показывают, сколько индикаторов попало в каждую
                      зону на выбранной дате.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-h-7 flex-1 flex-wrap items-center gap-1">
            {selectedSeries.map((label) => (
              <Badge
                key={label}
                className="h-5 cursor-pointer px-2 text-[10px]"
                onClick={() =>
                  onSelectedSeriesChange(removeSeries(selectedSeries, label))
                }
                role="button"
                aria-label={`Снять фильтр ${label}`}
                aria-pressed="true"
              >
                {shortLabel(label)}
              </Badge>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 w-full border-border/70 bg-background/70 px-2 text-[11px] font-medium sm:w-auto"
            onClick={() => onSelectedSeriesChange([])}
            disabled={selectedSeries.length === 0}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Сброс
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 pb-1 pt-0">
        {!hasData ? (
          <div className="flex h-full min-h-0 items-center justify-center text-xs text-muted-foreground/90">
            Нет данных
          </div>
        ) : (
          <div className="h-full min-h-[260px] overflow-hidden rounded-xl bg-background/10 md:min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartRows}
                margin={{ left: 8, right: 2, top: 8, bottom: 10 }}
              >
                <ReferenceArea
                  y1={0}
                  y2={zoneConfig.greenMax}
                  fill={zoneFill('green')}
                />
                <ReferenceArea
                  y1={zoneConfig.greenMax}
                  y2={zoneConfig.yellowMax}
                  fill={zoneFill('yellow')}
                />
                <ReferenceArea
                  y1={zoneConfig.yellowMax}
                  y2={zoneConfig.max}
                  fill={zoneFill('red')}
                />

                <CartesianGrid
                  strokeDasharray="3 8"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.7}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={isMobile ? 28 : 18}
                  tickMargin={8}
                  tick={{
                    fontSize: isMobile ? 10 : 11,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                  tickFormatter={(value) =>
                    xLabelFormatter(String(value), granularity)
                  }
                />
                <YAxis
                  domain={[0, zoneConfig.max]}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 40 : 52}
                  tickMargin={4}
                  ticks={yTicks}
                  tick={(props: SVGProps<SVGTextElement> & { payload?: { value: number } }) => {
                    const value = Number(props.payload?.value ?? 0)

                    return (
                      <text
                        x={props.x}
                        y={props.y}
                        dy={props.dy}
                        textAnchor="end"
                        fill={zoneTickColor(value, zoneConfig)}
                        fontSize={isMobile ? 10 : 11}
                      >
                        {formatAxisPercent(value)}
                      </text>
                    )
                  }}
                />

                <RechartsTooltip
                  cursor={{
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 1,
                    strokeOpacity: 0.32,
                  }}
                  content={({ active, label }) => {
                    if (!active || !label) return null

                    const bucket = bucketByDate.get(String(label))
                    if (!bucket) return null

                    const rows = bucket.sortedSeries.slice(0, topTooltipRows)
                    if (rows.length === 0) return null

                    return (
                      <BerekeChartTooltip
                        title={tooltipDateLabel(String(label), granularity)}
                        subtitle={`Зелёная: ${bucket.zoneCounts.green}, Жёлтая: ${bucket.zoneCounts.yellow}, Красная: ${bucket.zoneCounts.red}`}
                        rows={rows.map((row) => ({
                          id: row.label,
                          label: shortLabel(row.label),
                          value: valueFormatter(row.value),
                          color: colorBySeries.get(row.label) ?? '#2E69D6',
                          strong: selectedSet.has(row.label),
                        }))}
                      />
                    )
                  }}
                />

                {seriesLabels.map((label) => {
                  const selected = selectedSet.has(label)
                  const strokeOpacity = selected
                    ? 0.96
                    : hasSelection
                      ? 0.3
                      : 0.78

                  return (
                    <Line
                      key={label}
                      type={curveType}
                      dataKey={label}
                      stroke={colorBySeries.get(label) ?? '#2E69D6'}
                      strokeWidth={selected ? 2.45 : 1.7}
                      strokeOpacity={strokeOpacity}
                      isAnimationActive={false}
                      connectNulls
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: colorBySeries.get(label) ?? '#2E69D6',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      onClick={() =>
                        onSelectedSeriesChange(toggleSeries(selectedSeries, label))
                      }
                    />
                  )
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
