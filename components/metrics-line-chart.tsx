'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface MetricsLineChartProps {
  data: MetricDataPoint[]
  metric: MetricInfo
}

function formatValue(value: number, unit: string) {
  return `${value}${unit}`
}

export function MetricsLineChart({ data, metric }: MetricsLineChartProps) {
  if (!data.length) {
    return null
  }

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let sum = 0

  for (const point of data) {
    min = Math.min(min, point.value)
    max = Math.max(max, point.value)
    sum += point.value
  }

  const current = data[data.length - 1]?.value ?? 0
  const previous = data[data.length - 2]?.value ?? current
  const avg = sum / data.length
  const delta = current - previous

  const isPositiveTrend = delta >= 0
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown

  const chartConfig = {
    value: {
      label: metric.name,
      color: metric.color,
    },
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">{metric.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold leading-none">{formatValue(current, metric.unit)}</p>
            <p className="mt-1 inline-flex items-center text-xs text-muted-foreground">
              <TrendIcon className="mr-1 h-3 w-3" />
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}
              {metric.unit}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[210px] w-full">
                      <LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                fontSize={11}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(value) => `${value}${metric.unit}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatValue(Number(value), metric.unit)}
                    labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
                  />
                }
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
        </ChartContainer>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
          <div>
            <p className="text-muted-foreground">Avg</p>
            <p className="font-semibold">{avg.toFixed(1)}{metric.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Min</p>
            <p className="font-semibold">{min.toFixed(1)}{metric.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max</p>
            <p className="font-semibold">{max.toFixed(1)}{metric.unit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
