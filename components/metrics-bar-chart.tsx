'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface MetricsBarChartProps {
  data: Array<{ name: string; value: number }>
  title?: string
}

export function MetricsBarChart({ data, title = 'Среднее по процессам' }: MetricsBarChartProps) {
  const chartConfig = {
    value: {
      label: 'Среднее значение',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
                      <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                fontSize={11}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => Number(value).toFixed(1)} />} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
