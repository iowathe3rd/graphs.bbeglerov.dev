export type {
  CallCoverageBucket,
  DetailedAnalyticsModel,
  HealthIndexBreakpoints,
  InsightChannel,
  InsightDataSourceState,
  InsightDataStatus,
  InsightDetailedFilters,
  InsightEvent,
  InsightEventInput,
  InsightFilters,
  InsightGranularity,
  InsightProductGroup,
  InsightSector,
  ProductBubblePoint,
  ProductSituationAnalytics,
  ProductSituationBucket,
  ProductSituationDomainPoint,
  ProductSituationDriverRow,
  ProductSituationMode,
  ProductSituationScoreThresholds,
  ProductSituationTag,
  ProductSituationZone,
  ProductSituationZones,
} from '@/features/insight-dashboard/domain/types'
export {
  buildInsightFilterOptions,
  ensureOption,
  type InsightFilterOptions,
} from '@/features/insight-dashboard/domain/filter-options'

export {
  buildBubbleMatrixPoints,
  buildHealthIndexMetrics,
  buildProductSituationAnalytics,
  buildProductSituationBubblePoints,
} from '@/features/insight-dashboard/domain/health-index'

export {
  buildDetailedAnalyticsModel,
  buildOverlapSeriesColorMap,
  countActiveMobileFilters,
  parseDashboardPreferences,
  parseDashboardQueryParams,
  serializeDashboardPreferences,
} from '@/features/insight-dashboard/domain/detailed-analytics'

export {
  buildProductSituationBubblePoints as buildBubbleMatrixPointsFromFilters,
  filterEventsForProductSituation,
} from '@/features/insight-dashboard/domain/bubble-matrix'

export { useProductSituationModel } from '@/features/insight-dashboard/hooks/use-product-situation-model'
export { useProductDetailedModel } from '@/features/insight-dashboard/hooks/use-product-detailed-model'
export { useInsightEvents } from '@/features/insight-dashboard/hooks/use-insight-events'

export {
  ProductSituationToolbar,
  type ProductSituationToolbarVariant,
  type ProductSituationExecutiveGranularity,
} from '@/features/insight-dashboard/ui/product-situation-toolbar'
export { ProductSituationBubbleMatrix } from '@/features/insight-dashboard/ui/product-situation-bubble-matrix'
export { CallCoverageChartCard } from '@/features/insight-dashboard/ui/call-coverage-chart-card'
export { StackedPortionBarChart } from '@/features/insight-dashboard/ui/stacked-portion-bar-chart'
export { ProductDetailedAnalyticsView } from '@/features/insight-dashboard/ui/product-detailed-analytics-page'

export {
  BUBBLE_ZONE_BREAKPOINTS,
  DASHBOARD_METRIC_IDS,
  HEALTH_INDEX_BREAKPOINTS,
  INSIGHT_CHANNEL,
  INSIGHT_STORAGE_KEYS,
  PRODUCT_SITUATION_TAGS,
  PRODUCT_TAG_COLORS,
  PRODUCT_TAG_WEIGHTS,
} from '@/features/insight-dashboard/config/constants'

export { INSIGHT_HELP_DIALOG_COPY } from '@/features/insight-dashboard/config/tooltips'
export { parseCallsCsv } from '@/features/insight-dashboard/domain/calls-csv'
export { parseCallsWorkbook } from '@/features/insight-dashboard/domain/calls-xlsx'
