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
import { buildInsightFilterOptions, ensureOption } from '@/features/insight-dashboard/domain/filter-options'
import type {
  IndicatorChartMode,
  IndicatorLineValueMode,
  InsightDetailedFilters,
  InsightEvent,
} from '@/features/insight-dashboard/domain/types'
import { type OverlapGranularity } from '@/lib/metrics-data'

interface UseProductDetailedModelParams {
  events?: InsightEvent[]
  loading?: boolean
  error?: string | null
  query?: URLSearchParams | null
  channel?: string
  sectorOptions?: string[]
  productOptions?: string[]
}

export function useProductDetailedModel(
  params: UseProductDetailedModelParams = {}
) {
  const events = params.events ?? []
  const resolvedChannel = params.channel ?? DEFAULT_DETAILED_FILTERS.channel
  const { sectorOptions, productOptions } = useMemo(
    () =>
      buildInsightFilterOptions({
        events,
        sectorOptions: params.sectorOptions,
        productOptions: params.productOptions,
      }),
    [events, params.productOptions, params.sectorOptions]
  )

  const defaultFilters = useMemo<InsightDetailedFilters>(
    () => ({
      sector: sectorOptions[0] ?? DEFAULT_DETAILED_FILTERS.sector,
      channel: resolvedChannel,
      productGroup: productOptions[0] ?? DEFAULT_DETAILED_FILTERS.productGroup,
      dateRange: {
        from: undefined,
        to: undefined,
      },
    }),
    [productOptions, resolvedChannel, sectorOptions]
  )

  const [filters, setFilters] = useState<InsightDetailedFilters>(() => DEFAULT_DETAILED_FILTERS)
  const [overlapGranularity, setOverlapGranularity] = useState<OverlapGranularity>(() => 'day')
  const [overlapSelection, setOverlapSelection] = useState<string[]>(() => [])
  const [indicatorChartMode, setIndicatorChartMode] = useState<IndicatorChartMode>('kpi')
  const [indicatorLineValueMode, setIndicatorLineValueMode] =
    useState<IndicatorLineValueMode>('percent')
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

    const baseFilters = restored?.filters ?? defaultFilters
    const baseGranularity = restored?.granularity ?? 'day'

    const nextFilters: InsightDetailedFilters = {
      sector: queryOverrides?.sector ?? baseFilters.sector ?? defaultFilters.sector,
      channel: resolvedChannel,
      productGroup:
        queryOverrides?.productGroup ?? baseFilters.productGroup ?? defaultFilters.productGroup,
      dateRange: queryOverrides?.dateRange ?? baseFilters.dateRange,
    }
    const nextGranularity = queryOverrides?.granularity ?? baseGranularity

    setFilters(nextFilters)
    setOverlapGranularity(nextGranularity)
    setIsPreferencesLoaded(true)
  }, [defaultFilters, params.query, resolvedChannel])

  useEffect(() => {
    if (!isPreferencesLoaded) {
      return
    }

    setFilters((previous) => {
      const nextSector = ensureOption(previous.sector, sectorOptions, defaultFilters.sector)
      const nextProductGroup = ensureOption(
        previous.productGroup,
        productOptions,
        defaultFilters.productGroup
      )

      if (
        nextSector === previous.sector &&
        nextProductGroup === previous.productGroup &&
        previous.channel === resolvedChannel
      ) {
        return previous
      }

      return {
        ...previous,
        sector: nextSector,
        productGroup: nextProductGroup,
        channel: resolvedChannel,
      }
    })
  }, [
    defaultFilters.productGroup,
    defaultFilters.sector,
    isPreferencesLoaded,
    productOptions,
    resolvedChannel,
    sectorOptions,
  ])

  useEffect(() => {
    if (!isPreferencesLoaded) {
      return
    }

    window.localStorage.setItem(
      INSIGHT_STORAGE_KEYS.dashboardPreferences,
      serializeDashboardPreferences(filters, overlapGranularity)
    )
  }, [filters, overlapGranularity, isPreferencesLoaded])

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
    setFilters(defaultFilters)
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
    indicatorChartMode,
    setIndicatorChartMode,
    indicatorLineValueMode,
    setIndicatorLineValueMode,
    isMobileFilterSheetOpen,
    setIsMobileFilterSheetOpen,
    isMobileDetailsSheetOpen,
    setIsMobileDetailsSheetOpen,
    lineCards: model.lineCards,
    combinedIndicatorSeriesByMetric: model.combinedIndicatorSeriesByMetric,
    overlapData: model.overlapData,
    callCoverageSeries: model.callCoverageSeries,
    overlapSeriesColorMap,
    sectorOptions,
    productOptions,
    mobileActiveFiltersCount,
    resetFilters,
    applyMobileFilters,
    resetMobileFilters,
    loading: params.loading ?? false,
    error: params.error ?? null,
  }
}
