'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildCombinedIndicatorHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import { formatBucketLabel } from '@/features/insight-dashboard/logic/date-bucketing'
import {
  CHART_CARD_CAPTION_CLASS,
  CHART_CARD_CONTENT_CLASS,
  CHART_CARD_HEADER_CLASS,
  CHART_CARD_TITLE_CLASS,
} from '@/features/insight-dashboard/components/chart-card-tokens'
import { InsightHelpDialogButton } from '@/features/insight-dashboard/components/insight-help-dialog-button'
import type {
  CombinedIndicatorBucket,
  IndicatorLineValueMode,
} from '@/features/insight-dashboard/logic/types'
import type { MetricInfo } from '@/features/insight-dashboard/logic/metrics-catalog'
import type { PeriodGranularity } from '@/features/insight-dashboard/logic/metrics-catalog'
import { cn } from '@/lib/utils'

interface IndicatorCombinedCardProps {
  metric: MetricInfo
  data: CombinedIndicatorBucket[]
  lineValueMode: IndicatorLineValueMode
  className?: string
  granularity?: PeriodGranularity
}

interface PreparedPoint {
  bucketKey: string
  bucketLabel: string
  totalCallsN1: number
  indicatorCalls: number
  indicatorRatePercent: number
  lineValue: number
}

function formatShortDate(value: string, granularity: PeriodGranularity): string {
  return formatBucketLabel(value, granularity, 'short')
}

function formatLongDate(value: string, granularity: PeriodGranularity): string {
  return formatBucketLabel(value, granularity, 'long')
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString('ru-RU')
}

function colorByRate(rate: number): string {
  if (rate <= 5) return 'text-emerald-600'
  if (rate <= 30) return 'text-amber-500'
  return 'text-red-600'
}

function formatDelta(data: PreparedPoint[], lineValueMode: IndicatorLineValueMode): {
  value: string
  toneClass: string
} {
  if (data.length < 2) {
    return {
      value: lineValueMode === 'percent' ? '0.0 п.п.' : '0',
      toneClass: 'text-muted-foreground',
    }
  }

  const current = data[data.length - 1]?.lineValue ?? 0
  const previous = data[data.length - 2]?.lineValue ?? 0
  const delta = current - previous

  if (lineValueMode === 'percent') {
    const sign = delta > 0 ? '+' : ''
    const toneClass = delta > 0 ? 'text-red-600' : delta < 0 ? 'text-emerald-600' : 'text-amber-500'
    return {
      value: `${sign}${delta.toFixed(1)} п.п.`,
      toneClass,
    }
  }

  const sign = delta > 0 ? '+' : ''
  const toneClass = delta > 0 ? 'text-red-600' : delta < 0 ? 'text-emerald-600' : 'text-amber-500'
  return {
    value: `${sign}${formatCount(delta)}`,
    toneClass,
  }
}

export function IndicatorCombinedCard({
  metric,
  data,
  lineValueMode,
  className,
  granularity = 'week',
}: IndicatorCombinedCardProps) {
  const metricHelpCopy = buildCombinedIndicatorHelpDialogCopy(metric.id)

  if (!data.length) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className={CHART_CARD_HEADER_CLASS}>
          <div className="flex items-center gap-1.5">
            <CardTitle className={CHART_CARD_TITLE_CLASS}>{metric.name}</CardTitle>
            <InsightHelpDialogButton
              copy={metricHelpCopy}
              ariaLabel={`Как интерпретировать индикатор: ${metric.name}`}
              triggerClassName="h-4 w-4 border-0"
            />
          </div>
        </CardHeader>
        <CardContent className={CHART_CARD_CONTENT_CLASS}>
          <p className={CHART_CARD_CAPTION_CLASS}>Нет данных</p>
        </CardContent>
      </Card>
    )
  }

  const preparedData: PreparedPoint[] = data.map((point) => ({
    ...point,
    lineValue: lineValueMode === 'percent' ? point.indicatorRatePercent : point.indicatorCalls,
  }))

  const currentPoint = preparedData[preparedData.length - 1]
  const currentRate = currentPoint?.indicatorRatePercent ?? 0
  const currentLineValue = currentPoint?.lineValue ?? 0
  const delta = formatDelta(preparedData, lineValueMode)

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
      <CardHeader className={CHART_CARD_HEADER_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CardTitle className={CHART_CARD_TITLE_CLASS}>{metric.name}</CardTitle>
            <InsightHelpDialogButton
              copy={metricHelpCopy}
              ariaLabel={`Как интерпретировать индикатор: ${metric.name}`}
              triggerClassName="h-4 w-4 border-0"
            />
          </div>
          <span className={cn('text-sm font-semibold', colorByRate(currentRate))}>
            {lineValueMode === 'percent' ? formatPercent(currentLineValue) : formatCount(currentLineValue)}
          </span>
        </div>
        <p className={cn('text-[11px] leading-4', delta.toneClass)}>
          {delta.value}
          <span className="ml-1 text-muted-foreground">к предыдущему периоду</span>
        </p>
      </CardHeader>

      <CardContent className={CHART_CARD_CONTENT_CLASS}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={preparedData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="bucketLabel"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => formatShortDate(String(value), granularity)}
            />
            <YAxis
              yAxisId="calls"
              tickLine={false}
              axisLine={false}
              width={30}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            {lineValueMode === 'percent' ? (
              <YAxis
                yAxisId="line"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={30}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
              />
            ) : null}
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null
                }

                const point = payload[0]?.payload as PreparedPoint | undefined
                if (!point) {
                  return null
                }

                return (
                  <BerekeChartTooltip
                    title={formatLongDate(point.bucketKey, granularity)}
                    rows={[
                      {
                        id: 'total-calls',
                        label: 'Все звонки',
                        value: formatCount(point.totalCallsN1),
                        color: '#94a3b8',
                      },
                      {
                        id: 'indicator-calls',
                        label: 'Звонки с индикатором',
                        value: formatCount(point.indicatorCalls),
                        color: metric.color,
                      },
                      {
                        id: 'indicator-rate',
                        label: 'Доля индикатора',
                        value: formatPercent(point.indicatorRatePercent),
                        color: '#0f172a',
                        strong: true,
                      },
                    ]}
                  />
                )
              }}
            />
            <Bar
              yAxisId="calls"
              dataKey="totalCallsN1"
              fill="hsl(var(--muted) / 0.55)"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId={lineValueMode === 'percent' ? 'line' : 'calls'}
              type="linear"
              dataKey="lineValue"
              stroke={metric.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: metric.color }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
