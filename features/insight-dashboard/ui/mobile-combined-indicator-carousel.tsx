'use client'

import { useEffect, useState } from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import type {
  CombinedIndicatorBucket,
  IndicatorLineValueMode,
} from '@/features/insight-dashboard/domain/types'
import { IndicatorCombinedCard } from '@/features/insight-dashboard/ui/indicator-combined-card'
import { cn } from '@/lib/utils'
import type { MetricInfo } from '@/lib/metrics-data'

interface MobileCombinedIndicatorCarouselProps {
  items: Array<{
    metric: MetricInfo
    data: CombinedIndicatorBucket[]
  }>
  lineValueMode: IndicatorLineValueMode
}

export function MobileCombinedIndicatorCarousel({
  items,
  lineValueMode,
}: MobileCombinedIndicatorCarouselProps) {
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
                <IndicatorCombinedCard metric={metric} data={data} lineValueMode={lineValueMode} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-1">
        {Array.from({ length: count }).map((_, index) => (
          <span
            key={`mobile-combined-dot-${index}`}
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
