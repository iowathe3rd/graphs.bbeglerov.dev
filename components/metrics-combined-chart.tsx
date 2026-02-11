'use client'

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface MetricsCombinedChartProps {
  data: Record<string, MetricDataPoint[]>
  metrics: MetricInfo[]
  title?: string
}

export function MetricsCombinedChart({ data, metrics, title = 'Сравнение метрик' }: MetricsCombinedChartProps) {
  if (!metrics.length) {
    return null
  }

  const baseMetric = metrics[0]
  const baseSeries = data[baseMetric.id] ?? []

  const combinedData = baseSeries.map((point, index) => {
    const row: Record<string, number | string> = { date: point.date }

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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex flex-wrap gap-1">
            {metrics.map((metric) => (
              <Badge key={metric.id} variant="outline" style={{ borderColor: metric.color }}>
                <span className="mr-1 inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: metric.color }} />
                {metric.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
                      <LineChart data={combinedData} margin={{ top: 6, right: 16, left: 4, bottom: 0 }}>
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
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null
                  }

                  const rows = payload
                    .filter((item) => item.value !== undefined)
                    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
                    .map((item) => ({
                      id: String(item.dataKey ?? item.name),
                      label: String(item.name ?? item.dataKey ?? 'series'),
                      value: Number(item.value ?? 0).toFixed(1),
                      color:
                        typeof item.color === 'string'
                          ? item.color
                          : 'hsl(var(--chart-1))',
                    }))

                  return (
                    <BerekeChartTooltip
                      title={new Date(String(label)).toLocaleDateString('ru-RU')}
                      rows={rows}
                    />
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {metrics.map((metric) => (
                <Line
                  key={metric.id}
                  dataKey={metric.id}
                  type="linear"
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
