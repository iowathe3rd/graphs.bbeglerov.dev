'use client'

import Image from 'next/image'

import { DashboardMobileFilterSheet } from '@/components/dashboard-mobile-filter-sheet'
import { DashboardMobileFilterSummary } from '@/components/dashboard-mobile-filter-summary'
import { DashboardMobileKpiCarousel } from '@/components/dashboard-mobile-kpi-carousel'
import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  DashboardToolbar,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import { DashboardOverlapCard } from '@/components/dashboard-overlap-card'
import { DashboardOverlapDetailsSheet } from '@/components/dashboard-overlap-details-sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProductDetailedModel } from '@/features/insight-dashboard/hooks/use-product-detailed-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { OverlapGranularity } from '@/lib/metrics-data'

export function ProductDetailedAnalyticsView() {
  const {
    filters,
    setFilters,
    overlapGranularity,
    setOverlapGranularity,
    overlapSelection,
    setOverlapSelection,
    isMobileFilterSheetOpen,
    setIsMobileFilterSheetOpen,
    isMobileDetailsSheetOpen,
    setIsMobileDetailsSheetOpen,
    lineCards,
    overlapData,
    overlapSeriesColorMap,
    mobileActiveFiltersCount,
    resetFilters,
    applyMobileFilters,
    resetMobileFilters,
    loading,
    error,
  } = useProductDetailedModel()

  const handleMobileApply = (
    nextFilters: DashboardFilters,
    nextGranularity: OverlapGranularity
  ) => {
    applyMobileFilters(nextFilters, nextGranularity)
  }

  const handleFiltersChange = (nextFilters: DashboardFilters) => {
    setFilters(nextFilters)
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
          onApply={handleMobileApply}
          onResetAndApply={resetMobileFilters}
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
            filters={filters as DashboardFilters}
            granularity={overlapGranularity}
            onFiltersChange={handleFiltersChange}
            onGranularityChange={setOverlapGranularity}
            onReset={resetFilters}
          />
        </div>

        <section className="space-y-3 md:hidden">
          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Температурная карта
            </h2>
            {loading ? (
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
                Загрузка звонков…
              </div>
            ) : (
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
            )}
            <div className="px-1">
              <Button
                variant="outline"
                className="h-9 w-full text-xs"
                onClick={() => setIsMobileDetailsSheetOpen(true)}
                disabled={loading}
              >
                Показать детали
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
              Индикаторы
            </h2>
            {loading ? (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
                Загрузка звонков…
              </div>
            ) : (
              <DashboardMobileKpiCarousel items={lineCards} />
            )}
          </div>
        </section>

        <section className="hidden md:flex md:min-h-0 md:flex-1 md:flex-col md:gap-2">
          <h2 className="px-1 text-[13px] font-medium text-muted-foreground">
            Индикаторы
          </h2>
          {loading ? (
            <div className="flex md:min-h-0 md:flex-1 items-center justify-center rounded-xl border border-border/80 bg-card text-xs text-muted-foreground">
              Загрузка звонков…
            </div>
          ) : (
            <div className="grid md:min-h-0 md:flex-1 md:gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr]">
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
          )}
        </section>
      </main>
    </div>
  )
}
