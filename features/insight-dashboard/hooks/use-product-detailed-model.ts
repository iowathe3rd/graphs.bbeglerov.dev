'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  DEFAULT_DETAILED_FILTERS,
  INSIGHT_STORAGE_KEYS,
} from '@/features/insight-dashboard/config/constants'
import {
  buildDetailedAnalyticsModel,
  buildOverlapSeriesColorMap,
  countActiveMobileFilters,
  parseDashboardPreferences,
  parseDashboardQueryParams,
  serializeDashboardPreferences,
} from '@/features/insight-dashboard/domain/detailed-analytics'
import type {
  InsightDetailedFilters,
  InsightEvent,
} from '@/features/insight-dashboard/domain/types'
import { type OverlapGranularity } from '@/lib/metrics-data'

interface UseProductDetailedModelParams {
  events?: InsightEvent[]
  loading?: boolean
  error?: string | null
  query?: URLSearchParams | null
}

export function useProductDetailedModel(
  params: UseProductDetailedModelParams = {}
) {
  const [filters, setFilters] = useState<InsightDetailedFilters>(() => DEFAULT_DETAILED_FILTERS)
  const [overlapGranularity, setOverlapGranularity] = useState<OverlapGranularity>(() => 'day')
  const [overlapSelection, setOverlapSelection] = useState<string[]>(() => [])
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false)
  const [isMobileDetailsSheetOpen, setIsMobileDetailsSheetOpen] = useState(false)
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false)

  useEffect(() => {
    const restored = parseDashboardPreferences(
      window.localStorage.getItem(INSIGHT_STORAGE_KEYS.dashboardPreferences)
    )
    const queryOverrides = parseDashboardQueryParams(
      params.query ?? new URLSearchParams(window.location.search)
    )

    const baseFilters = restored?.filters ?? DEFAULT_DETAILED_FILTERS
    const baseGranularity = restored?.granularity ?? 'day'

    const nextFilters: InsightDetailedFilters = {
      sector: queryOverrides?.sector ?? baseFilters.sector,
      channel: 'Колл-центр',
      productGroup: queryOverrides?.productGroup ?? baseFilters.productGroup,
      dateRange: queryOverrides?.dateRange ?? baseFilters.dateRange,
    }
    const nextGranularity = queryOverrides?.granularity ?? baseGranularity

    setFilters(nextFilters)
    setOverlapGranularity(nextGranularity)
    setIsPreferencesLoaded(true)
  }, [params.query])

  useEffect(() => {
    if (!isPreferencesLoaded) {
      return
    }

    window.localStorage.setItem(
      INSIGHT_STORAGE_KEYS.dashboardPreferences,
      serializeDashboardPreferences(filters, overlapGranularity)
    )
  }, [filters, overlapGranularity, isPreferencesLoaded])

  const events = params.events ?? []

  const model = useMemo(
    () =>
      buildDetailedAnalyticsModel({
        events,
        filters,
        granularity: overlapGranularity,
      }),
    [events, filters, overlapGranularity]
  )

  const overlapSeriesColorMap = useMemo(() => buildOverlapSeriesColorMap(), [])

  const mobileActiveFiltersCount = useMemo(
    () => countActiveMobileFilters(filters, overlapGranularity),
    [filters, overlapGranularity]
  )

  const resetFilters = () => {
    setFilters(DEFAULT_DETAILED_FILTERS)
    setOverlapGranularity('day')
    setOverlapSelection([])
  }

  const applyMobileFilters = (
    nextFilters: InsightDetailedFilters,
    nextGranularity: OverlapGranularity
  ) => {
    setFilters(nextFilters)
    setOverlapGranularity(nextGranularity)
    setOverlapSelection([])
    setIsMobileFilterSheetOpen(false)
  }

  const resetMobileFilters = () => {
    resetFilters()
    setIsMobileFilterSheetOpen(false)
  }

  return {
    filters,
    setFilters,
    overlapGranularity,
    setOverlapGranularity,
    overlapSelection,
    setOverlapSelection,
    isMobileFilterSheetOpen,
    setIsMobileFilterSheetOpen,
    isMobileDetailsSheetOpen,
    setIsMobileDetailsSheetOpen,
    lineCards: model.lineCards,
    overlapData: model.overlapData,
    overlapSeriesColorMap,
    mobileActiveFiltersCount,
    resetFilters,
    applyMobileFilters,
    resetMobileFilters,
    loading: params.loading ?? false,
    error: params.error ?? null,
  }
}
