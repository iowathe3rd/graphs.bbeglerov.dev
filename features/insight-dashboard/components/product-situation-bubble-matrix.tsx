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
  buildDetailedProductDissatisfactionHelpDialogCopy,
  buildMainProductDissatisfactionHelpDialogCopy,
  type InsightHelpDialogVariant,
} from '@/features/insight-dashboard/config/tooltips'
import {
  formatBucketLabel,
} from '@/features/insight-dashboard/logic/date-bucketing'
import type {
  ProductBubblePoint,
  ProductSituationScoreThresholds,
} from '@/features/insight-dashboard/logic/types'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PeriodGranularity } from '@/features/insight-dashboard/logic/metrics-catalog'
import { cn } from '@/lib/utils'
import { InsightHelpDialogButton } from '@/features/insight-dashboard/components/insight-help-dialog-button'
import {
  CHART_CARD_CAPTION_CLASS,
  CHART_CARD_CONTENT_CLASS,
  CHART_CARD_CONTENT_COMPACT_CLASS,
  CHART_CARD_HEADER_CLASS,
  CHART_CARD_HEADER_COMPACT_CLASS,
  CHART_CARD_TITLE_CLASS,
} from '@/features/insight-dashboard/components/chart-card-tokens'
import {
  BubbleTooltipContent,
} from '@/features/insight-dashboard/components/product-situation-bubble-matrix/tooltip-content'
import {
  BubbleZoneLegend,
} from '@/features/insight-dashboard/components/product-situation-bubble-matrix/zone-legend'
import { BubbleChartLayout } from '@/features/insight-dashboard/components/product-situation-bubble-matrix/chart-layout'
import {
  clamp,
  formatScore,
  shortLabel,
  type MatrixPoint,
  zoneByScore,
  zoneStyles,
} from '@/features/insight-dashboard/components/product-situation-bubble-matrix/helpers'

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
  periodGranularity?: PeriodGranularity
  tooltipEntityLabel?: string
  showTrajectory?: boolean
  helpDialogVariant?: InsightHelpDialogVariant
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
  helpDialogVariant = 'product-dissatisfaction-score-main',
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

        if (a.productDissatisfactionScore !== b.productDissatisfactionScore) {
          return a.productDissatisfactionScore - b.productDissatisfactionScore
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
      (max, point) => Math.max(max, point.productDissatisfactionScore),
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
        y: clamp(point.productDissatisfactionScore, yPointMin, yPointMax),
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
  const isMainProductsView = presentation === 'default' && xMode === 'products'
  const helpDialogCopy =
    helpDialogVariant === 'product-dissatisfaction-score-detailed'
      ? buildDetailedProductDissatisfactionHelpDialogCopy()
      : buildMainProductDissatisfactionHelpDialogCopy(scoreThresholds)

  if (loading) {
    return (
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <CardHeader className={isFocused ? CHART_CARD_HEADER_COMPACT_CLASS : CHART_CARD_HEADER_CLASS}>
          <CardTitle className={CHART_CARD_TITLE_CLASS}>{resolvedTitle}</CardTitle>
        </CardHeader>
        <CardContent className={isFocused ? CHART_CARD_CONTENT_COMPACT_CLASS : CHART_CARD_CONTENT_CLASS}>
          <p className={CHART_CARD_CAPTION_CLASS}>Загрузка звонков…</p>
        </CardContent>
      </Card>
    )
  }

  if (matrixData.points.length === 0) {
    return (
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <CardHeader className={isFocused ? CHART_CARD_HEADER_COMPACT_CLASS : CHART_CARD_HEADER_CLASS}>
          <CardTitle className={CHART_CARD_TITLE_CLASS}>{resolvedTitle}</CardTitle>
        </CardHeader>
        <CardContent className={isFocused ? CHART_CARD_CONTENT_COMPACT_CLASS : CHART_CARD_CONTENT_CLASS}>
          <p className={CHART_CARD_CAPTION_CLASS}>Нет данных</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className={isFocused ? CHART_CARD_HEADER_COMPACT_CLASS : CHART_CARD_HEADER_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className={CHART_CARD_TITLE_CLASS}>{resolvedTitle}</CardTitle>
            <InsightHelpDialogButton
              copy={helpDialogCopy}
              ariaLabel="Как рассчитывается оценка неудовлетворенности продуктом"
            />
          </div>

          <BubbleZoneLegend
            scoreThresholds={scoreThresholds}
            focusedSinglePoint={matrixData.focusedSinglePoint}
          />
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          'min-h-0',
          isFocused ? CHART_CARD_CONTENT_COMPACT_CLASS : CHART_CARD_CONTENT_CLASS
        )}
      >
        <BubbleChartLayout
          focusedSinglePoint={matrixData.focusedSinglePoint}
          isMainProductsView={isMainProductsView}
          chartHeightClassName={chartHeightClassName}
        >
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
                      fontSize: isMainProductsView ? (isMobile ? 12 : 14) : isMobile ? 10 : 11,
                      fontWeight: isMainProductsView ? 700 : 400,
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
                    tick={{
                      fontSize: isMobile ? 10 : 11,
                      fill: 'hsl(var(--muted-foreground))',
                      fontWeight: isMainProductsView ? 600 : 400,
                    }}
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

                      return (
                        <BubbleTooltipContent
                          point={point}
                          scoreThresholds={scoreThresholds}
                          xMode={xMode}
                          periodGranularity={periodGranularity}
                          tooltipEntityLabel={tooltipEntityLabel}
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

                      const visualZone = zoneByScore(point.productDissatisfactionScore, scoreThresholds)
                      const styles = zoneStyles(visualZone)

                      return (
                        <g
                          onClick={() => onPointClick?.(point)}
                          style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                        >
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={point.bubbleRadius}
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
        </BubbleChartLayout>
      </CardContent>
    </Card>
  )
}
