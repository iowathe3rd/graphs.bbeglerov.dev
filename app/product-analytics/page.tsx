'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import { ProductDetailedAnalyticsView, useInsightEvents } from '@/features/insight-dashboard'

export default function ProductAnalyticsPage() {
  const searchParams = useSearchParams()
  const eventsState = useInsightEvents()

  const query = useMemo(() => {
    if (!searchParams) {
      return null
    }

    return new URLSearchParams(searchParams.toString())
  }, [searchParams])

  return (
    <ProductDetailedAnalyticsView
      events={eventsState.events}
      loading={eventsState.status === 'idle' || eventsState.status === 'loading'}
      error={eventsState.error}
      query={query}
    />
  )
}
