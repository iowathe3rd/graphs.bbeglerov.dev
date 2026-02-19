import { DASHBOARD_METRIC_IDS, DEFAULT_DETAILED_FILTERS } from '@/features/insight-dashboard/config/constants'
import {
  bucketMetricSeries,
  isDateInRange,
  normalizeDateRange,
  parseDateKey,
  toDateKey,
} from '@/features/insight-dashboard/domain/date-bucketing'
import {
  buildOverlapAnalyticsModel,
  buildOverlapSeriesColorMap,
} from '@/features/insight-dashboard/domain/overlap-analytics'
import type {
  DetailedAnalyticsModel,
  InsightDetailedFilters,
  InsightEvent,
} from '@/features/insight-dashboard/domain/types'
import { filterTaxonomyByProduct } from '@/lib/taxonomy-mapping'
import {
  METRICS,
  PRODUCT_GROUPS,
  SECTORS,
  type MetricDataPoint,
  type OverlapGranularity,
} from '@/lib/metrics-data'

export const DETAILED_GRANULARITY_VALUES: readonly OverlapGranularity[] = ['day', 'week', 'month']

export interface PersistedDashboardPreferences {
  filters: {
    sector: string
    productGroup: string
    dateRange: {
      from?: string
      to?: string
    }
  }
  granularity: OverlapGranularity
}

export interface ParsedDashboardQueryOverrides {
  sector: InsightDetailedFilters['sector'] | null
  productGroup: InsightDetailedFilters['productGroup'] | null
  granularity: OverlapGranularity | null
  dateRange: InsightDetailedFilters['dateRange'] | null
}

export function parseDashboardPreferences(raw: string | null): {
  filters: InsightDetailedFilters
  granularity: OverlapGranularity
} | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedDashboardPreferences
    const sector = SECTORS.includes(parsed?.filters?.sector as (typeof SECTORS)[number])
      ? (parsed.filters.sector as InsightDetailedFilters['sector'])
      : DEFAULT_DETAILED_FILTERS.sector
    const productGroup = PRODUCT_GROUPS.includes(
      parsed?.filters?.productGroup as (typeof PRODUCT_GROUPS)[number]
    )
      ? (parsed.filters.productGroup as InsightDetailedFilters['productGroup'])
      : DEFAULT_DETAILED_FILTERS.productGroup
    const granularity = DETAILED_GRANULARITY_VALUES.includes(parsed?.granularity)
      ? parsed.granularity
      : 'day'

    return {
      filters: {
        sector,
        channel: 'Колл-центр',
        productGroup,
        dateRange: {
          from: parseDateKey(parsed?.filters?.dateRange?.from),
          to: parseDateKey(parsed?.filters?.dateRange?.to),
        },
      },
      granularity,
    }
  } catch {
    return null
  }
}

export function parseDashboardQueryParams(
  searchParams: URLSearchParams | null
): ParsedDashboardQueryOverrides | null {
  if (!searchParams) {
    return null
  }

  const sectorRaw = searchParams.get('sector')
  const productGroupRaw = searchParams.get('productGroup')
  const fromRaw = searchParams.get('from') ?? undefined
  const toRaw = searchParams.get('to') ?? undefined
  const granularityRaw = searchParams.get('granularity')

  const sector = SECTORS.includes(sectorRaw as (typeof SECTORS)[number])
    ? (sectorRaw as InsightDetailedFilters['sector'])
    : null
  const productGroup = PRODUCT_GROUPS.includes(
    productGroupRaw as (typeof PRODUCT_GROUPS)[number]
  )
    ? (productGroupRaw as InsightDetailedFilters['productGroup'])
    : null
  const granularity = DETAILED_GRANULARITY_VALUES.includes(granularityRaw as OverlapGranularity)
    ? (granularityRaw as OverlapGranularity)
    : null
  const from = parseDateKey(fromRaw)
  const to = parseDateKey(toRaw)

  const hasDateRange = Boolean(from || to)
  const hasOverrides = Boolean(sector || productGroup || granularity || hasDateRange)

  if (!hasOverrides) {
    return null
  }

  return {
    sector,
    productGroup,
    granularity,
    dateRange: hasDateRange ? { from, to } : null,
  }
}

export function serializeDashboardPreferences(
  filters: InsightDetailedFilters,
  granularity: OverlapGranularity
): string {
  return JSON.stringify({
    filters: {
      sector: filters.sector,
      productGroup: filters.productGroup,
      dateRange: {
        from: toDateKey(filters.dateRange.from),
        to: toDateKey(filters.dateRange.to),
      },
    },
    granularity,
  } satisfies PersistedDashboardPreferences)
}

export function countActiveMobileFilters(
  filters: InsightDetailedFilters,
  granularity: OverlapGranularity
): number {
  let count = 0

  if (filters.sector !== DEFAULT_DETAILED_FILTERS.sector) {
    count += 1
  }

  if (filters.productGroup !== DEFAULT_DETAILED_FILTERS.productGroup) {
    count += 1
  }

  if (filters.dateRange.from || filters.dateRange.to) {
    count += 1
  }

  if (granularity !== 'day') {
    count += 1
  }

  return count
}

export function filterEventsForDetailedAnalytics(
  events: InsightEvent[],
  filters: InsightDetailedFilters
): InsightEvent[] {
  const normalizedRange = normalizeDateRange(filters.dateRange)
  const allowedTagNodes = filterTaxonomyByProduct(
    filters.productGroup,
    Array.from(new Set(events.map((event) => event.tag))).map((tag) => ({
      id: tag,
      label: tag,
    }))
  )
  const allowedTags = new Set(allowedTagNodes.map((node) => node.id))

  return events.filter((event) => {
    if (!isDateInRange(event.date, normalizedRange.from, normalizedRange.to)) {
      return false
    }

    if (event.channel !== filters.channel) {
      return false
    }

    if (event.sector !== filters.sector) {
      return false
    }

    if (event.productGroup !== filters.productGroup) {
      return false
    }

    if (allowedTags.size > 0 && !allowedTags.has(event.tag)) {
      return false
    }

    return true
  })
}

function toUtcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`)
}

function toDateKeyUtc(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildDateRange(fromKey: string, toKey: string): string[] {
  const fromDate = toUtcDate(fromKey)
  const toDate = toUtcDate(toKey)

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return []
  }

  const result: string[] = []
  const cursor = new Date(fromDate)

  while (cursor <= toDate) {
    result.push(toDateKeyUtc(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return result
}

function resolveSeriesDays(
  events: InsightEvent[],
  normalizedRange: InsightDetailedFilters['dateRange']
): string[] {
  const fromKey = toDateKey(normalizedRange.from)
  const toKey = toDateKey(normalizedRange.to)

  if (fromKey && toKey) {
    return buildDateRange(fromKey, toKey)
  }

  const uniqueDays = Array.from(new Set(events.map((event) => event.date))).sort()

  if (uniqueDays.length === 0) {
    return []
  }

  return buildDateRange(uniqueDays[0] as string, uniqueDays[uniqueDays.length - 1] as string)
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function buildMetricSeriesFromEvents(
  events: InsightEvent[],
  dayKeys: string[]
): Record<string, MetricDataPoint[]> {
  const dayCases = new Map<string, Set<string>>()
  const metricDayCases = new Map<string, Map<string, Set<string>>>()

  for (const metricId of DASHBOARD_METRIC_IDS) {
    metricDayCases.set(metricId, new Map<string, Set<string>>())
  }

  for (const event of events) {
    const day = event.date

    if (!dayCases.has(day)) {
      dayCases.set(day, new Set<string>())
    }
    dayCases.get(day)?.add(event.caseId)

    if (!metricDayCases.has(event.metric)) {
      continue
    }

    const dayMap = metricDayCases.get(event.metric)
    if (!dayMap?.has(day)) {
      dayMap?.set(day, new Set<string>())
    }
    dayMap?.get(day)?.add(event.caseId)
  }

  const result: Record<string, MetricDataPoint[]> = {}

  for (const metricId of DASHBOARD_METRIC_IDS) {
    const dayMap = metricDayCases.get(metricId) ?? new Map<string, Set<string>>()

    result[metricId] = dayKeys.map((date) => {
      const totalCases = dayCases.get(date)?.size ?? 0
      const metricCases = dayMap.get(date)?.size ?? 0
      const value = totalCases > 0 ? round1((metricCases / totalCases) * 100) : 0

      return {
        date,
        value,
      }
    })
  }

  return result
}

export function buildDetailedAnalyticsModel(params: {
  events: InsightEvent[]
  filters: InsightDetailedFilters
  granularity: OverlapGranularity
}): DetailedAnalyticsModel {
  const normalizedRange = normalizeDateRange(params.filters.dateRange)
  const filteredEvents = filterEventsForDetailedAnalytics(params.events, params.filters)
  const dayKeys = resolveSeriesDays(filteredEvents, normalizedRange)
  const metricsData = buildMetricSeriesFromEvents(filteredEvents, dayKeys)

  const chartMetricsData: Record<string, { date: string; value: number }[]> =
    params.granularity === 'day'
      ? metricsData
      : Object.fromEntries(
          Object.entries(metricsData).map(([metricId, series]) => [
            metricId,
            bucketMetricSeries(series, params.granularity),
          ])
        )

  const lineCards = DASHBOARD_METRIC_IDS.map((id) => ({
    metric: METRICS[id],
    data: (chartMetricsData[id] ?? []).slice(-42),
  }))

  const overlapMetricIds = DASHBOARD_METRIC_IDS.filter((metricId) =>
    filteredEvents.some((event) => event.metric === metricId)
  )

  const overlapData = buildOverlapAnalyticsModel(
    metricsData,
    overlapMetricIds as string[],
    params.granularity
  )

  return {
    filteredEvents,
    metricsData,
    chartMetricsData,
    lineCards,
    overlapData,
  }
}

export { buildOverlapSeriesColorMap }
