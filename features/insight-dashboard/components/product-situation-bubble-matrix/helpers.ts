import type {
  ProductBubblePoint,
  ProductSituationScoreThresholds,
} from '@/features/insight-dashboard/logic/types'

export interface MatrixPoint extends ProductBubblePoint {
  x: number
  y: number
  bubbleRadius: number
}

export const ZONE_LABELS: Record<ProductBubblePoint['zone'], string> = {
  green: 'Зеленая',
  yellow: 'Желтая',
  red: 'Красная',
}

export function formatScore(value: number) {
  const rounded = Math.round(value * 1000) / 1000

  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(3).replace(/\.?0+$/, '')
}

export function formatBoundaryScore(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1)
}

export function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10
  const isInteger = Math.abs(rounded - Math.round(rounded)) < 0.001
  return `${isInteger ? Math.round(rounded) : rounded.toFixed(1)}%`
}

export function shortLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) {
    return label
  }

  return `${label.slice(0, Math.max(1, maxLength - 1))}…`
}

export function zoneByScore(
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

export function zoneStyles(zone: ProductBubblePoint['zone']) {
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

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
