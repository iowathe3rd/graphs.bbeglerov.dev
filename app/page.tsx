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
  const overlapDimension = 'indicator' as const
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
    const selectedProcess = filters.process
    const selectedGroup = filters.productGroup
    const selectedSubProduct = filters.subProduct
    const { from, to } = filters.dateRange
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
        granularity: overlapGranularity,
        topN: 0,
      }),
    [filteredEvents, overlapDimension, overlapGranularity]
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
              Bereke BI
            </h1>
            <Badge variant="secondary" className="text-[11px]">
              {filters.sector}
            </Badge>
            <nav className="hidden items-center gap-1 rounded-lg border border-border/70 bg-background/60 p-1 md:inline-flex">
              <span className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground">
                Дашборд
              </span>
              <Link
                href="/showcase"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
              >
                Витрина
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="hidden text-[11px] md:inline-flex">
              <Layers3 className="mr-1 h-3 w-3" />
              События {summary.total}
            </Badge>
            <Badge variant="outline" className="hidden text-[11px] md:inline-flex">
              <ShieldAlert className="mr-1 h-3 w-3 text-destructive" />
              Эскалации {summary.escalated}
            </Badge>
            <Badge variant="outline" className="hidden text-[11px] lg:inline-flex">
              <AlertTriangle className="mr-1 h-3 w-3 text-chart-5" />
              SLA риск {summary.breaches}
            </Badge>
            <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs md:hidden">
              <Link href="/showcase">Витрина</Link>
            </Button>
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
            zones={{ greenMax: 20, yellowMax: 40, max: 100 }}
          />
        </section>
      </main>
    </div>
  )
}
