import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { BubbleYAxisTitle } from '@/features/insight-dashboard/components/product-situation-bubble-matrix/axis-title'

interface BubbleChartLayoutProps {
  focusedSinglePoint: boolean
  isMainProductsView: boolean
  chartHeightClassName?: string
  children: ReactNode
}

export function BubbleChartLayout({
  focusedSinglePoint,
  isMainProductsView,
  chartHeightClassName,
  children,
}: BubbleChartLayoutProps) {
  return (
    <div
      className={cn(
        'h-[62dvh] min-h-[320px] w-full md:h-full md:min-h-0',
        chartHeightClassName
      )}
    >
      <div
        className={cn(
          'grid h-full w-full gap-1 md:gap-2',
          focusedSinglePoint
            ? 'grid-cols-1'
            : isMainProductsView
              ? 'grid-cols-[42px_minmax(0,1fr)] md:grid-cols-[52px_minmax(0,1fr)]'
              : 'grid-cols-[32px_minmax(0,1fr)] md:grid-cols-[38px_minmax(0,1fr)]'
        )}
      >
        {!focusedSinglePoint ? <BubbleYAxisTitle isMainProductsView={isMainProductsView} /> : null}
        {children}
      </div>
    </div>
  )
}
