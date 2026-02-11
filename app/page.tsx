'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { AlertTriangle, Layers3, ShieldAlert } from 'lucide-react'

import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  DashboardToolbar,
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import { DashboardOverlapCard } from '@/components/dashboard-overlap-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  METRICS,
  generateEventStream,
  generateMetricsDataFromEvents,
  generateOverlapAnalytics,
  type EventRecord,
  type OverlapDimension,
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
  const [overlapDimension, setOverlapDimension] = useState<OverlapDimension>(
    () => 'domain'
  )
  const [overlapSelection, setOverlapSelection] = useState<string | undefined>(
    () => undefined
  )

  const events = useMemo(
    () => generateEventStream(42000, 180, 42, filters.sector),
    [filters.sector]
  )

  const filteredEvents = useMemo(() => {
    const selectedChannel = filters.channel
    const selectedProcess = filters.process
    const selectedGroup = filters.productGroup
    const selectedSubProduct = filters.subProduct
    const { from, to } = filters.dateRange
    const selectedOverlap = overlapSelection
    const result: EventRecord[] = []

    for (const event of events) {
      if (!isDateInRange(event.date, from, to)) {
        continue
      }

      if (selectedChannel !== 'all' && event.channel !== selectedChannel) {
        continue
      }

      if (selectedProcess !== 'all' && event.process !== selectedProcess) {
        continue
      }

      if (selectedGroup !== 'all' && event.productGroup !== selectedGroup) {
        continue
      }

      if (selectedSubProduct !== 'all' && event.subProduct !== selectedSubProduct) {
        continue
      }

      if (selectedOverlap) {
        if (overlapDimension === 'domain' && event.productGroup !== selectedOverlap) {
          continue
        }

        if (overlapDimension === 'indicator' && event.process !== selectedOverlap) {
          continue
        }
      }

      result.push(event)
    }

    return result
  }, [
    events,
    filters.channel,
    filters.dateRange,
    filters.process,
    filters.productGroup,
    filters.subProduct,
    overlapDimension,
    overlapSelection,
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

  const overlapData = useMemo(
    () =>
      generateOverlapAnalytics(filteredEvents, {
        dimension: overlapDimension,
        granularity: 'week',
        topN: 8,
      }),
    [filteredEvents, overlapDimension]
  )

  const summary = useMemo(() => {
    let escalated = 0
    let anomalies = 0
    let breaches = 0

    for (const event of filteredEvents) {
      if (event.status === 'escalated') {
        escalated += 1
      }

      if (event.anomaly) {
        anomalies += 1
      }

      if (event.slaBreach) {
        breaches += 1
      }
    }

    return {
      total: filteredEvents.length,
      escalated,
      anomalies,
      breaches,
    }
  }, [filteredEvents])

  const handleReset = () => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
    setOverlapDimension('domain')
    setOverlapSelection(undefined)
  }

  const handleDimensionChange = (dimension: OverlapDimension) => {
    setOverlapDimension(dimension)
    setOverlapSelection(undefined)
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-3 md:px-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="font-display text-xl tracking-tight">Bereke BI</h1>
            <Badge variant="secondary" className="text-[11px]">
              {filters.sector}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="hidden text-[11px] md:inline-flex">
              <Layers3 className="mr-1 h-3 w-3" />
              {summary.total}
            </Badge>
            <Badge variant="outline" className="hidden text-[11px] md:inline-flex">
              <ShieldAlert className="mr-1 h-3 w-3 text-destructive" />
              {summary.escalated}
            </Badge>
            <Badge variant="outline" className="hidden text-[11px] lg:inline-flex">
              <AlertTriangle className="mr-1 h-3 w-3 text-chart-5" />
              {summary.breaches}
            </Badge>
            <Link href="/showcase">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                Showcase
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100dvh-56px)] w-full max-w-[1600px] min-h-0 flex-col gap-3 px-3 py-3 md:px-4">
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
            dimension={overlapDimension}
            activeLabel={overlapSelection}
            onDimensionChange={handleDimensionChange}
            onSelect={setOverlapSelection}
            onClearSelection={() => setOverlapSelection(undefined)}
          />
        </section>
      </main>
    </div>
  )
}
