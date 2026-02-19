'use client'

import { CircleHelp } from 'lucide-react'
import { useMemo } from 'react'
import {
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip as HelpTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { PRODUCT_GROUPS } from '@/lib/metrics-data'
import type { ProductSituationBubblePoint } from '@/lib/product-situation-analytics'
import { cn } from '@/lib/utils'

interface ProductSituationBubbleMatrixProps {
  points: ProductSituationBubblePoint[]
  onPointClick?: (point: ProductSituationBubblePoint) => void
  chartHeightClassName?: string
}

interface MatrixPoint extends ProductSituationBubblePoint {
  x: number
  y: number
  bubbleRadius: number
}

const MATRIX_ZONE_THRESHOLDS = {
  greenMax: 5,
  yellowMax: 30,
  max: 100,
} as const

const ZONE_LABELS: Record<ProductSituationBubblePoint['zone'], string> = {
  green: 'Норма',
  yellow: 'Внимание',
  red: 'Критично',
}

function formatCount(value: number) {
  return value.toLocaleString('ru-RU')
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function shortLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) {
    return label
  }

  return `${label.slice(0, Math.max(1, maxLength - 1))}…`
}

function zoneByProblemRate(problemRate: number): ProductSituationBubblePoint['zone'] {
  if (problemRate <= MATRIX_ZONE_THRESHOLDS.greenMax) {
    return 'green'
  }

  if (problemRate <= MATRIX_ZONE_THRESHOLDS.yellowMax) {
    return 'yellow'
  }

  return 'red'
}

function zoneStyles(zone: ProductSituationBubblePoint['zone']) {
  if (zone === 'green') {
    return {
      fill: 'rgba(16, 185, 129, 0.32)',
      stroke: '#047857',
      text: 'Норма',
    }
  }

  if (zone === 'yellow') {
    return {
      fill: 'rgba(245, 158, 11, 0.32)',
      stroke: '#a16207',
      text: 'Внимание',
    }
  }

  return {
    fill: 'rgba(239, 68, 68, 0.32)',
    stroke: '#b91c1c',
    text: 'Критично',
  }
}

export function ProductSituationBubbleMatrix({
  points,
  onPointClick,
  chartHeightClassName,
}: ProductSituationBubbleMatrixProps) {
  const isMobile = useIsMobile()

  const matrixData = useMemo(() => {
    const productOrder = new Map<string, number>(
      PRODUCT_GROUPS.map((name, index) => [name, index])
    )
    const ordered = [...points]
      .filter((point) => point.totalCalls > 0)
      .sort((a, b) => {
        const aOrder = productOrder.get(a.label) ?? Number.MAX_SAFE_INTEGER
        const bOrder = productOrder.get(b.label) ?? Number.MAX_SAFE_INTEGER

        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }

        if (a.problemRate !== b.problemRate) {
          return a.problemRate - b.problemRate
        }

        if (a.problemCallsUnique !== b.problemCallsUnique) {
          return b.problemCallsUnique - a.problemCallsUnique
        }

        return a.label.localeCompare(b.label, 'ru')
      })

    const problemCallsValues = ordered.map((point) => point.problemCallsUnique)
    const minProblemCalls = Math.min(...problemCallsValues)
    const maxProblemCalls = Math.max(...problemCallsValues)
    const radiusMin = isMobile ? 8 : 9
    const radiusMax = isMobile ? 18 : 24
    const valueRange = Math.max(1, maxProblemCalls - minProblemCalls)

    const prepared = ordered.map<MatrixPoint>((point, rowIndex) => {
      const normalized = (point.problemCallsUnique - minProblemCalls) / valueRange
      const stretched = Math.pow(normalized, 0.55)
      const bubbleRadius =
        maxProblemCalls === minProblemCalls
          ? (radiusMin + radiusMax) / 2
          : radiusMin + stretched * (radiusMax - radiusMin)

      return {
        ...point,
        x: clamp(point.problemRate, 0, MATRIX_ZONE_THRESHOLDS.max),
        y: rowIndex + 1,
        bubbleRadius,
      }
    })

    const yLabelMap = new Map<number, string>(
      prepared.map((point) => [point.y, point.label])
    )
    const yTicks = prepared.map((point) => point.y)
    return {
      points: prepared,
      yLabelMap,
      yTicks,
    }
  }, [isMobile, points])

  if (matrixData.points.length === 0) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle className="text-base">Состояние продуктов</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Состояние продуктов</CardTitle>
            <TooltipProvider>
              <HelpTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Как читать график"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] text-xs leading-5">
                  Индекс здоровья: шкала 0–100, где выше — лучше. Показатель учитывает
                  долю проблемных обращений, их тяжесть и объем звонков. По горизонтали:
                  доля проблемных обращений (0–5%, 5–30%, 30–100%). По вертикали:
                  продукты. Размер пузыря: количество проблемных обращений. Нажмите на
                  пузырь, чтобы открыть детальную аналитику продукта.
                </TooltipContent>
              </HelpTooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              Норма 0–5%
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500/80" />
              Внимание 5–30%
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              Критично 30–100%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        <div
          className={cn(
            'h-[62dvh] min-h-[320px] w-full md:h-full md:min-h-0',
            chartHeightClassName
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 6, right: 8, bottom: 22, left: 8 }}>
              <ReferenceArea x1={0} x2={MATRIX_ZONE_THRESHOLDS.greenMax} fill="rgba(16, 185, 129, 0.10)" />
              <ReferenceArea
                x1={MATRIX_ZONE_THRESHOLDS.greenMax}
                x2={MATRIX_ZONE_THRESHOLDS.yellowMax}
                fill="rgba(245, 158, 11, 0.10)"
              />
              <ReferenceArea
                x1={MATRIX_ZONE_THRESHOLDS.yellowMax}
                x2={MATRIX_ZONE_THRESHOLDS.max}
                fill="rgba(239, 68, 68, 0.10)"
              />

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, MATRIX_ZONE_THRESHOLDS.max]}
                ticks={[
                  0,
                  MATRIX_ZONE_THRESHOLDS.greenMax,
                  MATRIX_ZONE_THRESHOLDS.yellowMax,
                  MATRIX_ZONE_THRESHOLDS.max,
                ]}
                tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                label={{
                  value: 'Зона по доле проблемных обращений',
                  position: 'insideBottom',
                  offset: -12,
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: isMobile ? 10 : 11,
                }}
              />

              <YAxis
                type="number"
                dataKey="y"
                domain={[0.5, matrixData.points.length + 0.5]}
                ticks={matrixData.yTicks}
                tickFormatter={(value) =>
                  shortLabel(
                    matrixData.yLabelMap.get(Number(value)) ?? '',
                    isMobile ? 14 : 22
                  )
                }
                tickLine={false}
                axisLine={false}
                width={isMobile ? 120 : 170}
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                label={{
                  value: 'Продукты',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: isMobile ? 10 : 11,
                  offset: 2,
                }}
              />

              <Tooltip
                cursor={{ strokeDasharray: '4 4', stroke: 'hsl(var(--border))' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null
                  }

                  const point = payload[0]?.payload as MatrixPoint | undefined
                  if (!point) {
                    return null
                  }

                  const visualZone = zoneByProblemRate(point.problemRate)
                  const styles = zoneStyles(visualZone)

                  return (
                    <BerekeChartTooltip
                      title={point.label}
                      subtitle="Индекс здоровья 0–100: выше — лучше. Учитывает долю проблем, их тяжесть и объем звонков."
                      rows={[
                        {
                          id: 'health-index',
                          label: 'Индекс здоровья',
                          value: `${point.healthIndex.toFixed(1)} / 100`,
                          color: styles.stroke,
                          strong: true,
                        },
                        {
                          id: 'problem-calls',
                          label: 'Проблемные обращения',
                          value: `${formatCount(point.problemCallsUnique)} / ${point.problemRate.toFixed(1)}%`,
                          color: '#dc2626',
                        },
                        {
                          id: 'total-calls',
                          label: 'Все обращения',
                          value: formatCount(point.totalCalls),
                          color: '#64748b',
                        },
                        {
                          id: 'driver-tag',
                          label: 'Главная причина',
                          value: point.topDriverTag,
                          color: '#334155',
                        },
                        {
                          id: 'zone',
                          label: 'Зона',
                          value: ZONE_LABELS[visualZone],
                          color: styles.stroke,
                        },
                      ]}
                    />
                  )
                }}
              />

              <Scatter
                data={matrixData.points}
                shape={(props: any) => {
                  const point = props?.payload as MatrixPoint | undefined

                  if (!point) {
                    return <g />
                  }

                  const visualZone = zoneByProblemRate(point.problemRate)
                  const styles = zoneStyles(visualZone)
                  const radius = point.bubbleRadius

                  return (
                    <g
                      onClick={() => onPointClick?.(point)}
                      style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                    >
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={radius}
                        fill={styles.fill}
                        stroke={styles.stroke}
                        strokeWidth={1.8}
                      />
                    </g>
                  )
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
