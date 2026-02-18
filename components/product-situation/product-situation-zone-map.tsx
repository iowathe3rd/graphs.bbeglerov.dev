'use client'

import {
  CartesianGrid,
  ReferenceArea,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ProductSituationDomainPoint } from '@/lib/product-situation-analytics'

interface ProductSituationZoneMapProps {
  domains: ProductSituationDomainPoint[]
  topDomains: ProductSituationDomainPoint[]
}

function zoneFill(zone: ProductSituationDomainPoint['zone']) {
  if (zone === 'red') {
    return 'rgba(217, 124, 124, 0.35)'
  }

  if (zone === 'yellow') {
    return 'rgba(216, 193, 122, 0.35)'
  }

  return 'rgba(121, 188, 147, 0.35)'
}

function zoneStroke(zone: ProductSituationDomainPoint['zone']) {
  if (zone === 'red') {
    return '#b91c1c'
  }

  if (zone === 'yellow') {
    return '#a16207'
  }

  return '#047857'
}

function zoneLabel(zone: ProductSituationDomainPoint['zone']) {
  if (zone === 'red') {
    return 'Критично'
  }

  if (zone === 'yellow') {
    return 'Внимание'
  }

  return 'Норма'
}

function shortLabel(label: string, maxLength = 18) {
  if (label.length <= maxLength) {
    return label
  }

  return `${label.slice(0, maxLength - 1)}…`
}

export function ProductSituationZoneMap({
  domains,
  topDomains,
}: ProductSituationZoneMapProps) {
  const isMobile = useIsMobile()

  if (domains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Температурная карта по продуктам</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  const maxNegativeCalls = domains.reduce(
    (max, domain) => Math.max(max, domain.negativeCalls),
    0
  )

  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base">Температурная карта по продуктам</CardTitle>
        <p className="text-xs text-muted-foreground">
          По оси Y — индекс здоровья, размер точки — количество проблемных обращений.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer
          config={{
            healthIndex: {
              label: 'Индекс здоровья',
              color: '#111827',
            },
          }}
          className="h-[340px] w-full"
        >
          <ScatterChart margin={{ left: 8, right: 12, top: 10, bottom: 64 }}>
            <ReferenceArea y1={0} y2={70} fill="rgba(217, 124, 124, 0.24)" />
            <ReferenceArea y1={70} y2={90} fill="rgba(216, 193, 122, 0.24)" />
            <ReferenceArea y1={90} y2={100} fill="rgba(121, 188, 147, 0.24)" />

            <CartesianGrid strokeDasharray="2 8" stroke="hsl(var(--border))" />
            <XAxis
              type="category"
              dataKey="label"
              interval={0}
              angle={-48}
              textAnchor="end"
              height={72}
              tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => shortLabel(String(value), isMobile ? 12 : 20)}
            />
            <YAxis
              type="number"
              dataKey="healthIndex"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              width={isMobile ? 40 : 56}
              tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <ZAxis
              dataKey="negativeCalls"
              range={isMobile ? [80, 320] : [100, 520]}
              domain={[0, Math.max(1, maxNegativeCalls)]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null
                }

                const point = payload[0]?.payload as ProductSituationDomainPoint | undefined
                if (!point) {
                  return null
                }

                return (
                  <BerekeChartTooltip
                    title={point.label}
                    rows={[
                      {
                        id: 'health',
                        label: 'Индекс здоровья',
                        value: `${point.healthIndex.toFixed(1)}%`,
                        color: '#111827',
                        strong: true,
                      },
                      {
                        id: 'problem-rate',
                        label: 'Доля проблемных обращений',
                        value: `${point.weightedNegativeRate.toFixed(1)}%`,
                        color: '#0ea5e9',
                      },
                      {
                        id: 'problem-calls',
                        label: 'Проблемные обращения',
                        value: point.negativeCalls.toLocaleString('ru-RU'),
                      },
                      {
                        id: 'total-calls',
                        label: 'Все обращения',
                        value: point.totalCalls.toLocaleString('ru-RU'),
                      },
                      {
                        id: 'zone',
                        label: 'Статус',
                        value: zoneLabel(point.zone),
                      },
                    ]}
                  />
                )
              }}
            />

            <Scatter
              data={domains}
              shape={(props: any) => {
                const point = props?.payload as ProductSituationDomainPoint | undefined

                if (!point) {
                  return <g />
                }

                const area = Number(props?.size ?? 80)
                const radius = Math.max(6, Math.sqrt(area / Math.PI))

                return (
                  <g>
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={radius}
                      fill={zoneFill(point.zone)}
                      stroke={zoneStroke(point.zone)}
                      strokeWidth={1.6}
                    />
                  </g>
                )
              }}
            />
          </ScatterChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(59,179,94,0.78)]" />
            90-100: норма
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(214,173,38,0.78)]" />
            70-89: внимание
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-[rgba(204,67,67,0.78)]" />
            0-69: критично
          </Badge>
        </div>

        <div className="rounded-lg border border-border/70 bg-card/50 p-3">
          <h3 className="text-sm font-semibold">Продукты с наибольшим риском (top 8)</h3>
          <div className="mt-2 space-y-1.5">
            {topDomains.length === 0 ? (
              <p className="text-xs text-muted-foreground">Нет данных</p>
            ) : (
              topDomains.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md border border-border/60 px-2 py-1.5"
                >
                  <p className="truncate text-xs font-medium">{item.label}</p>
                  <span className="text-xs font-semibold tabular-nums">
                    {item.healthIndex.toFixed(1)}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      item.zone === 'red'
                        ? 'border-red-200 bg-red-100 text-red-700'
                        : item.zone === 'yellow'
                          ? 'border-amber-200 bg-amber-100 text-amber-700'
                          : 'border-emerald-200 bg-emerald-100 text-emerald-700'
                    }
                  >
                    {zoneLabel(item.zone)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
