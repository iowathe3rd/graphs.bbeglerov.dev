'use client'

import { useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  PRODUCT_SITUATION_TAGS,
  PRODUCT_TAG_COLORS,
  type ProductSituationBucket,
  type ProductSituationMode,
} from '@/lib/product-situation-analytics'
import { cn } from '@/lib/utils'
import type { OverlapGranularity } from '@/lib/metrics-data'

interface ProductSituationMainChartProps {
  buckets: ProductSituationBucket[]
  mode: ProductSituationMode
  granularity: OverlapGranularity
  visibleTags: string[]
  onToggleTag: (tag: string) => void
  onShowAllTags: () => void
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
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

export function ProductSituationMainChart({
  buckets,
  mode,
  granularity,
  visibleTags,
  onToggleTag,
  onShowAllTags,
}: ProductSituationMainChartProps) {
  const isMobile = useIsMobile()
  const resolvedMode: ProductSituationMode =
    mode === 'rate' || mode === 'volume' || mode === 'combo'
      ? mode
      : 'combo'
  const displayBuckets = useMemo(() => buckets.slice(-24), [buckets])

  const tags = useMemo(() => [...PRODUCT_SITUATION_TAGS], [])

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

  const showTagSelector = resolvedMode === 'rate'

  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Ситуация продукта</CardTitle>
          <Badge variant="outline" className="text-[11px]">
            Режим: {resolvedMode === 'rate' ? '%' : resolvedMode === 'volume' ? 'Кол-во' : 'Комбо'}
          </Badge>
        </div>

        {showTagSelector ? (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">
              Теги в режиме % (включайте/выключайте серии)
            </p>
            <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PRODUCT_SITUATION_TAGS.map((tag) => {
                const active = visibleTags.includes(tag)

                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    role="button"
                    aria-pressed={active}
                    className={cn(
                      'shrink-0 cursor-pointer border px-2 py-1 text-[11px] transition-colors',
                      active
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => onToggleTag(tag)}
                  >
                    <span
                      className="mr-1 inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: PRODUCT_TAG_COLORS[tag] }}
                    />
                    {tag}
                  </Badge>
                )
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-6 shrink-0 px-2 text-[11px]"
                onClick={onShowAllTags}
              >
                Все теги
              </Button>
            </div>
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <div
          data-testid="product-situation-main-chart"
          className="h-[320px] w-full md:h-[380px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              id="product-situation-main-chart"
              data={displayBuckets}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) =>
                  formatBucketLabel(String(value), granularity)
                }
                minTickGap={isMobile ? 24 : 18}
              />

              {resolvedMode === 'rate' ? (
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 40 : 54}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                />
              ) : (
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 40 : 54}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                />
              )}
              {resolvedMode === 'combo' ? (
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
              ) : null}

              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !label || !payload?.length) {
                    return null
                  }

                  const bucket = payload[0]?.payload as ProductSituationBucket | undefined

                  if (!bucket) {
                    return null
                  }

                  const rows = [
                    {
                      id: 'risk',
                      label: 'Risk Index',
                      value: formatPercent(bucket.riskIndex),
                      color: '#111827',
                      strong: true,
                    },
                    {
                      id: 'weighted',
                      label: 'Weighted Negative Rate',
                      value: formatPercent(bucket.weightedNegativeRate),
                      color: '#0ea5e9',
                    },
                    {
                      id: 'volume-weight',
                      label: 'Объемный вес',
                      value: bucket.volumeWeight.toFixed(1),
                    },
                    {
                      id: 'total-calls',
                      label: 'Всего звонков',
                      value: bucket.totalCalls.toLocaleString('ru-RU'),
                      color: '#94a3b8',
                    },
                    {
                      id: 'negative-calls',
                      label: 'Негативные звонки',
                      value: bucket.negativeCalls.toLocaleString('ru-RU'),
                      color: '#ef4444',
                    },
                  ]

                  for (const tag of PRODUCT_SITUATION_TAGS) {
                    rows.push({
                      id: `tag:${tag}`,
                      label: tag,
                      value: `${bucket.tagCounts[tag]} (${bucket.tagRates[tag].toFixed(1)}%)`,
                      color: PRODUCT_TAG_COLORS[tag],
                    })
                  }

                  return (
                    <BerekeChartTooltip
                      title={formatTooltipDate(String(label))}
                      rows={rows}
                    />
                  )
                }}
              />

              {resolvedMode === 'rate' ? (
                <Line
                  id="main-rate-weighted"
                  yAxisId="left"
                  type="linear"
                  dataKey="weightedNegativeRate"
                  name="Weighted Negative Rate"
                  stroke="#0ea5e9"
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'rate'
                ? tags
                    .filter((tag) => visibleTags.includes(tag))
                    .map((tag) => (
                      <Line
                        id={`main-rate-tag-${tag}`}
                        key={tag}
                        yAxisId="left"
                        type="linear"
                        dataKey={(row: ProductSituationBucket) => row.tagRates[tag]}
                        name={tag}
                        stroke={PRODUCT_TAG_COLORS[tag]}
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ))
                : null}

              {resolvedMode === 'volume' ? (
                <Bar
                  id="main-volume-total"
                  yAxisId="left"
                  dataKey="totalCalls"
                  name="Всего звонков"
                  fill="#94a3b8"
                  fillOpacity={0.55}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'volume' ? (
                <Line
                  id="main-volume-negative"
                  yAxisId="left"
                  type="linear"
                  dataKey="negativeCalls"
                  name="Негативные звонки"
                  stroke="#ef4444"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}

              {resolvedMode === 'combo' ? (
                <Bar
                  id="main-combo-total"
                  yAxisId="left"
                  dataKey="totalCalls"
                  name="Всего звонков"
                  fill="#94a3b8"
                  fillOpacity={0.5}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={34}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'combo' ? (
                <Line
                  id="main-combo-risk"
                  yAxisId="right"
                  type="linear"
                  dataKey="riskIndex"
                  name="Risk Index"
                  stroke="#111827"
                  strokeWidth={2.8}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ) : null}
              {resolvedMode === 'combo' ? (
                <Line
                  id="main-combo-weighted"
                  yAxisId="right"
                  type="linear"
                  dataKey="weightedNegativeRate"
                  name="Weighted Negative Rate"
                  stroke="#0ea5e9"
                  strokeOpacity={0.8}
                  strokeWidth={1.8}
                  strokeDasharray="4 3"
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
