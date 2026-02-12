'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  DashboardToolbar,
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import { DashboardOverlapCard } from '@/components/dashboard-overlap-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { filterTaxonomyByProduct } from '@/lib/taxonomy-mapping'
import {
  METRICS,
  buildOverlapAnalyticsFromMetricSeries,
  generateEventStream,
  generateMetricsDataFromEvents,
  type EventRecord,
  type OverlapGranularity,
} from '@/lib/metrics-data'

const DASHBOARD_METRIC_IDS = ['sla', 'aht', 'queueLoad', 'abandonment'] as const

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

export default function Page() {
  const [filters, setFilters] = useState<DashboardFilters>(
    () => DEFAULT_DASHBOARD_FILTERS
  )
  const [overlapGranularity, setOverlapGranularity] = useState<OverlapGranularity>(
    () => 'week'
  )
  const [overlapSelection, setOverlapSelection] = useState<string[]>(() => [])

  const events = useMemo(
    () => generateEventStream(42000, 180, 42, filters.sector),
    [filters.sector]
  )

  const filteredEvents = useMemo(() => {
    const selectedChannel = filters.channel
    const selectedGroup = filters.productGroup
    const selectedTag = filters.tag
    const { from, to } = filters.dateRange
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

      if (selectedTag !== 'all' && event.tag !== selectedTag) {
        continue
      }

      result.push(event)
    }

    return result
  }, [
    events,
    filters.channel,
    filters.dateRange,
    filters.productGroup,
    filters.tag,
  ])

  const metricsData = useMemo(
    () => generateMetricsDataFromEvents(filteredEvents, 90),
    [filteredEvents]
  )

  const lineCards = useMemo(
    () =>
      DASHBOARD_METRIC_IDS.map((id) => ({
        metric: METRICS[id],
        data: (metricsData[id] ?? []).slice(-42),
      })),
    [metricsData]
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

  const handleReset = () => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
    setOverlapGranularity('week')
    setOverlapSelection([])
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="font-display text-[20px] font-semibold tracking-tight">
              Insight Service
            </h1>
            <Badge variant="secondary" className="text-[11px]">
              {filters.sector}
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100dvh-64px)] w-full max-w-[1600px] min-h-0 flex-col gap-3 px-4 py-4 md:px-6">
        <DashboardToolbar
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleReset}
        />

        <section className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2">
            {lineCards.map(({ metric, data }) => (
              <DashboardLineCard key={metric.id} metric={metric} data={data} />
            ))}
          </div>

          <DashboardOverlapCard
            data={overlapData}
            granularity={overlapGranularity}
            selectedSeries={overlapSelection}
            onGranularityChange={setOverlapGranularity}
            onSelectedSeriesChange={setOverlapSelection}
            seriesColorMap={overlapSeriesColorMap}
            zones={{ greenMax: 20, yellowMax: 40, max: 100 }}
          />
        </section>
      </main>
    </div>
  )
}
