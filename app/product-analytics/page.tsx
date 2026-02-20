'use client'

import { ProductDetailedAnalyticsView, useInsightEvents } from '@/features/insight-dashboard'

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
