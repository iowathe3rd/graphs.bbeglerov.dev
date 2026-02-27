export type {
  CallCoverageBucket,
  DetailedAnalyticsModel,
  ProductDissatisfactionScoreBreakpoints,
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
  ProductSituationScoreThresholds,
  ProductSituationTag,
  ProductSituationZone,
  ProductSituationZones,
} from '@/features/insight-dashboard/logic/types'
export {
  buildInsightFilterOptions,
  ensureOption,
  type InsightFilterOptions,
} from '@/features/insight-dashboard/logic/filter-options'

export {
  buildBubbleMatrixPoints,
  buildProductDissatisfactionScoreMetrics,
  buildProductSituationAnalytics,
  buildProductSituationBubblePoints,
} from '@/features/insight-dashboard/logic/product-dissatisfaction-score'

export {
  buildDetailedAnalyticsModel,
  countActiveMobileFilters,
  parseDashboardPreferences,
  parseDashboardQueryParams,
  serializeDashboardPreferences,
} from '@/features/insight-dashboard/logic/detailed-analytics'

export {
  buildProductSituationBubblePoints as buildBubbleMatrixPointsFromFilters,
  filterEventsForProductSituation,
} from '@/features/insight-dashboard/logic/bubble-matrix'

export { useProductSituationModel } from '@/features/insight-dashboard/logic/hooks/use-product-situation-model'
export { useProductDetailedModel } from '@/features/insight-dashboard/logic/hooks/use-product-detailed-model'
export { useInsightEvents } from '@/features/insight-dashboard/logic/hooks/use-insight-events'

export {
  ProductSituationToolbar,
  type ProductSituationGranularity,
} from '@/features/insight-dashboard/components/product-situation-toolbar'
export { ProductSituationBubbleMatrix } from '@/features/insight-dashboard/components/product-situation-bubble-matrix'
export { CallCoverageChartCard } from '@/features/insight-dashboard/components/call-coverage-chart-card'
export { StackedPortionBarChart } from '@/features/insight-dashboard/components/stacked-portion-bar-chart'
export { ProductDetailedAnalyticsView } from '@/features/insight-dashboard/components/product-detailed-analytics-page'

export {
  BUBBLE_ZONE_BREAKPOINTS,
  DASHBOARD_METRIC_IDS,
  PRODUCT_DISSATISFACTION_SCORE_BREAKPOINTS,
  INSIGHT_CHANNEL,
  INSIGHT_STORAGE_KEYS,
  PRODUCT_SITUATION_TAGS,
  PRODUCT_TAG_COLORS,
  PRODUCT_TAG_WEIGHTS,
} from '@/features/insight-dashboard/config/constants'

export { INSIGHT_HELP_DIALOG_COPY } from '@/features/insight-dashboard/config/tooltips'
export { parseCallsCsv } from '@/features/insight-dashboard/logic/calls-csv'
export { parseCallsWorkbook } from '@/features/insight-dashboard/logic/calls-xlsx'
export type {
  MetricDataPoint,
  MetricInfo,
  PeriodGranularity,
} from '@/features/insight-dashboard/logic/metrics-catalog'
export { METRICS } from '@/features/insight-dashboard/logic/metrics-catalog'
