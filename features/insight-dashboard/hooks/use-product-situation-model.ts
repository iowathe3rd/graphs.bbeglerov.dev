'use client'

import { useMemo, useState } from 'react'

import { BUBBLE_ZONE_BREAKPOINTS, DEFAULT_HOME_FILTERS } from '@/features/insight-dashboard/config/constants'
import { createLastDaysRange } from '@/features/insight-dashboard/domain/date-bucketing'
import { filterEventsForProductSituation } from '@/features/insight-dashboard/domain/bubble-matrix'
import { buildBubbleMatrixPoints } from '@/features/insight-dashboard/domain/health-index'
import { useInsightEvents } from '@/features/insight-dashboard/hooks/use-insight-events'
import type {
  InsightEvent,
  InsightFilters,
  ProductBubblePoint,
} from '@/features/insight-dashboard/domain/types'

interface UseProductSituationModelParams {
  events?: InsightEvent[]
  defaultWindowDays?: number
}

interface ProductSituationModel {
  filters: InsightFilters
  setFilters: React.Dispatch<React.SetStateAction<InsightFilters>>
  resetFilters: () => void
  events: InsightEvent[]
  filteredEvents: InsightEvent[]
  bubblePoints: ProductBubblePoint[]
  loading: boolean
  error: string | null
}

function createDefaultFilters(windowDays: number): InsightFilters {
  return {
    sector: DEFAULT_HOME_FILTERS.sector,
    productGroup: 'all',
    dateRange: createLastDaysRange(windowDays),
  }
}

export function useProductSituationModel(
  params: UseProductSituationModelParams = {}
): ProductSituationModel {
  const defaultWindowDays = params.defaultWindowDays ?? 30
  const csvState = useInsightEvents()

  const [filters, setFilters] = useState<InsightFilters>(() =>
    createDefaultFilters(defaultWindowDays)
  )

  const events = params.events ?? csvState.events

  const filteredEvents = useMemo(
    () => filterEventsForProductSituation(events, filters),
    [events, filters]
  )

  const bubblePoints = useMemo(
    () =>
      buildBubbleMatrixPoints(filteredEvents, {
        zones: BUBBLE_ZONE_BREAKPOINTS,
      }),
    [filteredEvents]
  )

  const resetFilters = () => {
    setFilters(createDefaultFilters(defaultWindowDays))
  }

  return {
    filters,
    setFilters,
    resetFilters,
    events,
    filteredEvents,
    bubblePoints,
    loading: !params.events && (csvState.status === 'idle' || csvState.status === 'loading'),
    error: params.events ? null : csvState.error,
  }
}
