'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'
import { Badge } from '@/components/ui/badge'

interface MetricsCombinedChartProps {
  data: Record<string, MetricDataPoint[]>
  metrics: MetricInfo[]
  title?: string
  description?: string
  showThresholds?: boolean
}

export function MetricsCombinedChart({ 
  data, 
  metrics, 
  title = 'Комбинированный анализ',
  description = 'Сравнение всех метрик на одном графике',
  showThresholds = false
}: MetricsCombinedChartProps) {
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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <Badge key={metric.id} variant="outline" style={{ borderColor: metric.color }}>
                <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: metric.color }} />
                {metric.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                tickFormatter={(value) => `${value}%`}
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
              {showThresholds && (
                <>
                  <ReferenceLine y={10} stroke="hsl(var(--chart-2))" strokeDasharray="3 3" label={{ value: 'Низкий порог', position: 'right', fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" label={{ value: 'Средний порог', position: 'right', fontSize: 10 }} />
                </>
              )}
              {metrics.map((metric) => (
                <Line
                  key={metric.id}
                  type="monotone"
                  dataKey={metric.id}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
