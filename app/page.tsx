'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ProductSituationBubbleMatrix } from '@/components/product-situation/product-situation-bubble-matrix'
import { ProductSituationToolbar } from '@/components/product-situation/product-situation-toolbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { generateEventStream, type EventRecord } from '@/lib/metrics-data'
import {
  buildProductSituationBubblePoints,
  type ProductSituationBubblePoint,
  type ProductSituationFilters,
} from '@/lib/product-situation-analytics'

function createDefaultFilters(): ProductSituationFilters {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 30)

  return {
    sector: 'РБ',
    productGroup: 'all',
    dateRange: {
      from,
      to,
    },
  }
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

function toDateKey(date?: Date) {
  if (!date) {
    return undefined
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function Page() {
  const router = useRouter()
  const [filters, setFilters] = useState<ProductSituationFilters>(() => createDefaultFilters())

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

      if (!isDateInRange(event.date, range.from, range.to)) {
        continue
      }

      result.push(event)
    }

    return result
  }, [events, filters.dateRange])

  const bubblePoints = useMemo(
    () =>
      buildProductSituationBubblePoints(filteredEvents, {
        zones: {
          greenMax: 10,
          yellowMax: 30,
          max: 100,
        },
      }),
    [filteredEvents]
  )

  const handleReset = () => {
    setFilters(createDefaultFilters())
  }

  const handleBubbleClick = (point: ProductSituationBubblePoint) => {
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
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="font-display text-[20px] font-semibold tracking-tight">
              Insight Service
            </h1>
            <Badge variant="secondary" className="text-[11px]">
              Состояние продукта
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/product-analytics">
              <Button variant="outline" size="sm" className="hidden h-8 text-xs md:inline-flex">
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
            onFiltersChange={setFilters}
            onReset={handleReset}
          />

          <div className="min-h-0 flex-1">
            <ProductSituationBubbleMatrix
              points={bubblePoints}
              onPointClick={handleBubbleClick}
              chartHeightClassName="h-full min-h-[280px]"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
