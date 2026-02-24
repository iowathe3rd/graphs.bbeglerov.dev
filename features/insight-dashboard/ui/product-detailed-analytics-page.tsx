'use client'

import Image from 'next/image'
import Link from 'next/link'

import { DashboardMobileFilterSheet } from '@/components/dashboard-mobile-filter-sheet'
import { DashboardMobileFilterSummary } from '@/components/dashboard-mobile-filter-summary'
import { DashboardMobileKpiCarousel } from '@/components/dashboard-mobile-kpi-carousel'
import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  DashboardToolbar,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { CallCoverageChartCard } from '@/features/insight-dashboard/ui/call-coverage-chart-card'
import { IndicatorCombinedCard } from '@/features/insight-dashboard/ui/indicator-combined-card'
import { MobileCombinedIndicatorCarousel } from '@/features/insight-dashboard/ui/mobile-combined-indicator-carousel'
import { ProductSituationBubbleMatrix } from '@/features/insight-dashboard/ui/product-situation-bubble-matrix'
import { useProductDetailedModel } from '@/features/insight-dashboard/hooks/use-product-detailed-model'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { InsightEvent } from '@/features/insight-dashboard/domain/types'
import type { OverlapGranularity } from '@/lib/metrics-data'

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
    overlapGranularity,
    setOverlapGranularity,
    indicatorChartMode,
    setIndicatorChartMode,
    indicatorLineValueMode,
    setIndicatorLineValueMode,
    isMobileFilterSheetOpen,
    setIsMobileFilterSheetOpen,
    lineCards,
    combinedIndicatorSeriesByMetric,
    detailedBubblePoints,
    detailedBubbleScoreThresholds,
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
    nextGranularity: OverlapGranularity
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

  const handleIndicatorChartModeChange = (value: string) => {
    if (value === 'kpi' || value === 'combined') {
      setIndicatorChartMode(value)
      return
    }

    if (!value) {
      setIndicatorChartMode('kpi')
    }
  }

  const handleIndicatorLineValueModeChange = (value: string) => {
    if (value === 'percent' || value === 'absolute') {
      setIndicatorLineValueMode(value)
      return
    }

    if (!value) {
      setIndicatorLineValueMode('percent')
    }
  }

  return (
    <div className="min-h-dvh bg-background md:h-[100dvh] md:overflow-hidden">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <h1 className="font-display text-[20px] font-semibold tracking-tight">
                Insight Service
              </h1>
            </Link>
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
        {error ? (
          <p className="px-1 text-xs text-red-600">{error}</p>
        ) : null}

        <div className="md:hidden">
          <DashboardMobileFilterSummary
            filters={filters as DashboardFilters}
            granularity={overlapGranularity}
            activeCount={mobileActiveFiltersCount}
            onOpenFilters={() => setIsMobileFilterSheetOpen(true)}
          />
        </div>

        <DashboardMobileFilterSheet
          open={isMobileFilterSheetOpen}
          onOpenChange={setIsMobileFilterSheetOpen}
          initialFilters={filters as DashboardFilters}
          initialGranularity={overlapGranularity}
          sectorOptions={sectorOptions}
          productOptions={productOptions}
          channelLabel={filters.channel}
          onApply={handleMobileApply}
          onResetAndApply={resetMobileFilters}
        />

        <div className="hidden md:block">
          <DashboardToolbar
            filters={filters as DashboardFilters}
            granularity={overlapGranularity}
            sectorOptions={sectorOptions}
            productOptions={productOptions}
            onFiltersChange={handleFiltersChange}
            onGranularityChange={setOverlapGranularity}
            onReset={resetFilters}
          />
        </div>

        <section className="space-y-3 md:hidden">
          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Состояние выбранного продукта
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
                />
              </div>
            )}

            <div className="h-[280px]">
              <CallCoverageChartCard data={callCoverageSeries} loading={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1">
              <h2 className="text-[13px] font-medium text-muted-foreground">Индикаторы</h2>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={indicatorChartMode}
                  onValueChange={handleIndicatorChartModeChange}
                  className="justify-start gap-1"
                >
                  <ToggleGroupItem
                    value="kpi"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    Индикаторы
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="combined"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    Комбинированные
                  </ToggleGroupItem>
                </ToggleGroup>

                {indicatorChartMode === 'combined' ? (
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
                ) : null}
              </div>
            </div>
            {loading ? (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
                Загрузка звонков…
              </div>
            ) : (
              <>
                {indicatorChartMode === 'kpi' ? (
                  <DashboardMobileKpiCarousel items={lineCards} />
                ) : (
                  <MobileCombinedIndicatorCarousel
                    items={combinedIndicatorItems}
                    lineValueMode={indicatorLineValueMode}
                  />
                )}
              </>
            )}
          </div>
        </section>

        <section className="hidden md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-2">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <h2 className="text-[13px] font-medium text-muted-foreground">Индикаторы</h2>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={indicatorChartMode}
                onValueChange={handleIndicatorChartModeChange}
                className="justify-start gap-1"
              >
                <ToggleGroupItem
                  value="kpi"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Индикаторы
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="combined"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Комбинированные
                </ToggleGroupItem>
              </ToggleGroup>

              {indicatorChartMode === 'combined' ? (
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
              ) : null}
            </div>
          </div>
          {loading ? (
            <div className="flex md:min-h-0 md:flex-1 items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
              Загрузка звонков…
            </div>
          ) : (
            <div className="grid h-full min-h-0 flex-1 grid-cols-[1.2fr_1.2fr_1fr_1fr] grid-rows-2 gap-3">
              {lineCards.slice(0, 4).map(({ metric, data }, index) => (
                <div
                  key={metric.id}
                  className={indicatorGridPositions[index] ?? ''}
                >
                  {indicatorChartMode === 'kpi' ? (
                    <DashboardLineCard metric={metric} data={data} />
                  ) : (
                    <IndicatorCombinedCard
                      metric={metric}
                      data={combinedIndicatorSeriesByMetric[metric.id] ?? []}
                      lineValueMode={indicatorLineValueMode}
                    />
                  )}
                </div>
              ))}

              <div className="col-start-3 row-start-1 col-span-2 min-h-0">
                <ProductSituationBubbleMatrix
                  points={detailedBubblePoints}
                  scoreThresholds={detailedBubbleScoreThresholds}
                  productOrder={[filters.productGroup]}
                  presentation="focused"
                  chartHeightClassName="h-full min-h-0"
                />
              </div>

              <div className="col-start-3 row-start-2 col-span-2 min-h-0">
                <CallCoverageChartCard
                  data={callCoverageSeries}
                  loading={loading}
                  compact
                  className="h-full"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
