'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { formatBucketLabel } from '@/features/insight-dashboard/domain/date-bucketing'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OverlapGranularity } from '@/lib/metrics-data'

interface PreparedDatum<TData extends object> {
  [key: string]: unknown
  __xValue: string
  __totalValue: number
  __partValue: number
  __partRawValue: number
  __coveragePercent: number
  __source: TData
}

interface StackedPortionBarChartProps<TData extends object = Record<string, unknown>> {
  data: TData[]
  xKey: string
  totalKey: string
  partKey: string
  title?: string
  description?: string
  height?: number
  compact?: boolean
  valueFormatter?: (value: number) => string
  onBarClick?: (item: TData) => void
  emptyMessage?: string
  xAxisLabel?: string
  totalLabel?: string
  partLabel?: string
  coverageLabel?: string
  granularity?: OverlapGranularity
  className?: string
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function formatShortDate(value: string, granularity: OverlapGranularity): string {
  return formatBucketLabel(value, granularity, 'short')
}

function formatLongDate(value: string, granularity: OverlapGranularity): string {
  return formatBucketLabel(value, granularity, 'long')
}

function formatCoverage(value: number): string {
  const rounded = Math.round(value * 10) / 10
  const isInteger = Math.abs(rounded - Math.round(rounded)) < 0.001
  return `${isInteger ? Math.round(rounded) : rounded.toFixed(1)}%`
}

export function StackedPortionBarChart<TData extends object = Record<string, unknown>>({
  data,
  xKey,
  totalKey,
  partKey,
  title,
  description,
  height,
  compact = false,
  valueFormatter = (value) => value.toLocaleString('ru-RU'),
  onBarClick,
  emptyMessage = 'Нет данных',
  xAxisLabel = 'Дата',
  totalLabel = 'Все обращения',
  partLabel = 'Обращения с тегами',
  coverageLabel = 'Доля',
  granularity = 'day',
  className,
}: StackedPortionBarChartProps<TData>) {
  const isMobile = useIsMobile()

  const preparedData = useMemo<PreparedDatum<TData>[]>(() => {
    return data.map((item) => {
      const sourceRecord = item as Record<string, unknown>
      const xValue = String(sourceRecord[xKey] ?? '')
      const totalValue = Math.max(0, toNumber(sourceRecord[totalKey]))
      const partRawValue = Math.max(0, toNumber(sourceRecord[partKey]))
      const partValue = Math.min(partRawValue, totalValue)
      const coveragePercent = totalValue > 0 ? (partRawValue / totalValue) * 100 : 0

      return {
        ...sourceRecord,
        __xValue: xValue,
        __totalValue: totalValue,
        __partValue: partValue,
        __partRawValue: partRawValue,
        __coveragePercent: coveragePercent,
        __source: item,
      }
    })
  }, [data, partKey, totalKey, xKey])

  const resolvedMinHeight = height ?? (compact ? (isMobile ? 120 : 136) : isMobile ? 160 : 220)
  const showTopValueLabels = !compact && !isMobile

  if (preparedData.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {title ? <p className="text-sm font-semibold text-foreground">{title}</p> : null}
      {description ? <p className="mt-1 text-[11px] text-muted-foreground">{description}</p> : null}

      <div className="mt-1.5 flex-1 min-h-0" style={{ minHeight: resolvedMinHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={preparedData}
            barCategoryGap={isMobile ? '26%' : '34%'}
            margin={{
              top: 24,
              right: 8,
              bottom: isMobile ? 6 : 4,
              left: isMobile ? 2 : 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="__xValue"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={isMobile ? 16 : 24}
                  tickFormatter={(value) => formatShortDate(String(value), granularity)}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                  label={{
                    value: xAxisLabel,
                position: 'insideBottom',
                offset: -2,
                fill: 'hsl(var(--muted-foreground))',
                fontSize: isMobile ? 10 : 11,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={isMobile ? 30 : 38}
              tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null
                }

                const point = payload[0]?.payload as PreparedDatum<TData> | undefined
                if (!point) {
                  return null
                }

                return (
                  <BerekeChartTooltip
                    title={formatLongDate(point.__xValue, granularity)}
                    rows={[
                      {
                        id: 'total-calls',
                        label: totalLabel,
                        value: valueFormatter(point.__totalValue),
                        color: '#94a3b8',
                      },
                      {
                        id: 'calls-with-indicators',
                        label: partLabel,
                        value: valueFormatter(point.__partRawValue),
                        color: '#f97316',
                      },
                      {
                        id: 'coverage',
                        label: coverageLabel,
                        value: formatCoverage(point.__coveragePercent),
                        color: '#0f172a',
                        strong: true,
                      },
                    ]}
                  />
                )
              }}
            />
            <Bar
              dataKey="__totalValue"
              radius={[6, 6, 0, 0]}
              barSize={compact ? (isMobile ? 14 : 18) : isMobile ? 18 : 24}
              fill="hsl(var(--muted-foreground) / 0.55)"
              shape={(props: any) => {
                const point = props?.payload as PreparedDatum<TData> | undefined
                const x = Number(props?.x)
                const y = Number(props?.y)
                const width = Number(props?.width)
                const height = Number(props?.height)

                if (!point || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
                  return <g />
                }

                const totalHeight = Math.max(0, height)
                const partRatio = point.__totalValue > 0 ? point.__partValue / point.__totalValue : 0
                const partHeight = Math.max(0, Math.min(totalHeight, totalHeight * partRatio))
                const partY = y + totalHeight - partHeight

                return (
                  <g
                    onClick={() => onBarClick?.(point.__source)}
                    style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={totalHeight}
                      rx={6}
                      ry={6}
                      fill="hsl(var(--muted-foreground) / 0.55)"
                    />
                    {partHeight > 0 ? (
                      <rect
                        x={x}
                        y={partY}
                        width={width}
                        height={partHeight}
                        fill="#f97316"
                      />
                    ) : null}
                  </g>
                )
              }}
            >
              {showTopValueLabels ? (
                <LabelList
                  dataKey="__totalValue"
                  content={(props: any) => {
                    const point = props?.payload as PreparedDatum<TData> | undefined
                    if (!point || typeof props?.x !== 'number' || typeof props?.width !== 'number') {
                      return null
                    }

                    const x = props.x + props.width / 2
                    const yBase = typeof props?.y === 'number' ? props.y : 0
                    const y = yBase > 16 ? yBase - 6 : yBase + 12
                    const label = `${valueFormatter(point.__partRawValue)}/${valueFormatter(point.__totalValue)}`

                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        fontSize={isMobile ? 9 : 10}
                        fill="hsl(var(--foreground))"
                      >
                        {label}
                      </text>
                    )
                  }}
                />
              ) : null}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
