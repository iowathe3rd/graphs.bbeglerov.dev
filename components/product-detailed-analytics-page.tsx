'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { DashboardMobileFilterSheet } from '@/components/dashboard-mobile-filter-sheet'
import { DashboardMobileFilterSummary } from '@/components/dashboard-mobile-filter-summary'
import { DashboardMobileKpiCarousel } from '@/components/dashboard-mobile-kpi-carousel'
import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  DashboardToolbar,
  DEFAULT_DASHBOARD_FILTERS,
  FIXED_CHANNEL,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import { DashboardOverlapCard } from '@/components/dashboard-overlap-card'
import { DashboardOverlapDetailsSheet } from '@/components/dashboard-overlap-details-sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { filterTaxonomyByProduct } from '@/lib/taxonomy-mapping'
import {
  METRICS,
  PRODUCT_GROUPS,
  SECTORS,
  buildOverlapAnalyticsFromMetricSeries,
  generateEventStream,
  generateMetricsDataFromEvents,
  type EventRecord,
  type OverlapGranularity,
} from '@/lib/metrics-data'

const DASHBOARD_METRIC_IDS = ['sla', 'aht', 'queueLoad', 'abandonment'] as const
const GRANULARITY_VALUES: readonly OverlapGranularity[] = ['day', 'week', 'month']
const DASHBOARD_PREFERENCES_STORAGE_KEY = 'insight-service:dashboard:v1'

interface PersistedDashboardPreferences {
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

function isDateInRange(date: string, from?: Date, to?: Date) {
  const current = new Date(`${date}T00:00:00.000Z`)

  if (from && current < from) {
    return false
  }

  if (to && current > to) {
    return false
  }

  return true
}

function normalizeDateRange(range: DashboardFilters['dateRange']) {
  if (range.from && !range.to) {
    return { from: range.from, to: range.from }
  }

  return range
}

function getRangeDays(from?: Date, to?: Date) {
  if (!from || !to) {
    return 180
  }

  const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  const diff = Math.max(0, Math.round((toUtc - fromUtc) / 86400000))

  return diff + 1
}

function toDateKey(date?: Date) {
  if (!date) {
    return undefined
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateKey(value?: string) {
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

function parseDashboardPreferences(raw: string | null) {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedDashboardPreferences
    const sector = SECTORS.includes(parsed?.filters?.sector as (typeof SECTORS)[number])
      ? (parsed.filters.sector as DashboardFilters['sector'])
      : DEFAULT_DASHBOARD_FILTERS.sector
    const productGroup = PRODUCT_GROUPS.includes(
      parsed?.filters?.productGroup as (typeof PRODUCT_GROUPS)[number]
    )
      ? (parsed.filters.productGroup as DashboardFilters['productGroup'])
      : DEFAULT_DASHBOARD_FILTERS.productGroup
    const granularity = GRANULARITY_VALUES.includes(parsed?.granularity)
      ? parsed.granularity
      : 'day'

    return {
      filters: {
        sector,
        channel: FIXED_CHANNEL,
        productGroup,
        dateRange: {
          from: parseDateKey(parsed?.filters?.dateRange?.from),
          to: parseDateKey(parsed?.filters?.dateRange?.to),
        },
      } satisfies DashboardFilters,
      granularity,
    }
  } catch {
    return null
  }
}

function parseDashboardQueryParams(searchParams: URLSearchParams | null) {
  if (!searchParams) {
    return null
  }

  const sectorRaw = searchParams.get('sector')
  const productGroupRaw = searchParams.get('productGroup')
  const fromRaw = searchParams.get('from') ?? undefined
  const toRaw = searchParams.get('to') ?? undefined
  const granularityRaw = searchParams.get('granularity')

  const sector = SECTORS.includes(sectorRaw as (typeof SECTORS)[number])
    ? (sectorRaw as DashboardFilters['sector'])
    : null
  const productGroup = PRODUCT_GROUPS.includes(
    productGroupRaw as (typeof PRODUCT_GROUPS)[number]
  )
    ? (productGroupRaw as DashboardFilters['productGroup'])
    : null
  const granularity = GRANULARITY_VALUES.includes(granularityRaw as OverlapGranularity)
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

function serializeDashboardPreferences(
  filters: DashboardFilters,
  granularity: OverlapGranularity
) {
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

function countActiveMobileFilters(
  filters: DashboardFilters,
  granularity: OverlapGranularity
) {
  let count = 0

  if (filters.sector !== DEFAULT_DASHBOARD_FILTERS.sector) {
    count += 1
  }

  if (filters.productGroup !== DEFAULT_DASHBOARD_FILTERS.productGroup) {
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

function startOfWeekKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  const day = (date.getUTCDay() + 6) % 7

  date.setUTCDate(date.getUTCDate() - day)

  return date.toISOString().slice(0, 10)
}

function startOfMonthKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  date.setUTCDate(1)

  return date.toISOString().slice(0, 10)
}

function toBucketDateKey(dateKey: string, granularity: OverlapGranularity) {
  if (granularity === 'week') {
    return startOfWeekKey(dateKey)
  }

  if (granularity === 'month') {
    return startOfMonthKey(dateKey)
  }

  return dateKey
}

function bucketMetricSeries(
  series: Array<{ date: string; value: number }>,
  granularity: OverlapGranularity
) {
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

export function ProductDetailedAnalyticsPage() {
  const [filters, setFilters] = useState<DashboardFilters>(
    () => DEFAULT_DASHBOARD_FILTERS
  )
  const [overlapGranularity, setOverlapGranularity] = useState<OverlapGranularity>(
    () => 'day'
  )
  const [overlapSelection, setOverlapSelection] = useState<string[]>(() => [])
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false)
  const [isMobileDetailsSheetOpen, setIsMobileDetailsSheetOpen] = useState(false)
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false)

  useEffect(() => {
    const restored = parseDashboardPreferences(
      window.localStorage.getItem(DASHBOARD_PREFERENCES_STORAGE_KEY)
    )
    const queryOverrides = parseDashboardQueryParams(
      new URLSearchParams(window.location.search)
    )

    const baseFilters = restored?.filters ?? DEFAULT_DASHBOARD_FILTERS
    const baseGranularity = restored?.granularity ?? 'day'
    const nextFilters: DashboardFilters = {
      sector: queryOverrides?.sector ?? baseFilters.sector,
      channel: FIXED_CHANNEL,
      productGroup: queryOverrides?.productGroup ?? baseFilters.productGroup,
      dateRange: queryOverrides?.dateRange ?? baseFilters.dateRange,
    }
    const nextGranularity = queryOverrides?.granularity ?? baseGranularity

    setFilters(nextFilters)
    setOverlapGranularity(nextGranularity)

    setIsPreferencesLoaded(true)
  }, [])

  useEffect(() => {
    if (!isPreferencesLoaded) {
      return
    }

    window.localStorage.setItem(
      DASHBOARD_PREFERENCES_STORAGE_KEY,
      serializeDashboardPreferences(filters, overlapGranularity)
    )
  }, [filters, overlapGranularity, isPreferencesLoaded])

  const events = useMemo(
    () => generateEventStream(42000, 180, 42, filters.sector),
    [filters.sector]
  )

  const filteredEvents = useMemo(() => {
    const selectedChannel = filters.channel
    const selectedGroup = filters.productGroup
    const normalizedRange = normalizeDateRange(filters.dateRange)
    const { from, to } = normalizedRange
    const result: EventRecord[] = []
    const allowedTagNodes = filterTaxonomyByProduct(
      selectedGroup,
      Array.from(new Set(events.map((event) => event.tag))).map((tag) => ({
        id: tag,
        label: tag,
      }))
    )
    const allowedTags = new Set(allowedTagNodes.map((node) => node.id))

    for (const event of events) {
      if (!isDateInRange(event.date, from, to)) {
        continue
      }

      if (event.channel !== selectedChannel) {
        continue
      }

      if (event.productGroup !== selectedGroup) {
        continue
      }

      if (allowedTags.size > 0 && !allowedTags.has(event.tag)) {
        continue
      }

      result.push(event)
    }

    return result
  }, [events, filters.channel, filters.dateRange, filters.productGroup])

  const normalizedRange = useMemo(
    () => normalizeDateRange(filters.dateRange),
    [filters.dateRange]
  )

  const rangeDays = useMemo(
    () => getRangeDays(normalizedRange.from, normalizedRange.to),
    [normalizedRange]
  )

  const rawMetricsData = useMemo(
    () => generateMetricsDataFromEvents(filteredEvents, Math.max(180, rangeDays)),
    [filteredEvents, rangeDays]
  )

  const metricsData = useMemo(() => {
    if (!normalizedRange.from && !normalizedRange.to) {
      return rawMetricsData
    }

    const result: Record<string, { date: string; value: number }[]> = {}

    for (const [metricId, series] of Object.entries(rawMetricsData)) {
      result[metricId] = series.filter((point) =>
        isDateInRange(point.date, normalizedRange.from, normalizedRange.to)
      )
    }

    return result
  }, [rawMetricsData, normalizedRange])

  const chartMetricsData = useMemo(() => {
    if (overlapGranularity === 'day') {
      return metricsData
    }

    const result: Record<string, Array<{ date: string; value: number }>> = {}

    for (const [metricId, series] of Object.entries(metricsData)) {
      result[metricId] = bucketMetricSeries(series, overlapGranularity)
    }

    return result
  }, [metricsData, overlapGranularity])

  const lineCards = useMemo(
    () =>
      DASHBOARD_METRIC_IDS.map((id) => ({
        metric: METRICS[id],
        data: (chartMetricsData[id] ?? []).slice(-42),
      })),
    [chartMetricsData]
  )

  const overlapMetricIds = useMemo(() => {
    const presentMetricIds = new Set(filteredEvents.map((event) => event.metric))
    return DASHBOARD_METRIC_IDS.filter((metricId) => presentMetricIds.has(metricId))
  }, [filteredEvents])

  const overlapData = useMemo(
    () =>
      buildOverlapAnalyticsFromMetricSeries({
        metricSeries: metricsData,
        metricIds: overlapMetricIds as string[],
        metricsMap: METRICS,
        granularity: overlapGranularity,
      }),
    [metricsData, overlapMetricIds, overlapGranularity]
  )

  const overlapSeriesColorMap = useMemo(
    () =>
      Object.fromEntries(
        DASHBOARD_METRIC_IDS.map((metricId) => [METRICS[metricId].name, METRICS[metricId].color])
      ),
    []
  )
  const mobileActiveFiltersCount = useMemo(
    () => countActiveMobileFilters(filters, overlapGranularity),
    [filters, overlapGranularity]
  )

  const handleReset = () => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
    setOverlapGranularity('day')
    setOverlapSelection([])
  }

  const handleMobileApply = (
    nextFilters: DashboardFilters,
    nextGranularity: OverlapGranularity
  ) => {
    setFilters(nextFilters)
    setOverlapGranularity(nextGranularity)
    setOverlapSelection([])
    setIsMobileFilterSheetOpen(false)
  }

  const handleMobileResetAndApply = () => {
    handleReset()
    setIsMobileFilterSheetOpen(false)
  }

  return (
    <div className="min-h-dvh bg-background md:h-[100dvh] md:overflow-hidden">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="font-display text-[20px] font-semibold tracking-tight">
              Insight Service
            </h1>
            <Badge variant="secondary" className="text-[11px]">
              Детальная аналитика по продукту
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-4 md:h-[calc(100dvh-64px)] md:min-h-0 md:px-6">
        <div className="md:hidden">
          <DashboardMobileFilterSummary
            filters={filters}
            granularity={overlapGranularity}
            activeCount={mobileActiveFiltersCount}
            onOpenFilters={() => setIsMobileFilterSheetOpen(true)}
          />
        </div>

        <DashboardMobileFilterSheet
          open={isMobileFilterSheetOpen}
          onOpenChange={setIsMobileFilterSheetOpen}
          initialFilters={filters}
          initialGranularity={overlapGranularity}
          onApply={handleMobileApply}
          onResetAndApply={handleMobileResetAndApply}
        />

        <DashboardOverlapDetailsSheet
          open={isMobileDetailsSheetOpen}
          onOpenChange={setIsMobileDetailsSheetOpen}
          data={overlapData}
          granularity={overlapGranularity}
          selectedSeries={overlapSelection}
          onSelectedSeriesChange={setOverlapSelection}
          seriesColorMap={overlapSeriesColorMap}
          zones={{ greenMax: 20, yellowMax: 40, max: 100 }}
        />

        <div className="hidden md:block">
          <DashboardToolbar
            filters={filters}
            granularity={overlapGranularity}
            onFiltersChange={setFilters}
            onGranularityChange={setOverlapGranularity}
            onReset={handleReset}
          />
        </div>

        <section className="space-y-3 md:hidden">
          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Температурная карта
            </h2>
            <div className="h-[420px]">
              <DashboardOverlapCard
                data={overlapData}
                granularity={overlapGranularity}
                selectedSeries={overlapSelection}
                onSelectedSeriesChange={setOverlapSelection}
                seriesColorMap={overlapSeriesColorMap}
                zones={{ greenMax: 20, yellowMax: 40, max: 100 }}
              />
            </div>
            <div className="px-1">
              <Button
                variant="outline"
                className="h-9 w-full text-xs"
                onClick={() => setIsMobileDetailsSheetOpen(true)}
              >
                Показать детали
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Индикаторы
            </h2>
            <DashboardMobileKpiCarousel items={lineCards} />
          </div>
        </section>

        <section className="hidden md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-2">
          <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
            Индикаторы
          </h2>

          <div className="grid md:min-h-0 md:flex-1 md:gap-3 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2">
              {lineCards.map(({ metric, data }) => (
                <DashboardLineCard key={metric.id} metric={metric} data={data} />
              ))}
            </div>

            <DashboardOverlapCard
              data={overlapData}
              granularity={overlapGranularity}
              selectedSeries={overlapSelection}
              onSelectedSeriesChange={setOverlapSelection}
              seriesColorMap={overlapSeriesColorMap}
              zones={{ greenMax: 20, yellowMax: 40, max: 100 }}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
