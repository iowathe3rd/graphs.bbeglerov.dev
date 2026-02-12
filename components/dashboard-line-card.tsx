'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface DashboardLineCardProps {
  metric: MetricInfo
  data: MetricDataPoint[]
}

function metricValue(value: number, unit: string) {
  return `${value.toFixed(1)}${unit}`
}

function metricSemanticTone(metric: MetricInfo, value: number) {
  if (metric.direction === 'higher-better') {
    if (value >= metric.thresholds.high) return 'text-emerald-600'
    if (value >= metric.thresholds.medium) return 'text-amber-500'
    return 'text-rose-600'
  }

  if (value <= metric.thresholds.high) return 'text-emerald-600'
  if (value <= metric.thresholds.medium) return 'text-amber-500'
  return 'text-rose-600'
}

function trendSemanticTone(metric: MetricInfo, deltaPercent: number) {
  if (Math.abs(deltaPercent) < 0.1) {
    return 'text-amber-500'
  }

  const isPositiveImpact =
    (metric.direction === 'higher-better' && deltaPercent > 0) ||
    (metric.direction === 'lower-better' && deltaPercent < 0)

  return isPositiveImpact ? 'text-emerald-600' : 'text-rose-600'
}

export function DashboardLineCard({ metric, data }: DashboardLineCardProps) {
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

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{metric.name}</CardTitle>
          <span className={`text-sm font-semibold ${currentTone}`}>{metricValue(current, metric.unit)}</span>
        </div>
        <p className={`inline-flex items-center gap-1 text-[11px] font-medium ${trendTone}`}>
          <TrendIcon className="h-3 w-3" />
          {trendPrefix}
          {deltaPercent.toFixed(1)}%
          <span className="text-muted-foreground">к предыдущему значению</span>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-3 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 4, top: 2, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()}.${date.getMonth() + 1}`
              }}
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
                    title={new Date(String(label)).toLocaleDateString('ru-RU')}
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
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
