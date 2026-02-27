'use client'

import { ProductDetailedAnalyticsView } from '@/features/insight-dashboard/components/product-detailed-analytics-page'
import { useInsightEvents } from '@/features/insight-dashboard/logic/hooks/use-insight-events'

export default function ProductAnalyticsPage() {
  const eventsState = useInsightEvents()

  return (
    <ProductDetailedAnalyticsView
      events={eventsState.events}
      loading={eventsState.status === 'idle' || eventsState.status === 'loading'}
      error={eventsState.error}
    />
  )
}
