'use client'

import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OverlapGranularity } from '@/lib/metrics-data'
import {
  PRODUCT_SITUATION_TAGS,
  PRODUCT_TAG_COLORS,
  type ProductSituationBucket,
  type ProductSituationMode,
} from '@/lib/product-situation-analytics'
import { cn } from '@/lib/utils'

interface ProductSituationExecutiveHeroChartProps {
  buckets: ProductSituationBucket[]
  granularity: OverlapGranularity
  mode: ProductSituationMode
  chartHeightClassName?: string
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

function healthZone(healthIndex: number) {
  if (healthIndex >= 90) {
    return {
      label: 'Норма',
      className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    }
  }

  if (healthIndex >= 70) {
    return {
      label: 'Внимание',
      className: 'border-amber-200 bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Критично',
    className: 'border-red-200 bg-red-100 text-red-700',
  }
}

function modeLabel(mode: ProductSituationMode) {
  if (mode === 'rate') {
    return 'Проценты'
  }

  if (mode === 'volume') {
    return 'Количество'
  }

  return 'Комбинированный'
}

export function ProductSituationExecutiveHeroChart({
  buckets,
  granularity,
  mode,
  chartHeightClassName,
}: ProductSituationExecutiveHeroChartProps) {
  const isMobile = useIsMobile()
  const resolvedMode: ProductSituationMode =
    mode === 'rate' || mode === 'volume' || mode === 'combo' ? mode : 'combo'

  const displayBuckets = useMemo(() => {
    const limit = granularity === 'day' ? 60 : granularity === 'week' ? 30 : 24
    return buckets.slice(-limit)
  }, [buckets, granularity])

  if (displayBuckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ситуация продукта</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  const latestPoint = displayBuckets[displayBuckets.length - 1]
  const latestZone = healthZone(latestPoint.healthIndex)
  const showRateLegend = resolvedMode === 'rate'

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Ситуация продукта</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden text-[11px] md:inline-flex">
              Режим: {modeLabel(resolvedMode)}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              Индекс здоровья: {latestPoint.healthIndex.toFixed(1)}
            </Badge>
            <Badge variant="outline" className={`text-[11px] ${latestZone.className}`}>
              {latestZone.label}
            </Badge>
          </div>
        </div>

        {showRateLegend && !isMobile ? (
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 text-[11px] text-muted-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="inline-flex shrink-0 items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Доля проблемных обращений
            </span>
            {PRODUCT_SITUATION_TAGS.map((tag) => (
              <span key={tag} className="inline-flex shrink-0 items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PRODUCT_TAG_COLORS[tag] }}
                />
                {tag}
              </span>
            ))}
          </div>
        ) : !isMobile ? (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              90-100: норма
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500/80" />
              70-89: внимание
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              0-69: критично
            </span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div
          data-testid="product-situation-executive-hero-chart"
          className={cn(
            'h-[62dvh] min-h-[340px] w-full md:h-[calc(100dvh-250px)] md:min-h-[560px]',
            chartHeightClassName
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayBuckets}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              {resolvedMode !== 'volume' ? (
                <ReferenceArea
                  yAxisId="right"
                  y1={0}
                  y2={70}
                  fill="rgba(239, 68, 68, 0.14)"
                  ifOverflow="extendDomain"
                />
              ) : null}
              {resolvedMode !== 'volume' ? (
                <ReferenceArea
                  yAxisId="right"
                  y1={70}
                  y2={90}
                  fill="rgba(245, 158, 11, 0.14)"
                  ifOverflow="extendDomain"
                />
              ) : null}
              {resolvedMode !== 'volume' ? (
                <ReferenceArea
                  yAxisId="right"
                  y1={90}
                  y2={100}
                  fill="rgba(34, 197, 94, 0.14)"
                  ifOverflow="extendDomain"
                />
              ) : null}

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatBucketLabel(String(value), granularity)}
                minTickGap={isMobile ? 26 : 18}
              />
              <YAxis
                yAxisId="left"
                hide={resolvedMode === 'rate'}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 42 : 58}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                yAxisId="right"
                hide={resolvedMode === 'volume'}
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
                          id: 'health-index',
                          label: 'Индекс здоровья',
                          value: `${point.healthIndex.toFixed(1)} / 100`,
                          color: '#0f172a',
                          strong: true,
                        },
                        {
                          id: 'problem-rate',
                          label: 'Доля проблемных обращений',
                          value: `${point.negativeRate.toFixed(1)}%`,
                          color: '#dc2626',
                        },
                        {
                          id: 'problem-calls',
                          label: 'Проблемные обращения',
                          value: point.negativeCalls.toLocaleString('ru-RU'),
                          color: '#f97316',
                        },
                        {
                          id: 'total-calls',
                          label: 'Все обращения',
                          value: point.totalCalls.toLocaleString('ru-RU'),
                          color: '#94a3b8',
                        },
                        ...PRODUCT_SITUATION_TAGS.map((tag) => ({
                          id: `tag:${tag}`,
                          label: tag,
                          value: `${point.tagRates[tag].toFixed(1)}%`,
                          color: PRODUCT_TAG_COLORS[tag],
                        })),
                      ]}
                    />
                  )
                }}
              />

              {resolvedMode === 'rate' ? (
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="negativeRate"
                  name="Доля проблемных обращений"
                  stroke="#dc2626"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'rate'
                ? PRODUCT_SITUATION_TAGS.map((tag) => (
                    <Line
                      key={tag}
                      yAxisId="right"
                      type="linear"
                      dataKey={(row: ProductSituationBucket) => row.tagRates[tag]}
                      name={tag}
                      stroke={PRODUCT_TAG_COLORS[tag]}
                      strokeWidth={1.7}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))
                : null}

              {resolvedMode === 'volume' ? (
                <Bar
                  yAxisId="left"
                  dataKey="totalCalls"
                  name="Все обращения"
                  fill="#94a3b8"
                  fillOpacity={0.45}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'volume' ? (
                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey="negativeCalls"
                  name="Проблемные обращения"
                  stroke="#dc2626"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}

              {resolvedMode === 'combo' ? (
                <Bar
                  yAxisId="left"
                  dataKey="totalCalls"
                  name="Все обращения"
                  fill="#94a3b8"
                  fillOpacity={0.45}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'combo' ? (
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="healthIndex"
                  name="Индекс здоровья"
                  stroke="#0f172a"
                  strokeWidth={2.8}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'combo' ? (
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="negativeRate"
                  name="Доля проблемных обращений"
                  stroke="#dc2626"
                  strokeWidth={1.8}
                  strokeDasharray="4 3"
                  strokeOpacity={0.85}
                  dot={false}
                  isAnimationActive={false}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
