import type { InsightDetailedFilters, ProductSituationTag } from '@/features/insight-dashboard/domain/types'
import { PRODUCT_GROUPS } from '@/lib/metrics-data'

export const INSIGHT_CHANNEL = 'Колл-центр' as const

export const INSIGHT_STORAGE_KEYS = {
  dashboardPreferences: 'insight-service:dashboard:v1',
} as const

export const PRODUCT_TAG_WEIGHTS: Record<ProductSituationTag, number> = {
  'Технические проблемы/сбои': 0.2,
  'Запрос не решен': 0.3,
  'Отрицательный продуктовый фидбэк': 0.2,
  'Угроза ухода/отказа от продуктов банка': 0.3,
}

export const PRODUCT_TAG_COLORS: Record<ProductSituationTag, string> = {
  'Технические проблемы/сбои': '#2563eb',
  'Запрос не решен': '#f97316',
  'Отрицательный продуктовый фидбэк': '#0f766e',
  'Угроза ухода/отказа от продуктов банка': '#64748b',
}

export const PRODUCT_SITUATION_TAGS = Object.keys(
  PRODUCT_TAG_WEIGHTS
) as ProductSituationTag[]

export const BUBBLE_ZONE_BREAKPOINTS = {
  greenMax: 5,
  yellowMax: 30,
  max: 100,
} as const

export const HEALTH_INDEX_BREAKPOINTS = {
  greenMin: 85,
  yellowMin: 70,
} as const

export const DASHBOARD_METRIC_IDS = ['sla', 'aht', 'queueLoad', 'abandonment'] as const

export const DEFAULT_HOME_FILTERS = {
  sector: 'РБ',
  productGroup: 'all',
  dateRange: {
    from: undefined,
    to: undefined,
  },
} as const

export const DEFAULT_DETAILED_FILTERS: InsightDetailedFilters = {
  sector: 'РБ',
  channel: INSIGHT_CHANNEL,
  productGroup: PRODUCT_GROUPS[0],
  dateRange: {
    from: undefined,
    to: undefined,
  },
}
