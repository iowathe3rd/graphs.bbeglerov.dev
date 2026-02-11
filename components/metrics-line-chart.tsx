'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface MetricsLineChartProps {
  data: MetricDataPoint[]
  metric: MetricInfo
  showGrid?: boolean
}

export function MetricsLineChart({ data, metric, showGrid = true }: MetricsLineChartProps) {
  const chartConfig = {
    value: {
      label: metric.name,
      color: metric.color,
    },
  }

  // Вычисляем статистику
  const average = data.reduce((sum, d) => sum + d.value, 0) / data.length
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))

  // Определяем текущий уровень
  const currentValue = data[data.length - 1]?.value || 0
  const getStatus = () => {
    if (currentValue <= metric.thresholds.low) return 'Низкий'
    if (currentValue <= metric.thresholds.medium) return 'Средний'
    return 'Высокий'
  }

  const getStatusColor = () => {
    if (currentValue <= metric.thresholds.low) return 'text-chart-2'
    if (currentValue <= metric.thresholds.medium) return 'text-chart-3'
    return 'text-chart-5'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{metric.name}</CardTitle>
            <CardDescription className="text-xs">{metric.description}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {currentValue.toFixed(1)}{metric.unit}
            </div>
            <div className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatus()} уровень
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
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
                tickFormatter={(value) => `${value}${metric.unit}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value}${metric.unit}`}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Статистика */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground">Среднее</div>
            <div className="text-sm font-semibold text-foreground">
              {average.toFixed(1)}{metric.unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Минимум</div>
            <div className="text-sm font-semibold text-chart-2">
              {min.toFixed(1)}{metric.unit}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Максимум</div>
            <div className="text-sm font-semibold text-chart-5">
              {max.toFixed(1)}{metric.unit}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
