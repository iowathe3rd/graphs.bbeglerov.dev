'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildKpiIndicatorHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import { formatBucketLabel } from '@/features/insight-dashboard/domain/date-bucketing'
import { InsightHelpDialogButton } from '@/features/insight-dashboard/ui/insight-help-dialog-button'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'
import type { OverlapGranularity } from '@/lib/metrics-data'

interface DashboardLineCardProps {
  metric: MetricInfo
  data: MetricDataPoint[]
  granularity?: OverlapGranularity
}

function metricValue(value: number, unit: string) {
  return `${value.toFixed(1)}${unit}`
}

function metricSemanticTone(metric: MetricInfo, value: number) {
  if (metric.direction === 'higher-better') {
    if (value >= metric.thresholds.high) return 'text-emerald-600'
    if (value >= metric.thresholds.medium) return 'text-amber-500'
    return 'text-red-600'
  }

  if (value <= metric.thresholds.high) return 'text-emerald-600'
  if (value <= metric.thresholds.medium) return 'text-amber-500'
  return 'text-red-600'
}

function trendComparisonLabel(
  data: MetricDataPoint[],
  granularity: OverlapGranularity
) {
  if (data.length < 2) {
    return 'от предыдущего периода'
  }

  if (granularity === 'month') {
    return 'от прошлого месяца'
  }

  if (granularity === 'week') {
    return 'от прошлой недели'
  }

  const lastDate = new Date(data[data.length - 1]?.date)
  const prevDate = new Date(data[data.length - 2]?.date)

  if (Number.isNaN(lastDate.getTime()) || Number.isNaN(prevDate.getTime())) {
    return 'от предыдущего периода'
  }

  const dayDiff = Math.abs(lastDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

  if (dayDiff >= 27) {
    return 'от прошлого месяца'
  }

  return 'от прошлого дня'
}

function trendSemanticTone(metric: MetricInfo, deltaPercent: number) {
  if (Math.abs(deltaPercent) < 0.1) {
    return 'text-amber-500'
  }

  const isPositiveImpact =
    (metric.direction === 'higher-better' && deltaPercent > 0) ||
    (metric.direction === 'lower-better' && deltaPercent < 0)

  return isPositiveImpact ? 'text-emerald-600' : 'text-red-600'
}

function formatShortDate(dateKey: string, granularity: OverlapGranularity) {
  return formatBucketLabel(dateKey, granularity, 'short')
}

function formatFullDate(dateKey: string, granularity: OverlapGranularity) {
  return formatBucketLabel(dateKey, granularity, 'long')
}

export function DashboardLineCard({
  metric,
  data,
  granularity = 'day',
}: DashboardLineCardProps) {
  if (!data.length) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{metric.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  const current = data[data.length - 1]?.value ?? 0
  const previous = data[data.length - 2]?.value ?? current
  const delta = current - previous
  const deltaPercent = previous === 0 ? 0 : (delta / Math.abs(previous)) * 100
  const trendPrefix = deltaPercent > 0 ? '+' : ''
  const TrendIcon = deltaPercent >= 0 ? TrendingUp : TrendingDown
  const currentTone = metricSemanticTone(metric, current)
  const trendTone = trendSemanticTone(metric, deltaPercent)
  const trendComparison = trendComparisonLabel(data, granularity)
  const metricHelpCopy = buildKpiIndicatorHelpDialogCopy(metric.id)
  const chartData =
    data.length === 1
      ? (() => {
          const baseDate = new Date(`${data[0]?.date}T00:00:00.000Z`)
          if (Number.isNaN(baseDate.getTime())) {
            return [
              data[0] as MetricDataPoint,
              {
                date: `${data[0]?.date}-next`,
                value: data[0]?.value ?? 0,
              },
            ]
          }

          baseDate.setUTCDate(baseDate.getUTCDate() + 1)
          return [
            data[0] as MetricDataPoint,
            {
              date: baseDate.toISOString().slice(0, 10),
              value: data[0]?.value ?? 0,
            },
          ]
        })()
      : data

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm">{metric.name}</CardTitle>
            <InsightHelpDialogButton
              copy={metricHelpCopy}
              ariaLabel={`Как интерпретировать индикатор: ${metric.name}`}
              triggerClassName="h-4 w-4 border-0"
            />
          </div>
          <span className={`text-sm font-semibold ${currentTone}`}>{metricValue(current, metric.unit)}</span>
        </div>
        <p className={`inline-flex items-center gap-1 text-[11px] font-medium ${trendTone}`}>
          <TrendIcon className="h-3 w-3" />
          {trendPrefix}
          {deltaPercent.toFixed(1)}%
          <span className="text-muted-foreground">{trendComparison}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-3 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 4, top: 2, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => formatShortDate(String(value), granularity)}
              minTickGap={26}
            />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) {
                  return null
                }

                return (
                  <BerekeChartTooltip
                    title={formatFullDate(String(label), granularity)}
                    rows={[
                      {
                        id: metric.id,
                        label: metric.name,
                        value: metricValue(Number(payload[0]?.value ?? 0), metric.unit),
                        color: metric.color,
                        strong: true,
                      },
                    ]}
                  />
                )
              }}
            />
            <Line
              type="linear"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              dot={
                data.length === 1
                  ? {
                      r: 3,
                      stroke: '#fff',
                      strokeWidth: 1.5,
                      fill: metric.color,
                    }
                  : false
              }
              activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: metric.color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
