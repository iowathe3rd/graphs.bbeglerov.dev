import type { InsightDateRange, InsightGranularity } from '@/features/insight-dashboard/domain/types'
import type { MetricDataPoint } from '@/lib/metrics-data'

export function createLastDaysRange(days: number): InsightDateRange {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)

  return {
    from,
    to,
  }
}

export function normalizeDateRange(range: InsightDateRange): InsightDateRange {
  if (range.from && !range.to) {
    return {
      from: range.from,
      to: range.from,
    }
  }

  return range
}

export function isDateInRange(date: string, from?: Date, to?: Date): boolean {
  const current = new Date(`${date}T00:00:00.000Z`)

  if (Number.isNaN(current.getTime())) {
    return false
  }

  if (from && current < from) {
    return false
  }

  if (to && current > to) {
    return false
  }

  return true
}

export function getRangeDays(from?: Date, to?: Date): number {
  if (!from || !to) {
    return 180
  }

  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  const diff = Math.max(0, Math.round((toUtc - fromUtc) / 86400000))

  return diff + 1
}

export function toDateKey(date?: Date): string | undefined {
  if (!date) {
    return undefined
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDateKey(value?: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return undefined
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date
}

export function startOfWeekKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  const day = (date.getUTCDay() + 6) % 7

  date.setUTCDate(date.getUTCDate() - day)

  return date.toISOString().slice(0, 10)
}

export function startOfMonthKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  date.setUTCDate(1)

  return date.toISOString().slice(0, 10)
}

export function toBucketDateKey(dateKey: string, granularity: InsightGranularity): string {
  if (granularity === 'week') {
    return startOfWeekKey(dateKey)
  }

  if (granularity === 'month') {
    return startOfMonthKey(dateKey)
  }

  return dateKey
}

export function bucketMetricSeries(
  series: MetricDataPoint[],
  granularity: InsightGranularity
): MetricDataPoint[] {
  if (granularity === 'day') {
    return series
  }

  const buckets = new Map<string, { sum: number; count: number }>()

  for (const point of series) {
    const bucketKey = toBucketDateKey(point.date, granularity)
    const current = buckets.get(bucketKey)

    if (current) {
      current.sum += point.value
      current.count += 1
      continue
    }

    buckets.set(bucketKey, { sum: point.value, count: 1 })
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, stats]) => ({
      date,
      value: Math.round((stats.sum / stats.count) * 10) / 10,
    }))
}
