import { DASHBOARD_METRIC_IDS } from '@/features/insight-dashboard/config/constants'
import {
  METRICS,
  buildOverlapAnalyticsFromMetricSeries,
  type MetricDataPoint,
  type OverlapAnalytics,
  type OverlapGranularity,
} from '@/lib/metrics-data'

export function buildOverlapAnalyticsModel(
  metricSeries: Record<string, MetricDataPoint[]>,
  presentMetricIds: string[],
  granularity: OverlapGranularity
): OverlapAnalytics {
  return buildOverlapAnalyticsFromMetricSeries({
    metricSeries,
    metricIds: presentMetricIds,
    metricsMap: METRICS,
    granularity,
  })
}

export function buildOverlapSeriesColorMap(): Record<string, string> {
  return Object.fromEntries(
    DASHBOARD_METRIC_IDS.map((metricId) => [METRICS[metricId].name, METRICS[metricId].color])
  )
}
