'use client'

import { useMemo } from 'react'
import {
  Area,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import type { OverlapGranularity } from '@/lib/metrics-data'
import {
  PRODUCT_SITUATION_TAGS,
  PRODUCT_TAG_COLORS,
  type ProductSituationBucket,
  type ProductSituationMode,
} from '@/lib/product-situation-analytics'

interface ProductSituationTagStackChartProps {
  buckets: ProductSituationBucket[]
  mode: ProductSituationMode
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

export function ProductSituationTagStackChart({
  buckets,
  mode,
  granularity,
}: ProductSituationTagStackChartProps) {
  const isMobile = useIsMobile()
  const resolvedMode: ProductSituationMode =
    mode === 'rate' || mode === 'volume' || mode === 'combo'
      ? mode
      : 'combo'

  const tagsWithKeys = useMemo(
    () =>
      PRODUCT_SITUATION_TAGS.map((tag, index) => ({
        tag,
        shareKey: `tag_share_${index}`,
        countKey: `tag_count_${index}`,
      })),
    []
  )

  const chartData = useMemo(
    () =>
      buckets.map((bucket) => {
        const negativeBase = Math.max(1, bucket.negativeCalls)
        const row: Record<string, string | number> = {
          date: bucket.date,
          totalCalls: bucket.totalCalls,
          negativeCalls: bucket.negativeCalls,
        }

        for (const item of tagsWithKeys) {
          row[item.countKey] = bucket.tagCounts[item.tag]
          row[item.shareKey] =
            bucket.negativeCalls > 0
              ? Number(((bucket.tagCounts[item.tag] / negativeBase) * 100).toFixed(1))
              : 0
        }

        return row
      }),
    [buckets, tagsWithKeys]
  )

  const bucketByDate = useMemo(() => {
    const map = new Map<string, ProductSituationBucket>()

    for (const bucket of buckets) {
      map.set(bucket.date, bucket)
    }

    return map
  }, [buckets])

  if (buckets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Структура тегов</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Вклад тегов</CardTitle>
          <Badge variant="outline" className="text-[11px]">
            {resolvedMode === 'rate'
              ? '100% структура'
              : resolvedMode === 'volume'
                ? 'Абсолюты'
                : '100% + Total Calls'}
          </Badge>
        </div>
        <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRODUCT_SITUATION_TAGS.map((tag) => (
            <Badge key={tag} variant="outline" className="shrink-0 text-[11px]">
              <span
                className="mr-1 inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: PRODUCT_TAG_COLORS[tag] }}
              />
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              id="product-situation-tag-stack-chart"
              data={chartData}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                {PRODUCT_SITUATION_TAGS.map((tag, index) => (
                  <linearGradient key={tag} id={`product-situation-tag-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRODUCT_TAG_COLORS[tag]} stopOpacity={0.55} />
                    <stop offset="95%" stopColor={PRODUCT_TAG_COLORS[tag]} stopOpacity={0.08} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatBucketLabel(String(value), granularity)}
                minTickGap={isMobile ? 24 : 18}
              />

              {resolvedMode === 'combo' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 40 : 54}
                    tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 44 : 58}
                    tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </>
              ) : resolvedMode === 'rate' ? (
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

              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !label || !payload?.length) {
                    return null
                  }

                  const point = bucketByDate.get(String(label))
                  if (!point) {
                    return null
                  }

                  const negativeBase = Math.max(1, point.negativeCalls)
                  const rows = [
                    {
                      id: 'total-calls',
                      label: 'Всего звонков',
                      value: point.totalCalls.toLocaleString('ru-RU'),
                      color: '#94a3b8',
                      strong: true,
                    },
                    {
                      id: 'negative-calls',
                      label: 'Негативные звонки',
                      value: point.negativeCalls.toLocaleString('ru-RU'),
                      color: '#ef4444',
                    },
                  ]

                  for (const tag of PRODUCT_SITUATION_TAGS) {
                    const share =
                      point.negativeCalls > 0
                        ? ((point.tagCounts[tag] / negativeBase) * 100).toFixed(1)
                        : '0.0'

                    rows.push({
                      id: `tag:${tag}`,
                      label: tag,
                      value: `${point.tagCounts[tag]} (${share}%)`,
                      color: PRODUCT_TAG_COLORS[tag],
                    })
                  }

                  return (
                    <BerekeChartTooltip title={formatTooltipDate(String(label))} rows={rows} />
                  )
                }}
              />

              {tagsWithKeys.map((item, index) => (
                <Area
                  id={`tag-stack-${item.tag}`}
                  key={item.tag}
                  yAxisId={mode === 'combo' ? 'left' : 'left'}
                  type="linear"
                  dataKey={resolvedMode === 'volume' ? item.countKey : item.shareKey}
                  name={item.tag}
                  stackId="tags"
                  stroke={PRODUCT_TAG_COLORS[item.tag]}
                  fill={`url(#product-situation-tag-${index})`}
                  strokeWidth={1.6}
                  isAnimationActive={false}
                />
              ))}

              {resolvedMode === 'combo' ? (
                <Line
                  id="tag-stack-total-calls"
                  yAxisId="right"
                  type="linear"
                  dataKey="totalCalls"
                  name="Total Calls"
                  stroke="#111827"
                  strokeWidth={2}
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
