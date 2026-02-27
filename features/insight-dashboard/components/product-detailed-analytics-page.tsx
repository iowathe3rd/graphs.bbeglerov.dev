'use client'

import Image from 'next/image'
import Link from 'next/link'

import { DashboardMobileFilterSheet } from '@/features/insight-dashboard/components/filters/dashboard-mobile-filter-sheet'
import { DashboardMobileFilterSummary } from '@/features/insight-dashboard/components/filters/dashboard-mobile-filter-summary'
import {
  DashboardToolbar,
  type DetailedGranularity,
  type DashboardFilters,
} from '@/features/insight-dashboard/components/filters/dashboard-toolbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { CallCoverageChartCard } from '@/features/insight-dashboard/components/call-coverage-chart-card'
import { IndicatorCombinedCard } from '@/features/insight-dashboard/components/indicator-combined-card'
import { MobileCombinedIndicatorCarousel } from '@/features/insight-dashboard/components/mobile-combined-indicator-carousel'
import { ProductSituationBubbleMatrix } from '@/features/insight-dashboard/components/product-situation-bubble-matrix'
import { useProductDetailedModel } from '@/features/insight-dashboard/logic/hooks/use-product-detailed-model'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { InsightEvent } from '@/features/insight-dashboard/logic/types'
import { cn } from '@/lib/utils'

interface ProductDetailedAnalyticsViewProps {
  events?: InsightEvent[]
  loading?: boolean
  error?: string | null
  query?: URLSearchParams | null
  channel?: string
  sectorOptions?: string[]
  productOptions?: string[]
}

export function ProductDetailedAnalyticsView(props: ProductDetailedAnalyticsViewProps = {}) {
  const indicatorGridPositions = [
    'col-start-1 row-start-1',
    'col-start-2 row-start-1',
    'col-start-1 row-start-2',
    'col-start-2 row-start-2',
  ] as const

  const {
    filters,
    setFilters,
    granularity,
    setGranularity,
    indicatorLineValueMode,
    setIndicatorLineValueMode,
    isMobileFilterSheetOpen,
    setIsMobileFilterSheetOpen,
    lineCards,
    combinedIndicatorSeriesByMetric,
    detailedBubblePoints,
    detailedBubbleScoreThresholds,
    detailedBubbleCurrentZone,
    callCoverageSeries,
    sectorOptions,
    productOptions,
    mobileActiveFiltersCount,
    resetFilters,
    applyMobileFilters,
    resetMobileFilters,
    loading,
    error,
  } = useProductDetailedModel({
    events: props.events,
    loading: props.loading,
    error: props.error,
    query: props.query,
    channel: props.channel,
    sectorOptions: props.sectorOptions,
    productOptions: props.productOptions,
  })

  const handleMobileApply = (
    nextFilters: DashboardFilters,
    nextGranularity: DetailedGranularity
  ) => {
    applyMobileFilters(nextFilters, nextGranularity)
  }

  const handleFiltersChange = (nextFilters: DashboardFilters) => {
    setFilters(nextFilters)
  }

  const combinedIndicatorItems = lineCards.slice(0, 4).map(({ metric }) => ({
    metric,
    data: combinedIndicatorSeriesByMetric[metric.id] ?? [],
  }))

  const handleIndicatorLineValueModeChange = (value: string) => {
    if (value === 'percent' || value === 'absolute') {
      setIndicatorLineValueMode(value)
      return
    }

    if (!value) {
      setIndicatorLineValueMode('percent')
    }
  }

  const zoneText =
    detailedBubbleCurrentZone === 'green'
      ? 'Зеленая'
      : detailedBubbleCurrentZone === 'yellow'
        ? 'Желтая'
        : detailedBubbleCurrentZone === 'red'
          ? 'Красная'
          : null
  const detailedBubbleTitle = zoneText
    ? `Состояние продукта: ${filters.productGroup} (${zoneText} зона)`
    : `Состояние продукта: ${filters.productGroup}`

  return (
    <div className="min-h-dvh bg-background md:h-[100dvh] md:overflow-hidden">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <h1 className="font-sans text-[20px] font-semibold tracking-tight">
                Insight Service
              </h1>
            </Link>
            <Badge variant="secondary" className="text-[11px]">
              Детальная аналитика по периоду
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-4 md:h-[calc(100dvh-64px)] md:min-h-0 md:px-6">
        {error ? (
          <p className="px-1 text-xs text-red-600">{error}</p>
        ) : null}

        <div className="md:hidden">
          <DashboardMobileFilterSummary
            filters={filters as DashboardFilters}
            granularity={granularity}
            activeCount={mobileActiveFiltersCount}
            onOpenFilters={() => setIsMobileFilterSheetOpen(true)}
          />
        </div>

        <DashboardMobileFilterSheet
          open={isMobileFilterSheetOpen}
          onOpenChange={setIsMobileFilterSheetOpen}
          initialFilters={filters as DashboardFilters}
          initialGranularity={granularity}
          sectorOptions={sectorOptions}
          productOptions={productOptions}
          channelLabel={filters.channel}
          onApply={handleMobileApply}
          onResetAndApply={resetMobileFilters}
        />

        <div className="hidden md:block">
          <DashboardToolbar
            filters={filters as DashboardFilters}
            granularity={granularity}
            sectorOptions={sectorOptions}
            productOptions={productOptions}
            onFiltersChange={handleFiltersChange}
            onGranularityChange={setGranularity}
            onReset={resetFilters}
          />
        </div>

        <section className="space-y-3 md:hidden">
          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Состояние продукта
            </h2>
            {loading ? (
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
                Загрузка звонков…
              </div>
            ) : (
              <div className="h-[420px]">
                <ProductSituationBubbleMatrix
                  points={detailedBubblePoints}
                  scoreThresholds={detailedBubbleScoreThresholds}
                  productOrder={[filters.productGroup]}
                  presentation="focused"
                  chartHeightClassName="h-full min-h-0"
                  title={detailedBubbleTitle}
                  xMode="periods"
                  xAxisLabel="Период"
                  periodGranularity={granularity}
                  tooltipEntityLabel={filters.productGroup}
                  showTrajectory
                  helpDialogVariant="product-dissatisfaction-score-detailed"
                />
              </div>
            )}

            <div className="h-[280px]">
              <CallCoverageChartCard
                data={callCoverageSeries}
                loading={loading}
                granularity={granularity}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1">
              <h2 className="text-[13px] font-medium text-muted-foreground">Индикаторы</h2>
              <ToggleGroup
                type="single"
                value={indicatorLineValueMode}
                onValueChange={handleIndicatorLineValueModeChange}
                className="justify-start gap-1"
              >
                <ToggleGroupItem
                  value="percent"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  %
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="absolute"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  шт
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            {loading ? (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
                Загрузка звонков…
              </div>
            ) : (
              <MobileCombinedIndicatorCarousel
                items={combinedIndicatorItems}
                lineValueMode={indicatorLineValueMode}
                granularity={granularity}
              />
            )}
          </div>
        </section>

        <section className="hidden overflow-x-clip md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-2">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <h2 className="text-[13px] font-medium text-muted-foreground">Индикаторы</h2>
            <ToggleGroup
              type="single"
              value={indicatorLineValueMode}
              onValueChange={handleIndicatorLineValueModeChange}
              className="justify-start gap-1"
            >
              <ToggleGroupItem
                value="percent"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                %
              </ToggleGroupItem>
              <ToggleGroupItem
                value="absolute"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                шт
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {loading ? (
            <div className="flex md:min-h-0 md:flex-1 items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
              Загрузка звонков…
            </div>
          ) : (
            <div className="grid h-full min-h-0 flex-1 grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] grid-rows-2 gap-3">
              {lineCards.slice(0, 4).map(({ metric }, index) => (
                <div
                  key={metric.id}
                  className={cn('min-w-0', indicatorGridPositions[index] ?? '')}
                >
                  <IndicatorCombinedCard
                    metric={metric}
                    data={combinedIndicatorSeriesByMetric[metric.id] ?? []}
                    lineValueMode={indicatorLineValueMode}
                    granularity={granularity}
                  />
                </div>
              ))}

              <div className="col-start-3 row-start-1 col-span-2 min-h-0 min-w-0">
                <ProductSituationBubbleMatrix
                  points={detailedBubblePoints}
                  scoreThresholds={detailedBubbleScoreThresholds}
                  productOrder={[filters.productGroup]}
                  presentation="focused"
                  chartHeightClassName="h-full min-h-0"
                  title={detailedBubbleTitle}
                  xMode="periods"
                  xAxisLabel="Период"
                  periodGranularity={granularity}
                  tooltipEntityLabel={filters.productGroup}
                  showTrajectory
                  helpDialogVariant="product-dissatisfaction-score-detailed"
                />
              </div>

              <div className="col-start-3 row-start-2 col-span-2 min-h-0 min-w-0">
                <CallCoverageChartCard
                  data={callCoverageSeries}
                  loading={loading}
                  compact
                  className="h-full"
                  granularity={granularity}
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
