'use client'

import { useMemo, useState } from 'react'

import { ProductSituationConsultationChart } from '@/components/product-situation/product-situation-consultation-chart'
import { ProductSituationExecutiveDrivers } from '@/components/product-situation/product-situation-executive-drivers'
import { ProductSituationExecutiveHeroChart } from '@/components/product-situation/product-situation-executive-hero-chart'
import { ProductSituationExecutiveRiskTable } from '@/components/product-situation/product-situation-executive-risk-table'
import { ProductSituationExecutiveSummary } from '@/components/product-situation/product-situation-executive-summary'
import {
  ProductSituationToolbar,
  type ProductSituationExecutiveGranularity,
} from '@/components/product-situation/product-situation-toolbar'
import { generateEventStream, type EventRecord } from '@/lib/metrics-data'
import {
  buildProductSituationAnalytics,
  type ProductSituationFilters,
  type ProductSituationMode,
} from '@/lib/product-situation-analytics'
import { ProductSituationZoneMap } from '@/components/product-situation/product-situation-zone-map'

const DEFAULT_FILTERS: ProductSituationFilters = {
  sector: 'РБ',
  productGroup: 'all',
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

function normalizeDateRange(range: ProductSituationFilters['dateRange']) {
  if (range.from && !range.to) {
    return {
      from: range.from,
      to: range.from,
    }
  }

  return range
}

function isDateInRange(date: string, from?: Date, to?: Date) {
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

export default function ProductSituationPage() {
  const [filters, setFilters] = useState<ProductSituationFilters>(() => DEFAULT_FILTERS)
  const [granularity, setGranularity] =
    useState<ProductSituationExecutiveGranularity>(() => 'month')
  const [mode, setMode] = useState<ProductSituationMode>(() => 'combo')

  const events = useMemo(
    () => generateEventStream(42000, 180, 42, filters.sector),
    [filters.sector]
  )

  const filteredEvents = useMemo(() => {
    const range = normalizeDateRange(filters.dateRange)
    const result: EventRecord[] = []

    for (const event of events) {
      if (event.channel !== 'Колл-центр') {
        continue
      }

      if (filters.productGroup !== 'all' && event.productGroup !== filters.productGroup) {
        continue
      }

      if (!isDateInRange(event.date, range.from, range.to)) {
        continue
      }

      result.push(event)
    }

    return result
  }, [events, filters.dateRange, filters.productGroup])

  const analytics = useMemo(
    () =>
      buildProductSituationAnalytics(filteredEvents, {
        granularity,
        topDomainsLimit: 8,
        zones: {
          greenMax: 10,
          yellowMax: 30,
          max: 100,
        },
      }),
    [filteredEvents, granularity]
  )

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setGranularity('month')
    setMode('combo')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-display text-xl tracking-tight">Ситуация продукта</h1>
        <p className="text-sm text-muted-foreground">
          Понятный срез жизнеспособности продукта по обращениям колл-центра.
        </p>
      </div>

      <ProductSituationToolbar
        filters={filters}
        granularity={granularity}
        mode={mode}
        onFiltersChange={setFilters}
        onGranularityChange={setGranularity}
        onModeChange={setMode}
        onReset={handleReset}
      />

      <ProductSituationExecutiveHeroChart
        buckets={analytics.buckets}
        granularity={granularity}
        mode={mode}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ProductSituationExecutiveSummary summary={analytics.summary} />
        <ProductSituationExecutiveDrivers drivers={analytics.drivers} />
      </div>

      <ProductSituationConsultationChart
        buckets={analytics.buckets}
        granularity={granularity}
      />

      <ProductSituationZoneMap
        domains={analytics.domains}
        topDomains={analytics.topDomains}
      />

      {filters.productGroup === 'all' ? (
        <ProductSituationExecutiveRiskTable items={analytics.topDomains.slice(0, 5)} />
      ) : null}
    </div>
  )
}
