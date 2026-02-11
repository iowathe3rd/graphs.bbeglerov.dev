'use client'

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
  const deltaPrefix = delta > 0 ? '+' : ''

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{metric.name}</CardTitle>
          <span className="text-sm font-semibold">{metricValue(current, metric.unit)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {deltaPrefix}
          {delta.toFixed(1)}
          {metric.unit} / день
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
