import type { InsightDateRange, InsightGranularity } from '@/features/insight-dashboard/logic/types'
import type { MetricDataPoint } from '@/features/insight-dashboard/logic/metrics-catalog'

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

function toUtcTimestamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function toUtcMidnightDate(date: Date): Date {
  return new Date(toUtcTimestamp(date))
}

export function isDateInRange(date: string, from?: Date, to?: Date): boolean {
  const parsed = parseDateKey(date)
  if (!parsed) {
    return false
  }

  const currentTs = toUtcTimestamp(parsed)

  if (from && currentTs < toUtcTimestamp(from)) {
    return false
  }

  if (to && currentTs > toUtcTimestamp(to)) {
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
  return granularity === 'week' ? startOfWeekKey(dateKey) : startOfMonthKey(dateKey)
}

export function startOfIsoWeek(date: Date): Date {
  const result = toUtcMidnightDate(date)
  const day = (result.getUTCDay() + 6) % 7
  result.setUTCDate(result.getUTCDate() - day)
  return result
}

export function endOfIsoWeek(date: Date): Date {
  const result = startOfIsoWeek(date)
  result.setUTCDate(result.getUTCDate() + 6)
  return result
}

export function startOfMonthDate(date: Date): Date {
  const result = toUtcMidnightDate(date)
  result.setUTCDate(1)
  return result
}

export function endOfMonthDate(date: Date): Date {
  const result = startOfMonthDate(date)
  result.setUTCMonth(result.getUTCMonth() + 1)
  result.setUTCDate(0)
  return result
}

export function normalizeDateRangeByGranularity(
  range: InsightDateRange,
  granularity: InsightGranularity
): InsightDateRange {
  const normalized = normalizeDateRange(range)
  const from = normalized.from
  const to = normalized.to

  if (!from && !to) {
    return normalized
  }

  const resolvedFrom = from ?? to
  const resolvedTo = to ?? from

  if (!resolvedFrom || !resolvedTo) {
    return normalized
  }

  const fromMidnight = toUtcMidnightDate(resolvedFrom)
  const toMidnight = toUtcMidnightDate(resolvedTo)
  const orderedFrom = fromMidnight <= toMidnight ? fromMidnight : toMidnight
  const orderedTo = fromMidnight <= toMidnight ? toMidnight : fromMidnight

  return granularity === 'week'
    ? {
        from: startOfIsoWeek(orderedFrom),
        to: endOfIsoWeek(orderedTo),
      }
    : {
        from: startOfMonthDate(orderedFrom),
        to: endOfMonthDate(orderedTo),
      }
}

export function buildPeriodRangeFromAnchor(
  anchor: Date,
  granularity: InsightGranularity
): InsightDateRange {
  const normalizedAnchor = toUtcMidnightDate(anchor)

  const from =
    granularity === 'week' ? startOfIsoWeek(normalizedAnchor) : startOfMonthDate(normalizedAnchor)

  return {
    from,
    to: granularity === 'week' ? endOfIsoWeek(from) : endOfMonthDate(from),
  }
}

function formatRuShort(date: Date): string {
  return date
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    })
    .replace('.', '')
}

function formatRuLong(date: Date): string {
  return date
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .replace(' г.', '')
}

function isoWeekInfoFromDate(date: Date): {
  week: number
  year: number
  start: Date
  end: Date
} {
  const start = startOfIsoWeek(date)
  const end = endOfIsoWeek(date)
  const anchor = new Date(start)
  anchor.setUTCDate(anchor.getUTCDate() + 3)
  const weekYear = anchor.getUTCFullYear()
  const yearStart = new Date(Date.UTC(weekYear, 0, 1))
  const yearStartDay = (yearStart.getUTCDay() + 6) % 7
  yearStart.setUTCDate(yearStart.getUTCDate() - yearStartDay)
  const diffDays = Math.round((start.getTime() - yearStart.getTime()) / 86400000)
  const week = Math.floor(diffDays / 7) + 1

  return {
    week,
    year: weekYear,
    start,
    end,
  }
}

export function formatBucketLabel(
  dateKey: string,
  granularity: InsightGranularity,
  mode: 'short' | 'long' = 'short'
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return dateKey
  }

  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  if (granularity === 'week') {
    const info = isoWeekInfoFromDate(date)
    const weekToken = `W${String(info.week).padStart(2, '0')}`
    const startLabel = mode === 'short' ? formatRuShort(info.start) : formatRuLong(info.start)
    const endLabel = mode === 'short' ? formatRuShort(info.end) : formatRuLong(info.end)

    return `${weekToken} (${startLabel}–${endLabel})`
  }

  if (granularity === 'month') {
    const monthLabel = date
      .toLocaleDateString('ru-RU', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
      .replace(' г.', '')

    return monthLabel
  }

  if (mode === 'long') {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}

export function bucketMetricSeries(
  series: MetricDataPoint[],
  granularity: InsightGranularity
): MetricDataPoint[] {
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
