import { BUBBLE_ZONE_BREAKPOINTS } from '@/features/insight-dashboard/config/constants'
import { buildBubbleMatrixPoints } from '@/features/insight-dashboard/domain/product-dissatisfaction-score'
import {
  isDateInRange,
  normalizeDateRange,
} from '@/features/insight-dashboard/domain/date-bucketing'
import type {
  InsightEvent,
  InsightFilters,
  ProductBubblePoint,
} from '@/features/insight-dashboard/domain/types'

export function filterEventsForProductSituation(
  events: InsightEvent[],
  filters: InsightFilters
): InsightEvent[] {
  const range = normalizeDateRange(filters.dateRange)

  return events.filter((event) => {
    if (event.channel !== 'Колл-центр') {
      return false
    }

    if (filters.sector && event.sector !== filters.sector) {
      return false
    }

    if (!isDateInRange(event.date, range.from, range.to)) {
      return false
    }

    return true
  })
}

export function buildProductSituationBubblePoints(
  events: InsightEvent[],
  filters: InsightFilters
): ProductBubblePoint[] {
  const filteredEvents = filterEventsForProductSituation(events, filters)

  return buildBubbleMatrixPoints(filteredEvents, {
    zones: BUBBLE_ZONE_BREAKPOINTS,
  })
}
