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

import { DEFAULT_PRODUCT_OPTIONS } from '@/features/insight-dashboard/config/constants'
import { INSIGHT_TOOLTIP_COPY } from '@/features/insight-dashboard/config/tooltips'
import type {
  ProductBubblePoint,
  ProductSituationScoreThresholds,
} from '@/features/insight-dashboard/domain/types'
import { useIsMobile } from '@/hooks/use-mobile'
import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip as HelpTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ProductSituationBubbleMatrixProps {
  points: ProductBubblePoint[]
  scoreThresholds: ProductSituationScoreThresholds
  onPointClick?: (point: ProductBubblePoint) => void
  productOrder?: string[]
  chartHeightClassName?: string
  loading?: boolean
}

interface MatrixPoint extends ProductBubblePoint {
  x: number
  y: number
  bubbleRadius: number
}

const ZONE_LABELS: Record<ProductBubblePoint['zone'], string> = {
  green: 'Норма',
  yellow: 'Внимание',
  red: 'Критично',
}

function formatCount(value: number) {
  return value.toLocaleString('ru-RU')
}

function formatScore(value: number) {
  const rounded = Math.round(value * 1000) / 1000

  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10
  const isInteger = Math.abs(rounded - Math.round(rounded)) < 0.001
  return `${isInteger ? Math.round(rounded) : rounded.toFixed(1)}%`
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

function zoneByScore(
  score: number,
  thresholds: ProductSituationScoreThresholds
): ProductBubblePoint['zone'] {
  if (score <= thresholds.lower) {
    return 'green'
  }

  if (score >= thresholds.upper) {
    return 'red'
  }

  return 'yellow'
}

function zoneStyles(zone: ProductBubblePoint['zone']) {
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
  scoreThresholds,
  onPointClick,
  productOrder = [...DEFAULT_PRODUCT_OPTIONS],
  chartHeightClassName,
  loading = false,
}: ProductSituationBubbleMatrixProps) {
  const isMobile = useIsMobile()

  const matrixData = useMemo(() => {
    const productOrderMap = new Map<string, number>(
      productOrder.map((name, index) => [name, index])
    )
    const ordered = [...points]
      .filter((point) => point.totalCalls > 0)
      .sort((a, b) => {
        const aOrder = productOrderMap.get(a.label) ?? Number.MAX_SAFE_INTEGER
        const bOrder = productOrderMap.get(b.label) ?? Number.MAX_SAFE_INTEGER

        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }

        if (a.healthIndex !== b.healthIndex) {
          return a.healthIndex - b.healthIndex
        }

        if (a.problemCallsUnique !== b.problemCallsUnique) {
          return b.problemCallsUnique - a.problemCallsUnique
        }

        return a.label.localeCompare(b.label, 'ru')
      })

    const problemCallsValues = ordered.map((point) => point.problemCallsUnique)
    const minProblemCalls = Math.min(...problemCallsValues)
    const maxProblemCalls = Math.max(...problemCallsValues)
    const radiusMin = isMobile ? 7 : 8
    const radiusMax = isMobile ? 24 : 32
    const valueRange = Math.max(1, maxProblemCalls - minProblemCalls)
    const maxScoreValue = ordered.reduce(
      (max, point) => Math.max(max, point.healthIndex),
      0
    )
    const zoneUpperBound = Math.max(scoreThresholds.upper, maxScoreValue)
    const yMax = (zoneUpperBound > 0 ? zoneUpperBound : 1) * 1.1
    const yPointPadding = yMax * 0.015
    const yPointMin = yPointPadding
    const yPointMax = Math.max(yPointPadding, yMax - yPointPadding)
    const yTicks = Array.from(
      new Set([
        0,
        scoreThresholds.lower,
        scoreThresholds.upper,
        zoneUpperBound > 0 ? zoneUpperBound : 1,
      ].map((value) => Math.round(value * 10000) / 10000))
    ).sort((a, b) => a - b)

    const prepared = ordered.map<MatrixPoint>((point, rowIndex) => {
      const normalized = (point.problemCallsUnique - minProblemCalls) / valueRange
      const bubbleRadius =
        maxProblemCalls === minProblemCalls
          ? (radiusMin + radiusMax) / 2
          : radiusMin + normalized * (radiusMax - radiusMin)

      return {
        ...point,
        x: rowIndex + 1,
        y: clamp(point.healthIndex, yPointMin, yPointMax),
        bubbleRadius,
      }
    })

    const xLabelMap = new Map<number, string>(
      prepared.map((point) => [point.x, point.label])
    )
    const xTicks = prepared.map((point) => point.x)
    return {
      points: prepared,
      xLabelMap,
      xTicks,
      yMax,
      yTicks,
    }
  }, [isMobile, points, productOrder, scoreThresholds.lower, scoreThresholds.upper])

  if (loading) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle className="text-base">Состояние продуктов</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Загрузка звонков…</CardContent>
      </Card>
    )
  }

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
                  {INSIGHT_TOOLTIP_COPY.bubbleMatrixHelp}
                </TooltipContent>
              </HelpTooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <Badge variant="outline" className="gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Норма ≤ {formatScore(scoreThresholds.lower)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              Внимание {formatScore(scoreThresholds.lower)}–{formatScore(scoreThresholds.upper)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Критично ≥ {formatScore(scoreThresholds.upper)}
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
          <div className="grid h-full w-full grid-cols-[32px_minmax(0,1fr)] gap-1 md:grid-cols-[38px_minmax(0,1fr)] md:gap-2">
            <div className="flex items-center justify-center">
              <span className="-rotate-90 whitespace-nowrap text-[10px] text-muted-foreground md:text-[11px]">
                Score продукта (чем выше, тем хуже)
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 8,
                  right: 10,
                  bottom: isMobile ? 62 : 30,
                  left: isMobile ? 8 : 10,
                }}
              >
                <ReferenceArea
                  y1={0}
                  y2={scoreThresholds.lower}
                  fill="rgba(16, 185, 129, 0.10)"
                />
                <ReferenceArea
                  y1={scoreThresholds.lower}
                  y2={scoreThresholds.upper}
                  fill="rgba(245, 158, 11, 0.10)"
                />
                <ReferenceArea
                  y1={scoreThresholds.upper}
                  y2={matrixData.yMax}
                  fill="rgba(239, 68, 68, 0.10)"
                />

                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0.5, matrixData.points.length + 0.5]}
                  ticks={matrixData.xTicks}
                  tickFormatter={(value) =>
                    shortLabel(
                      matrixData.xLabelMap.get(Number(value)) ?? '',
                      isMobile ? 11 : 16
                    )
                  }
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={isMobile ? 64 : 56}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                  label={{
                    value: 'Продукты',
                    position: 'bottom',
                    offset: isMobile ? 10 : 8,
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: isMobile ? 10 : 11,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, matrixData.yMax]}
                  ticks={matrixData.yTicks}
                  tickFormatter={(value) => formatScore(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 56 : 66}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: '4 4', stroke: 'hsl(var(--border))' }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  offset={10}
                  wrapperStyle={{ zIndex: 30, pointerEvents: 'none' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) {
                      return null
                    }

                    const point = payload[0]?.payload as MatrixPoint | undefined
                    if (!point) {
                      return null
                    }

                    const visualZone = zoneByScore(point.healthIndex, scoreThresholds)
                    const styles = zoneStyles(visualZone)

                    return (
                      <BerekeChartTooltip
                        title={point.label}
                        subtitle={INSIGHT_TOOLTIP_COPY.bubbleMatrixHealthIndex}
                        rows={[
                          {
                            id: 'health-index',
                            label: 'Score продукта',
                            value: formatScore(point.healthIndex),
                            color: styles.stroke,
                            strong: true,
                          },
                          {
                            id: 'problem-rate',
                            label: 'Доля проблемных обращений',
                            value: formatPercent(point.problemRate),
                            color: '#dc2626',
                          },
                          {
                            id: 'problem-calls',
                            label: 'Проблемные обращения',
                            value: formatCount(point.problemCallsUnique),
                            color: '#ef4444',
                          },
                          {
                            id: 'total-calls',
                            label: 'Все обращения',
                            value: formatCount(point.totalCalls),
                            color: '#94a3b8',
                          },
                          {
                            id: 'top-driver',
                            label: 'Главная причина',
                            value: point.topDriverTag ? shortLabel(point.topDriverTag, 20) : '—',
                            color: '#64748b',
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

                    const visualZone = zoneByScore(point.healthIndex, scoreThresholds)
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
        </div>
      </CardContent>
    </Card>
  )
}
