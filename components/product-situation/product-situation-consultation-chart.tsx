'use client'

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OverlapGranularity } from '@/lib/metrics-data'
import type { ProductSituationBucket } from '@/lib/product-situation-analytics'

interface ProductSituationConsultationChartProps {
  buckets: ProductSituationBucket[]
  granularity: OverlapGranularity
}

function formatBucketLabel(dateKey: string, granularity: OverlapGranularity) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  if (granularity === 'month') {
    return date.toLocaleDateString('ru-RU', {
      month: '2-digit',
      year: '2-digit',
      timeZone: 'UTC',
    })
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}

function formatTooltipDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function ProductSituationConsultationChart({
  buckets,
  granularity,
}: ProductSituationConsultationChartProps) {
  const isMobile = useIsMobile()

  if (buckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Консультационные обращения</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Консультационные обращения</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              id="product-situation-consultation-chart"
              data={buckets}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={isMobile ? 24 : 18}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatBucketLabel(String(value), granularity)}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 40 : 54}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 44 : 58}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !label || !payload?.length) {
                    return null
                  }

                  const point = payload[0]?.payload as ProductSituationBucket | undefined
                  if (!point) {
                    return null
                  }

                  return (
                    <BerekeChartTooltip
                      title={formatTooltipDate(String(label))}
                      rows={[
                        {
                          id: 'consultation-calls',
                          label: 'Консультационные обращения',
                          value: point.consultationCalls.toLocaleString('ru-RU'),
                          color: '#cbd5e1',
                          strong: true,
                        },
                        {
                          id: 'consultation-negative-calls',
                          label: 'Проблемные консультации',
                          value: point.consultationNegativeCalls.toLocaleString('ru-RU'),
                          color: '#ef4444',
                        },
                        {
                          id: 'consultation-negative-rate',
                          label: 'Доля проблемных консультаций',
                          value: `${point.consultationNegativeRate.toFixed(1)}%`,
                          color: '#0369a1',
                        },
                      ]}
                    />
                  )
                }}
              />

              <Bar
                id="consultation-total"
                yAxisId="left"
                dataKey="consultationCalls"
                name="Консультационные обращения"
                fill="#94a3b8"
                fillOpacity={0.55}
                maxBarSize={34}
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                id="consultation-negative-count"
                yAxisId="left"
                dataKey="consultationNegativeCalls"
                name="Проблемные консультации"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                id="consultation-negative-rate"
                yAxisId="right"
                dataKey="consultationNegativeRate"
                name="Доля проблемных консультаций"
                stroke="#0369a1"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 3"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
