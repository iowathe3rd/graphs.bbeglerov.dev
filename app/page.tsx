'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  ProductSituationBubbleMatrix,
  ProductSituationToolbar,
  type ProductBubblePoint,
  useInsightEvents,
  useProductSituationModel,
} from '@/features/insight-dashboard'
import {
  normalizeDateRange,
  toDateKey,
} from '@/features/insight-dashboard/domain/date-bucketing'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Page() {
  const router = useRouter()
  const eventsState = useInsightEvents()
  const {
    filters,
    setFilters,
    resetFilters,
    sectorOptions,
    productOptions,
    bubblePoints,
    bubbleScoreThresholds,
    loading,
    error,
  } =
    useProductSituationModel({
      events: eventsState.events,
      loading: eventsState.status === 'idle' || eventsState.status === 'loading',
      error: eventsState.error,
    })

  const handleBubbleClick = (point: ProductBubblePoint) => {
    const range = normalizeDateRange(filters.dateRange)
    const params = new URLSearchParams({
      productGroup: point.productGroup,
      sector: filters.sector,
      source: 'bubble',
    })

    const from = toDateKey(range.from)
    const to = toDateKey(range.to)

    if (from) {
      params.set('from', from)
    }

    if (to) {
      params.set('to', to)
    }

    router.push(`/product-analytics?${params.toString()}`)
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <h1 className="font-display text-[20px] font-semibold tracking-tight">
                Insight Service
              </h1>
            </Link>
            <Badge variant="secondary" className="text-[11px]">
              Состояние продуктов
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/product-analytics">
              <Button
                variant="outline"
                size="sm"
                className="hidden h-7 px-3 text-[12px] md:inline-flex"
              >
                Детальная аналитика
              </Button>
            </Link>
            <Link href="/product-analytics" className="md:hidden">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                Детали
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto h-[calc(100dvh-64px)] w-full max-w-[1600px] overflow-hidden px-4 py-3 md:px-6">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <ProductSituationToolbar
            variant="home"
            filters={filters}
            sectorOptions={sectorOptions}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />

          <div className="min-h-0 flex-1">
            {error ? (
              <p className="mb-2 px-1 text-xs text-red-600">{error}</p>
            ) : null}
            <ProductSituationBubbleMatrix
              points={bubblePoints}
              scoreThresholds={bubbleScoreThresholds}
              productOrder={productOptions}
              onPointClick={handleBubbleClick}
              chartHeightClassName="h-full min-h-[280px]"
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
