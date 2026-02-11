'use client'

import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface MetricsStackedChartProps {
  data: Record<string, MetricDataPoint[]>
  metrics: MetricInfo[]
  title?: string
}

export function MetricsStackedChart({ data, metrics, title = 'Стек по метрикам' }: MetricsStackedChartProps) {
  if (!metrics.length) {
    return null
  }

  const baseSeries = data[metrics[0].id] ?? []
  const stackedData = baseSeries.map((point, index) => {
    const row: Record<string, string | number> = { date: point.date }

    for (const metric of metrics) {
      row[metric.id] = data[metric.id]?.[index]?.value ?? 0
    }

    return row
  })

  const chartConfig = metrics.reduce(
    (acc, metric) => {
      acc[metric.id] = {
        label: metric.name,
        color: metric.color,
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[340px] w-full">
                      <AreaChart data={stackedData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {metrics.map((metric) => (
                  <linearGradient key={metric.id} id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0.08} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => new Date(String(label)).toLocaleDateString('ru-RU')}
                  />
                }
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {metrics.map((metric) => (
                <Area
                  key={metric.id}
                  type="linear"
                  dataKey={metric.id}
                  stroke={metric.color}
                  fill={`url(#gradient-${metric.id})`}
                  stackId="stack"
                />
              ))}
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
