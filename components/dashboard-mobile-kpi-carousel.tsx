'use client'

import { useEffect, useState } from 'react'

import { DashboardLineCard } from '@/components/dashboard-line-card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import type { MetricDataPoint, MetricInfo } from '@/lib/metrics-data'

interface DashboardMobileKpiCarouselProps {
  items: Array<{ metric: MetricInfo; data: MetricDataPoint[] }>
}

export function DashboardMobileKpiCarousel({
  items,
}: DashboardMobileKpiCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(items.length)

  useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }

    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          containScroll: 'trimSnaps',
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {items.map(({ metric, data }) => (
            <CarouselItem key={metric.id} className="basis-[94%] pl-3">
              <div className="h-[240px]">
                <DashboardLineCard metric={metric} data={data} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-1">
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={`mobile-kpi-dot-${index}`}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-colors',
              index === current ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
