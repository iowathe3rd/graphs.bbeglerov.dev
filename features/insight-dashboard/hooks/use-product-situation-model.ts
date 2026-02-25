'use client'

import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_HOME_FILTERS } from '@/features/insight-dashboard/config/constants'
import { createLastDaysRange } from '@/features/insight-dashboard/domain/date-bucketing'
import { buildInsightFilterOptions, ensureOption } from '@/features/insight-dashboard/domain/filter-options'
import { filterEventsForProductSituation } from '@/features/insight-dashboard/domain/bubble-matrix'
import { buildBubbleMatrixModel } from '@/features/insight-dashboard/domain/product-dissatisfaction-score'
import type {
  InsightEvent,
  InsightFilters,
  ProductBubblePoint,
  ProductSituationScoreThresholds,
} from '@/features/insight-dashboard/domain/types'

interface UseProductSituationModelParams {
  events?: InsightEvent[]
  loading?: boolean
  error?: string | null
  defaultWindowDays?: number
  sectorOptions?: string[]
  productOptions?: string[]
}

interface ProductSituationModel {
  filters: InsightFilters
  setFilters: React.Dispatch<React.SetStateAction<InsightFilters>>
  resetFilters: () => void
  sectorOptions: string[]
  productOptions: string[]
  events: InsightEvent[]
  filteredEvents: InsightEvent[]
  bubblePoints: ProductBubblePoint[]
  bubbleScoreThresholds: ProductSituationScoreThresholds
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

  const [filters, setFilters] = useState<InsightFilters>(() =>
    createDefaultFilters(defaultWindowDays)
  )

  const events = params.events ?? []
  const { sectorOptions, productOptions } = useMemo(
    () =>
      buildInsightFilterOptions({
        events,
        sectorOptions: params.sectorOptions,
        productOptions: params.productOptions,
      }),
    [events, params.productOptions, params.sectorOptions]
  )

  useEffect(() => {
    const nextSector = ensureOption(
      filters.sector,
      sectorOptions,
      DEFAULT_HOME_FILTERS.sector
    )

    if (nextSector === filters.sector) {
      return
    }

    setFilters((previous) => ({
      ...previous,
      sector: nextSector,
    }))
  }, [filters.sector, sectorOptions])

  const filteredEvents = useMemo(
    () => filterEventsForProductSituation(events, filters),
    [events, filters]
  )

  const bubbleMatrixModel = useMemo(
    () => buildBubbleMatrixModel(filteredEvents),
    [filteredEvents]
  )
  const bubblePoints = bubbleMatrixModel.points
  const bubbleScoreThresholds = bubbleMatrixModel.scoreThresholds

  const resetFilters = () => {
    setFilters(createDefaultFilters(defaultWindowDays))
  }

  return {
    filters,
    setFilters,
    resetFilters,
    sectorOptions,
    productOptions,
    events,
    filteredEvents,
    bubblePoints,
    bubbleScoreThresholds,
    loading: params.loading ?? false,
    error: params.error ?? null,
  }
}
