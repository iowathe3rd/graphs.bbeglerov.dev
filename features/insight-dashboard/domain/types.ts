import type {
  MetricDataPoint,
  MetricInfo,
  OverlapAnalytics,
  OverlapGranularity,
} from '@/lib/metrics-data'

export type InsightGranularity = OverlapGranularity
export type InsightSector = string
export type InsightProductGroup = string
export type InsightChannel = string

export interface InsightDateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface InsightFilters {
  sector: InsightSector
  productGroup: InsightProductGroup | 'all'
  dateRange: InsightDateRange
}

export interface InsightDetailedFilters {
  sector: InsightSector
  channel: InsightChannel
  productGroup: InsightProductGroup
  dateRange: InsightDateRange
}

export interface InsightEventInput {
  id: string
  caseId: string
  date: string
  timestamp?: string
  sector: InsightSector
  productGroup: InsightProductGroup
  channel: string
  dialogueType: 'Консультация' | 'Претензия'
  metric: string
  tag: string
}

export type InsightEvent = InsightEventInput
export type InsightDataStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface InsightDataSourceState {
  events: InsightEvent[]
  status: InsightDataStatus
  error: string | null
}

export type ProductSituationMode = 'rate' | 'volume' | 'combo'
export type ProductSituationZone = 'green' | 'yellow' | 'red'
export type ProductSituationDriverTrend = 'up' | 'down' | 'flat'

export interface ProductSituationZones {
  greenMax: number
  yellowMax: number
  max: number
}

export interface ProductSituationScoreThresholds {
  green: number
  red: number
  lower: number
  upper: number
}

export interface HealthIndexBreakpoints {
  greenMin: number
  yellowMin: number
}

export type ProductSituationTag =
  | 'Технические проблемы/сбои'
  | 'Запрос не решен'
  | 'Отрицательный продуктовый фидбэк'
  | 'Угроза ухода/отказа от продуктов банка'

export interface ProductSituationBucket {
  date: string
  totalCalls: number
  negativeCalls: number
  problemCallsUnique: number
  problemRate: number
  negativeRate: number
  weightedNegativeRate: number
  severityRate: number
  volumeWeight: number
  confidence: number
  riskCore: number
  riskIndex: number
  healthIndex: number
  tagCounts: Record<ProductSituationTag, number>
  tagRates: Record<ProductSituationTag, number>
  consultationCalls: number
  consultationNegativeCalls: number
  consultationCleanCalls: number
  consultationCleanRate: number
  consultationNegativeRate: number
  consultationWeightedNegativeRate: number
  consultationTagCounts: Record<ProductSituationTag, number>
  consultationTagRates: Record<ProductSituationTag, number>
}

export interface ProductSituationDomainPoint {
  id: string
  label: string
  totalCalls: number
  negativeCalls: number
  problemCallsUnique: number
  problemRate: number
  negativeRate: number
  weightedNegativeRate: number
  severityRate: number
  volumeWeight: number
  confidence: number
  riskCore: number
  riskIndex: number
  healthIndex: number
  zone: ProductSituationZone
  topDriverTag: string
  tagCounts: Record<ProductSituationTag, number>
  tagRates: Record<ProductSituationTag, number>
}

export interface ProductBubblePoint {
  id: string
  productGroup: InsightProductGroup
  label: string
  totalCalls: number
  problemCallsUnique: number
  problemRate: number
  healthIndex: number
  riskIndex: number
  zone: ProductSituationZone
  topDriverTag: string
}

export interface ProductSituationExecutiveSummaryPoint {
  label: string
  healthIndex: number
  problematicCalls: number
  problematicRate: number
  totalCalls: number
}

export interface ProductSituationExecutiveSummary {
  current: ProductSituationExecutiveSummaryPoint | null
  previous: ProductSituationExecutiveSummaryPoint | null
  delta: {
    healthIndex: number
    problematicCalls: number
    problematicRate: number
    totalCalls: number
  } | null
}

export interface ProductSituationDriverRow {
  tag: ProductSituationTag
  label: string
  calls: number
  contributionRate: number
  currentContributionRate: number
  previousContributionRate: number
  deltaContributionRate: number
  trend: ProductSituationDriverTrend
}

export interface ProductSituationAnalytics {
  buckets: ProductSituationBucket[]
  domains: ProductSituationDomainPoint[]
  topDomains: ProductSituationDomainPoint[]
  baselineCalls: number
  domainBaselineCalls: number
  scoreThresholds: ProductSituationScoreThresholds
  summary: ProductSituationExecutiveSummary
  drivers: ProductSituationDriverRow[]
}

export interface InsightLineCardItem {
  metric: MetricInfo
  data: MetricDataPoint[]
}

export interface CallCoverageBucket {
  bucketKey: string
  bucketLabel: string
  n1TotalCalls: number
  n2CallsWithAnyIndicator: number
  coveragePercent: number
}

export type IndicatorChartMode = 'kpi' | 'combined'
export type IndicatorLineValueMode = 'percent' | 'absolute'

export interface CombinedIndicatorBucket {
  bucketKey: string
  bucketLabel: string
  totalCallsN1: number
  indicatorCalls: number
  indicatorRatePercent: number
}

export interface DetailedAnalyticsModel {
  filteredEvents: InsightEvent[]
  metricsData: Record<string, MetricDataPoint[]>
  chartMetricsData: Record<string, MetricDataPoint[]>
  lineCards: InsightLineCardItem[]
  overlapData: OverlapAnalytics
  callCoverageSeries: CallCoverageBucket[]
  combinedIndicatorSeriesByMetric: Record<string, CombinedIndicatorBucket[]>
}
