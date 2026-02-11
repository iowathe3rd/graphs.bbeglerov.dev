'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface MetricsStackedChartProps {
  data: Record<string, MetricDataPoint[]>
  metrics: MetricInfo[]
  title?: string
  description?: string
}

export function MetricsStackedChart({ 
  data, 
  metrics,
  title = 'Накопительная визуализация',
  description = 'Пропорциональное распределение метрик'
}: MetricsStackedChartProps) {
  // Преобразуем данные для графика
  const combinedData = data[metrics[0].id].map((_, index) => {
    const point: any = { date: data[metrics[0].id][index].date }
    metrics.forEach((metric) => {
      point[metric.id] = data[metric.id][index].value
    })
    return point
  })

  const chartConfig = metrics.reduce((acc, metric) => {
    acc[metric.id] = {
      label: metric.name,
      color: metric.color,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {metrics.map((metric, index) => (
                  <linearGradient key={metric.id} id={`color-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                      })
                    }}
                  />
                }
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => chartConfig[value]?.label || value}
              />
              {metrics.map((metric) => (
                <Area
                  key={metric.id}
                  type="monotone"
                  dataKey={metric.id}
                  stackId="1"
                  stroke={metric.color}
                  fill={`url(#color-${metric.id})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
