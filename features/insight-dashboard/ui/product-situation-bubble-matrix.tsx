'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
import {
  buildDetailedProductZonesHelpDialogCopy,
  buildHealthIndexHelpDialogCopy,
  type InsightHelpDialogVariant,
} from '@/features/insight-dashboard/config/tooltips'
import {
  formatBucketLabel,
} from '@/features/insight-dashboard/domain/date-bucketing'
import type {
  ProductBubblePoint,
  ProductSituationScoreThresholds,
} from '@/features/insight-dashboard/domain/types'
import { useIsMobile } from '@/hooks/use-mobile'
import { BerekeChartTooltip } from '@/components/charts/bereke-chart-tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OverlapGranularity } from '@/lib/metrics-data'
import { cn } from '@/lib/utils'
import { InsightHelpDialogButton } from '@/features/insight-dashboard/ui/insight-help-dialog-button'

interface ProductSituationBubbleMatrixProps {
  points: ProductBubblePoint[]
  scoreThresholds: ProductSituationScoreThresholds
  onPointClick?: (point: ProductBubblePoint) => void
  productOrder?: string[]
  presentation?: 'default' | 'focused'
  chartHeightClassName?: string
  loading?: boolean
  title?: string
  xMode?: 'products' | 'periods'
  xAxisLabel?: string
  periodGranularity?: OverlapGranularity
  tooltipEntityLabel?: string
  showTrajectory?: boolean
  helpDialogVariant?: InsightHelpDialogVariant
}

interface MatrixPoint extends ProductBubblePoint {
  x: number
  y: number
  bubbleRadius: number
}

const ZONE_LABELS: Record<ProductBubblePoint['zone'], string> = {
  green: 'Зеленая',
  yellow: 'Желтая',
  red: 'Красная',
}

function formatScore(value: number) {
  const rounded = Math.round(value * 1000) / 1000

  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

function formatBoundaryScore(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1)
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
      text: 'Зеленая',
    }
  }

  if (zone === 'yellow') {
    return {
      fill: 'rgba(245, 158, 11, 0.32)',
      stroke: '#a16207',
      text: 'Желтая',
    }
  }

  return {
    fill: 'rgba(239, 68, 68, 0.32)',
    stroke: '#b91c1c',
    text: 'Красная',
  }
}

export function ProductSituationBubbleMatrix({
  points,
  scoreThresholds,
  onPointClick,
  productOrder = [...DEFAULT_PRODUCT_OPTIONS],
  presentation = 'default',
  chartHeightClassName,
  loading = false,
  title,
  xMode = 'products',
  xAxisLabel,
  periodGranularity = 'week',
  tooltipEntityLabel,
  showTrajectory = false,
  helpDialogVariant = 'health-index',
}: ProductSituationBubbleMatrixProps) {
  const isMobile = useIsMobile()
  const isFocused = presentation === 'focused'
  const chartHostRef = useRef<HTMLDivElement | null>(null)
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const node = chartHostRef.current
    if (!node || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      setChartSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  const matrixData = useMemo(() => {
    const productOrderMap = new Map<string, number>(
      productOrder.map((name, index) => [name, index])
    )

    const ordered = [...points]
      .filter((point) => point.totalCalls > 0)
      .sort((a, b) => {
        if (xMode === 'periods') {
          const aPeriod = a.periodKey ?? ''
          const bPeriod = b.periodKey ?? ''

          if (aPeriod !== bPeriod) {
            return aPeriod.localeCompare(bPeriod)
          }
        }

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
    const isSinglePoint = ordered.length === 1
    const focusedSinglePoint = isFocused && isSinglePoint

    const plotWidth = chartSize.width > 0 ? chartSize.width : isMobile ? 320 : 820
    const plotHeight = chartSize.height > 0 ? chartSize.height : isMobile ? 260 : 360
    const minPlotSide = Math.min(plotWidth, plotHeight)
    const pointsCount = Math.max(1, ordered.length)
    const pointSlotWidth = plotWidth / pointsCount
    const focusedRadiusCap = xMode === 'periods' ? (isMobile ? 18 : 22) : isMobile ? 20 : 24
    const defaultRadiusCap = isMobile ? 24 : 30
    const adaptiveMax = Math.min(
      pointSlotWidth * (xMode === 'periods' ? 0.18 : 0.3),
      plotHeight * (focusedSinglePoint ? 0.11 : 0.17),
      minPlotSide * (focusedSinglePoint ? 0.13 : 0.18)
    )
    const radiusMax = clamp(
      adaptiveMax,
      isMobile ? 7 : 8,
      focusedSinglePoint ? focusedRadiusCap : defaultRadiusCap
    )
    const radiusMin = clamp(
      radiusMax * (focusedSinglePoint ? 0.55 : 0.38),
      isMobile ? 5 : 6,
      radiusMax
    )

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
          ? radiusMin + (radiusMax - radiusMin) * (focusedSinglePoint ? 0.62 : 0.5)
          : radiusMin + normalized * (radiusMax - radiusMin)

      return {
        ...point,
        x: rowIndex + 1,
        y: clamp(point.healthIndex, yPointMin, yPointMax),
        bubbleRadius,
      }
    })

    const xLabelMap = new Map<number, string>(
      prepared.map((point) => {
        const label =
          xMode === 'periods' && point.periodKey
            ? formatBucketLabel(point.periodKey, periodGranularity, 'short')
            : point.label

        return [point.x, label]
      })
    )

    const xTicks = prepared.map((point) => point.x)

    return {
      points: prepared,
      xLabelMap,
      xTicks,
      isSinglePoint,
      focusedSinglePoint,
      yMax,
      yTicks,
    }
  }, [
    chartSize.height,
    chartSize.width,
    isFocused,
    isMobile,
    periodGranularity,
    points,
    productOrder,
    scoreThresholds.lower,
    scoreThresholds.upper,
    xMode,
  ])

  const resolvedTitle =
    title ?? (xMode === 'periods' ? 'Состояние продукта' : 'Состояние продуктов')
  const resolvedXAxisLabel = xAxisLabel ?? (xMode === 'periods' ? 'Период' : 'Продукты')
  const helpDialogCopy =
    helpDialogVariant === 'detailed-product-zones'
      ? buildDetailedProductZonesHelpDialogCopy(scoreThresholds)
      : buildHealthIndexHelpDialogCopy(scoreThresholds)

  if (loading) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle className="text-base">{resolvedTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Загрузка звонков…</CardContent>
      </Card>
    )
  }

  if (matrixData.points.length === 0) {
    return (
      <Card className="flex h-full min-h-0 flex-col">
        <CardHeader>
          <CardTitle className="text-base">{resolvedTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader
        className={cn(
          'space-y-2 pb-2',
          isFocused ? 'space-y-1.5 px-3 pb-1 pt-3 md:px-3 md:pb-1 md:pt-3' : null
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{resolvedTitle}</CardTitle>
            <InsightHelpDialogButton
              copy={helpDialogCopy}
              ariaLabel="Как рассчитывается Health Index"
            />
          </div>

          {matrixData.focusedSinglePoint ? (
            <p className="text-[11px] text-muted-foreground">
              Зеленая: до {formatBoundaryScore(scoreThresholds.lower)} · Желтая:{' '}
              {formatBoundaryScore(scoreThresholds.lower)}–{formatBoundaryScore(scoreThresholds.upper)} · Красная: от{' '}
              {formatBoundaryScore(scoreThresholds.upper)}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-[11px]">
              <Badge variant="outline" className="gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Зеленая: до {formatBoundaryScore(scoreThresholds.lower)}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Желтая: {formatBoundaryScore(scoreThresholds.lower)}–{formatBoundaryScore(scoreThresholds.upper)}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                Красная: от {formatBoundaryScore(scoreThresholds.upper)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          'flex-1 min-h-0',
          isFocused ? 'px-2 pb-2 md:px-2 md:pb-2' : null
        )}
      >
        <div
          className={cn(
            'h-[62dvh] min-h-[320px] w-full md:h-full md:min-h-0',
            chartHeightClassName
          )}
        >
          <div
            className={cn(
              'grid h-full w-full gap-1 md:gap-2',
              matrixData.focusedSinglePoint
                ? 'grid-cols-1'
                : 'grid-cols-[32px_minmax(0,1fr)] md:grid-cols-[38px_minmax(0,1fr)]'
            )}
          >
            {!matrixData.focusedSinglePoint ? (
              <div className="flex items-center justify-center">
                <span className="-rotate-90 whitespace-nowrap text-[10px] text-muted-foreground md:text-[11px]">
                  Health Index (чем выше, тем хуже)
                </span>
              </div>
            ) : null}

            <div ref={chartHostRef} className="h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: matrixData.focusedSinglePoint ? 10 : 8,
                    right: matrixData.focusedSinglePoint ? 14 : 10,
                    bottom: matrixData.focusedSinglePoint
                      ? isMobile
                        ? 32
                        : 18
                      : isMobile
                        ? 62
                        : 30,
                    left: matrixData.focusedSinglePoint ? (isMobile ? 4 : 8) : isMobile ? 8 : 10,
                  }}
                >
                  <ReferenceArea y1={0} y2={scoreThresholds.lower} fill="rgba(16, 185, 129, 0.10)" />
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
                      shortLabel(matrixData.xLabelMap.get(Number(value)) ?? '', isMobile ? 12 : 26)
                    }
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={matrixData.focusedSinglePoint ? 0 : -15}
                    textAnchor={matrixData.focusedSinglePoint ? 'middle' : 'end'}
                    height={matrixData.focusedSinglePoint ? (isMobile ? 34 : 24) : isMobile ? 64 : 56}
                    tick={{ fontSize: isMobile ? 10 : 11, fill: 'hsl(var(--muted-foreground))' }}
                    label={{
                      value: matrixData.focusedSinglePoint ? '' : resolvedXAxisLabel,
                      position: 'bottom',
                      offset: matrixData.focusedSinglePoint ? 0 : isMobile ? 10 : 8,
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
                    width={matrixData.focusedSinglePoint ? (isMobile ? 52 : 58) : isMobile ? 56 : 66}
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
                      const periodTitle =
                        xMode === 'periods' && point.periodKey
                          ? formatBucketLabel(point.periodKey, periodGranularity, 'long')
                          : point.label
                      const tooltipTitle =
                        xMode === 'periods'
                          ? `${tooltipEntityLabel ?? point.label} · ${periodTitle}`
                          : point.label

                      return (
                        <BerekeChartTooltip
                          title={tooltipTitle}
                          rows={[
                            {
                              id: 'health-index',
                              label: 'Health Index',
                              value: formatScore(point.healthIndex),
                              color: styles.stroke,
                              strong: true,
                            },
                            {
                              id: 'indicator-1-share',
                              label: 'Тех. проблемы',
                              value: formatPercent(point.indicator1Share),
                              color: '#2563eb',
                            },
                            {
                              id: 'indicator-2-share',
                              label: 'Запрос не решен',
                              value: formatPercent(point.indicator2Share),
                              color: '#f97316',
                            },
                            {
                              id: 'indicator-3-share',
                              label: 'Негативный продуктовый фидбэк',
                              value: formatPercent(point.indicator3Share),
                              color: '#0f766e',
                            },
                            {
                              id: 'indicator-4-share',
                              label: 'Риск ухода',
                              value: formatPercent(point.indicator4Share),
                              color: '#dc2626',
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
                    line={
                      xMode === 'periods' && showTrajectory && matrixData.points.length > 1
                        ? {
                            stroke: 'hsl(var(--muted-foreground))',
                            strokeWidth: 1.6,
                            strokeDasharray: '4 3',
                          }
                        : false
                    }
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
        </div>
      </CardContent>
    </Card>
  )
}
