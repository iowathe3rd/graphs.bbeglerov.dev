import {
  HEALTH_SCORE_CRITICAL_WEIGHT,
  HEALTH_SCORE_ZONE_THRESHOLDS,
  PRODUCT_SITUATION_TAGS,
} from '@/features/insight-dashboard/config/constants'
import type {
  InsightEvent,
  ProductBubblePoint,
  ProductSituationAnalytics,
  ProductSituationBucket,
  ProductSituationDomainPoint,
  ProductSituationDriverRow,
  ProductSituationDriverTrend,
  ProductSituationExecutiveSummary,
  ProductSituationExecutiveSummaryPoint,
  ProductSituationScoreThresholds,
  ProductSituationTag,
  ProductSituationZone,
  ProductSituationZones,
} from '@/features/insight-dashboard/domain/types'
import type { OverlapGranularity } from '@/lib/metrics-data'

const METRIC_TO_TAG = {
  sla: 'Технические проблемы/сбои',
  aht: 'Запрос не решен',
  queueLoad: 'Отрицательный продуктовый фидбэк',
  abandonment: 'Угроза ухода/отказа от продуктов банка',
} as const

const POSITIVE_METRICS = new Set(['fcr', 'csat'])

interface BuildHealthIndexMetricsOptions {
  granularity: OverlapGranularity
  topDomainsLimit?: number
  zones?: Partial<ProductSituationZones>
}

interface BuildBubbleMatrixPointsOptions {
  zones?: Partial<ProductSituationZones>
}

interface BuildProductTimelineBubbleModelOptions {
  productGroup: string
  granularity: OverlapGranularity
}

interface CaseAccumulator {
  isConsultation: boolean
  hasNegative: boolean
  tags: Record<ProductSituationTag, boolean>
  consultationTags: Record<ProductSituationTag, boolean>
}

interface BucketAccumulator {
  date: string
  cases: Map<string, CaseAccumulator>
}

interface DomainAccumulator {
  label: string
  cases: Map<string, CaseAccumulator>
}

interface CaseRollup {
  totalCalls: number
  problemCallsUnique: number
  consultationCalls: number
  consultationNegativeCalls: number
  consultationCleanCalls: number
  tagCounts: Record<ProductSituationTag, number>
  consultationTagCounts: Record<ProductSituationTag, number>
}

interface ScoreContext {
  weights: Record<ProductSituationTag, number>
  thresholds: ProductSituationScoreThresholds
}

interface ProductBubbleMatrixModel {
  points: ProductBubblePoint[]
  scoreThresholds: ProductSituationScoreThresholds
}

interface RiskMetrics {
  problemRate: number
  weightedNegativeRate: number
  severityRate: number
  volumeWeight: number
  confidence: number
  riskCore: number
  riskIndex: number
  healthIndex: number
  tagRates: Record<ProductSituationTag, number>
  consultationNegativeRate: number
  consultationCleanRate: number
  consultationWeightedNegativeRate: number
  consultationTagRates: Record<ProductSituationTag, number>
}

const INDICATOR_1_TAG: ProductSituationTag = 'Технические проблемы/сбои'
const INDICATOR_2_TAG: ProductSituationTag = 'Запрос не решен'
const INDICATOR_3_TAG: ProductSituationTag = 'Отрицательный продуктовый фидбэк'
const INDICATOR_4_TAG: ProductSituationTag = 'Угроза ухода/отказа от продуктов банка'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0
  }

  return numerator / denominator
}

function toShare(count: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return count / total
}

function buildEmptyTagCounts(): Record<ProductSituationTag, number> {
  return Object.fromEntries(
    PRODUCT_SITUATION_TAGS.map((tag) => [tag, 0])
  ) as Record<ProductSituationTag, number>
}

function buildEmptyTagFlags(): Record<ProductSituationTag, boolean> {
  return Object.fromEntries(
    PRODUCT_SITUATION_TAGS.map((tag) => [tag, false])
  ) as Record<ProductSituationTag, boolean>
}

function toTagRates(
  tagCounts: Record<ProductSituationTag, number>,
  totalCalls: number
): Record<ProductSituationTag, number> {
  const result = buildEmptyTagCounts()

  if (totalCalls <= 0) {
    return result
  }

  for (const tag of PRODUCT_SITUATION_TAGS) {
    result[tag] = round1((tagCounts[tag] / totalCalls) * 100)
  }

  return result
}

function sumTagCounts(tagCounts: Record<ProductSituationTag, number>): number {
  return PRODUCT_SITUATION_TAGS.reduce((sum, tag) => sum + tagCounts[tag], 0)
}

function toBucketDate(dateKey: string, granularity: OverlapGranularity): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    return dateKey
  }

  if (granularity === 'week') {
    const day = (date.getUTCDay() + 6) % 7
    date.setUTCDate(date.getUTCDate() - day)
  }

  if (granularity === 'month') {
    date.setUTCDate(1)
  }

  return date.toISOString().slice(0, 10)
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 1
  }

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 1) {
    return sorted[middle] || 1
  }

  return ((sorted[middle - 1] || 0) + (sorted[middle] || 0)) / 2 || 1
}

function aggregateTagCounts(rollups: CaseRollup[]): Record<ProductSituationTag, number> {
  const totalTagCounts = buildEmptyTagCounts()

  for (const rollup of rollups) {
    for (const tag of PRODUCT_SITUATION_TAGS) {
      totalTagCounts[tag] += rollup.tagCounts[tag]
    }
  }

  return totalTagCounts
}

function buildScoreWeights(
  totalTagCounts: Record<ProductSituationTag, number>
): Record<ProductSituationTag, number> {
  const baseCount = totalTagCounts[INDICATOR_2_TAG]
  const weights = buildEmptyTagCounts()

  weights[INDICATOR_1_TAG] = safeDivide(baseCount, totalTagCounts[INDICATOR_1_TAG])
  weights[INDICATOR_2_TAG] = 1
  weights[INDICATOR_3_TAG] = safeDivide(baseCount, totalTagCounts[INDICATOR_3_TAG])
  weights[INDICATOR_4_TAG] = HEALTH_SCORE_CRITICAL_WEIGHT

  return weights
}

function computeScoreByTagCounts(
  tagCounts: Record<ProductSituationTag, number>,
  totalCalls: number,
  weights: Record<ProductSituationTag, number>
): number {
  if (totalCalls <= 0) {
    return 0
  }

  let score = 0

  for (const tag of PRODUCT_SITUATION_TAGS) {
    score += toShare(tagCounts[tag], totalCalls) * weights[tag]
  }

  return score
}

function buildScoreThresholds(): ProductSituationScoreThresholds {
  const green = round4(HEALTH_SCORE_ZONE_THRESHOLDS.green)
  const red = round4(HEALTH_SCORE_ZONE_THRESHOLDS.red)

  return {
    green,
    red,
    lower: Math.min(green, red),
    upper: Math.max(green, red),
  }
}

function buildScoreContext(rollups: CaseRollup[]): ScoreContext {
  const totalTagCounts = aggregateTagCounts(rollups)
  const weights = buildScoreWeights(totalTagCounts)

  return {
    weights,
    thresholds: buildScoreThresholds(),
  }
}

function zoneByScore(
  score: number,
  thresholds: ProductSituationScoreThresholds
): ProductSituationZone {
  if (score <= thresholds.lower) {
    return 'green'
  }

  if (score >= thresholds.upper) {
    return 'red'
  }

  return 'yellow'
}

function resolveTag(event: InsightEvent): ProductSituationTag | null {
  const metricTag = METRIC_TO_TAG[event.metric as keyof typeof METRIC_TO_TAG]

  if (metricTag) {
    return metricTag
  }

  if (POSITIVE_METRICS.has(event.metric)) {
    return null
  }

  const rawTag = event.tag as ProductSituationTag
  if (PRODUCT_SITUATION_TAGS.includes(rawTag)) {
    return rawTag
  }

  return null
}

function getOrCreateCaseAccumulator(
  cases: Map<string, CaseAccumulator>,
  caseId: string
): CaseAccumulator {
  const existing = cases.get(caseId)

  if (existing) {
    return existing
  }

  const created: CaseAccumulator = {
    isConsultation: false,
    hasNegative: false,
    tags: buildEmptyTagFlags(),
    consultationTags: buildEmptyTagFlags(),
  }

  cases.set(caseId, created)

  return created
}

function updateCaseAccumulator(
  accumulator: CaseAccumulator,
  event: InsightEvent,
  tag: ProductSituationTag | null
): void {
  if (event.dialogueType === 'Консультация') {
    accumulator.isConsultation = true
  }

  if (!tag) {
    return
  }

  accumulator.hasNegative = true
  accumulator.tags[tag] = true

  if (event.dialogueType === 'Консультация') {
    accumulator.consultationTags[tag] = true
  }
}

function summarizeCases(cases: Map<string, CaseAccumulator>): CaseRollup {
  const tagCounts = buildEmptyTagCounts()
  const consultationTagCounts = buildEmptyTagCounts()

  let problemCallsUnique = 0
  let consultationCalls = 0
  let consultationNegativeCalls = 0
  let consultationCleanCalls = 0

  for (const caseData of cases.values()) {
    if (caseData.hasNegative) {
      problemCallsUnique += 1
    }

    if (caseData.isConsultation) {
      consultationCalls += 1
    }

    let hasConsultationNegative = false

    for (const tag of PRODUCT_SITUATION_TAGS) {
      if (caseData.tags[tag]) {
        tagCounts[tag] += 1
      }

      if (caseData.consultationTags[tag]) {
        consultationTagCounts[tag] += 1
        hasConsultationNegative = true
      }
    }

    if (caseData.isConsultation) {
      if (hasConsultationNegative) {
        consultationNegativeCalls += 1
      } else {
        consultationCleanCalls += 1
      }
    }
  }

  return {
    totalCalls: cases.size,
    problemCallsUnique,
    consultationCalls,
    consultationNegativeCalls,
    consultationCleanCalls,
    tagCounts,
    consultationTagCounts,
  }
}

function computeRiskMetrics(
  rollup: CaseRollup,
  scoreContext: ScoreContext
): RiskMetrics {
  const problemRate =
    rollup.totalCalls > 0
      ? round1((rollup.problemCallsUnique / rollup.totalCalls) * 100)
      : 0

  const tagRates = toTagRates(rollup.tagCounts, rollup.totalCalls)
  const score = round4(
    computeScoreByTagCounts(rollup.tagCounts, rollup.totalCalls, scoreContext.weights)
  )
  const weightedNegativeRate = score

  const consultationTagRates = toTagRates(
    rollup.consultationTagCounts,
    rollup.consultationCalls
  )

  const consultationNegativeRate =
    rollup.consultationCalls > 0
      ? round1((rollup.consultationNegativeCalls / rollup.consultationCalls) * 100)
      : 0

  const consultationCleanRate =
    rollup.consultationCalls > 0
      ? round1((rollup.consultationCleanCalls / rollup.consultationCalls) * 100)
      : 100

  const currentVolumeWeight = 1
  const confidence = 1
  const severityRate = score
  const riskCore = score
  const riskIndex = score
  const healthIndex = score
  const consultationWeightedNegativeRate = round4(
    computeScoreByTagCounts(
      rollup.consultationTagCounts,
      rollup.consultationCalls,
      scoreContext.weights
    )
  )

  return {
    problemRate,
    weightedNegativeRate,
    severityRate,
    volumeWeight: currentVolumeWeight,
    confidence,
    riskCore,
    riskIndex,
    healthIndex,
    tagRates,
    consultationNegativeRate,
    consultationCleanRate,
    consultationWeightedNegativeRate,
    consultationTagRates,
  }
}

function topDriverTag(tagCounts: Record<ProductSituationTag, number>): string {
  let bestTag: ProductSituationTag | null = null
  let bestCount = -1

  for (const tag of PRODUCT_SITUATION_TAGS) {
    const count = tagCounts[tag]

    if (count > bestCount) {
      bestTag = tag
      bestCount = count
    }
  }

  if (!bestTag || bestCount <= 0) {
    return 'Нет выраженного драйвера'
  }

  return bestTag
}

function toIndicatorShares(tagRates: Record<ProductSituationTag, number>) {
  return {
    indicator1Share: tagRates[INDICATOR_1_TAG],
    indicator2Share: tagRates[INDICATOR_2_TAG],
    indicator3Share: tagRates[INDICATOR_3_TAG],
    indicator4Share: tagRates[INDICATOR_4_TAG],
  }
}

function buildSummary(buckets: ProductSituationBucket[]): ProductSituationExecutiveSummary {
  if (buckets.length === 0) {
    return {
      current: null,
      previous: null,
      delta: null,
    }
  }

  const current = buckets[buckets.length - 1]
  const previous = buckets.length > 1 ? buckets[buckets.length - 2] : null

  const currentPoint: ProductSituationExecutiveSummaryPoint = {
    label: current.date,
    healthIndex: current.healthIndex,
    problematicCalls: current.problemCallsUnique,
    problematicRate: current.problemRate,
    totalCalls: current.totalCalls,
  }

  const previousPoint: ProductSituationExecutiveSummaryPoint | null = previous
    ? {
        label: previous.date,
        healthIndex: previous.healthIndex,
        problematicCalls: previous.problemCallsUnique,
        problematicRate: previous.problemRate,
        totalCalls: previous.totalCalls,
      }
    : null

  return {
    current: currentPoint,
    previous: previousPoint,
    delta: previousPoint
      ? {
          healthIndex: round4(currentPoint.healthIndex - previousPoint.healthIndex),
          problematicCalls: currentPoint.problematicCalls - previousPoint.problematicCalls,
          problematicRate: round1(
            currentPoint.problematicRate - previousPoint.problematicRate
          ),
          totalCalls: currentPoint.totalCalls - previousPoint.totalCalls,
        }
      : null,
  }
}

function trendFromDelta(delta: number): ProductSituationDriverTrend {
  if (delta > 0.2) {
    return 'up'
  }

  if (delta < -0.2) {
    return 'down'
  }

  return 'flat'
}

function buildDrivers(buckets: ProductSituationBucket[]): ProductSituationDriverRow[] {
  if (buckets.length === 0) {
    return []
  }

  const current = buckets[buckets.length - 1]
  const previous = buckets.length > 1 ? buckets[buckets.length - 2] : null
  const totalTagCounts = buildEmptyTagCounts()

  for (const bucket of buckets) {
    for (const tag of PRODUCT_SITUATION_TAGS) {
      totalTagCounts[tag] += bucket.tagCounts[tag]
    }
  }

  const totalAssignments = Math.max(1, sumTagCounts(totalTagCounts))
  const currentAssignments = Math.max(1, sumTagCounts(current.tagCounts))
  const previousAssignments = Math.max(1, sumTagCounts(previous?.tagCounts ?? buildEmptyTagCounts()))

  return PRODUCT_SITUATION_TAGS.map<ProductSituationDriverRow>((tag) => {
    const contributionRate = round1((totalTagCounts[tag] / totalAssignments) * 100)
    const currentContributionRate = round1((current.tagCounts[tag] / currentAssignments) * 100)
    const previousContributionRate = round1(
      ((previous?.tagCounts[tag] ?? current.tagCounts[tag]) / previousAssignments) * 100
    )
    const deltaContributionRate = round1(
      currentContributionRate - previousContributionRate
    )

    return {
      tag,
      label: tag,
      calls: totalTagCounts[tag],
      contributionRate,
      currentContributionRate,
      previousContributionRate,
      deltaContributionRate,
      trend: trendFromDelta(deltaContributionRate),
    }
  }).sort((a, b) => {
    if (a.contributionRate !== b.contributionRate) {
      return b.contributionRate - a.contributionRate
    }

    return a.label.localeCompare(b.label, 'ru')
  })
}

export function buildHealthIndexMetrics(
  events: InsightEvent[],
  options: BuildHealthIndexMetricsOptions
): ProductSituationAnalytics {
  const granularity = options.granularity
  const topDomainsLimit = options.topDomainsLimit ?? 8

  const bucketMap = new Map<string, BucketAccumulator>()
  const domainMap = new Map<string, DomainAccumulator>()

  for (const event of events) {
    const resolvedTag = resolveTag(event)
    const caseKey = event.caseId || event.id

    const bucketDate = toBucketDate(event.date, granularity)
    const bucket =
      bucketMap.get(bucketDate) ??
      {
        date: bucketDate,
        cases: new Map<string, CaseAccumulator>(),
      }

    const bucketCase = getOrCreateCaseAccumulator(bucket.cases, caseKey)
    updateCaseAccumulator(bucketCase, event, resolvedTag)
    bucketMap.set(bucketDate, bucket)

    const domain =
      domainMap.get(event.productGroup) ??
      {
        label: event.productGroup,
        cases: new Map<string, CaseAccumulator>(),
      }

    const domainCase = getOrCreateCaseAccumulator(domain.cases, caseKey)
    updateCaseAccumulator(domainCase, event, resolvedTag)
    domainMap.set(event.productGroup, domain)
  }

  const orderedBucketRollups = Array.from(bucketMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((bucket) => ({
      date: bucket.date,
      rollup: summarizeCases(bucket.cases),
    }))

  const orderedDomainRollups = Array.from(domainMap.values()).map((domain) => ({
    label: domain.label,
    rollup: summarizeCases(domain.cases),
  }))

  const scoreContext = buildScoreContext(
    orderedDomainRollups.map((domain) => domain.rollup)
  )

  const bucketBaselineCalls = median(
    orderedBucketRollups
      .map((bucket) => bucket.rollup.totalCalls)
      .filter((count) => count > 0)
  )

  const buckets: ProductSituationBucket[] = orderedBucketRollups.map((bucket) => {
    const riskMetrics = computeRiskMetrics(bucket.rollup, scoreContext)

    return {
      date: bucket.date,
      totalCalls: bucket.rollup.totalCalls,
      negativeCalls: bucket.rollup.problemCallsUnique,
      problemCallsUnique: bucket.rollup.problemCallsUnique,
      problemRate: riskMetrics.problemRate,
      negativeRate: riskMetrics.problemRate,
      weightedNegativeRate: riskMetrics.weightedNegativeRate,
      severityRate: riskMetrics.severityRate,
      volumeWeight: riskMetrics.volumeWeight,
      confidence: riskMetrics.confidence,
      riskCore: riskMetrics.riskCore,
      riskIndex: riskMetrics.riskIndex,
      healthIndex: riskMetrics.healthIndex,
      tagCounts: bucket.rollup.tagCounts,
      tagRates: riskMetrics.tagRates,
      consultationCalls: bucket.rollup.consultationCalls,
      consultationNegativeCalls: bucket.rollup.consultationNegativeCalls,
      consultationCleanCalls: bucket.rollup.consultationCleanCalls,
      consultationCleanRate: riskMetrics.consultationCleanRate,
      consultationNegativeRate: riskMetrics.consultationNegativeRate,
      consultationWeightedNegativeRate: riskMetrics.consultationWeightedNegativeRate,
      consultationTagCounts: bucket.rollup.consultationTagCounts,
      consultationTagRates: riskMetrics.consultationTagRates,
    }
  })

  const domainBaselineCalls = median(
    orderedDomainRollups
      .map((domain) => domain.rollup.totalCalls)
      .filter((count) => count > 0)
  )

  const domains = orderedDomainRollups
    .map<ProductSituationDomainPoint>((domain) => {
      const riskMetrics = computeRiskMetrics(domain.rollup, scoreContext)

      return {
        id: `domain:${domain.label}`,
        label: domain.label,
        totalCalls: domain.rollup.totalCalls,
        negativeCalls: domain.rollup.problemCallsUnique,
        problemCallsUnique: domain.rollup.problemCallsUnique,
        problemRate: riskMetrics.problemRate,
        negativeRate: riskMetrics.problemRate,
        weightedNegativeRate: riskMetrics.weightedNegativeRate,
        severityRate: riskMetrics.severityRate,
        volumeWeight: riskMetrics.volumeWeight,
        confidence: riskMetrics.confidence,
        riskCore: riskMetrics.riskCore,
        riskIndex: riskMetrics.riskIndex,
        healthIndex: riskMetrics.healthIndex,
        zone: zoneByScore(riskMetrics.riskIndex, scoreContext.thresholds),
        topDriverTag: topDriverTag(domain.rollup.tagCounts),
        tagCounts: domain.rollup.tagCounts,
        tagRates: riskMetrics.tagRates,
      }
    })
    .sort((a, b) => {
      if (a.riskIndex !== b.riskIndex) {
        return b.riskIndex - a.riskIndex
      }

      if (a.problemCallsUnique !== b.problemCallsUnique) {
        return b.problemCallsUnique - a.problemCallsUnique
      }

      return a.label.localeCompare(b.label, 'ru')
    })

  return {
    buckets,
    domains,
    topDomains: domains.slice(0, topDomainsLimit),
    baselineCalls: bucketBaselineCalls,
    domainBaselineCalls,
    scoreThresholds: scoreContext.thresholds,
    summary: buildSummary(buckets),
    drivers: buildDrivers(buckets),
  }
}

export function buildBubbleMatrixModel(
  events: InsightEvent[],
  options?: BuildBubbleMatrixPointsOptions
): ProductBubbleMatrixModel {
  const analytics = buildHealthIndexMetrics(events, {
    granularity: 'month',
    topDomainsLimit: Number.MAX_SAFE_INTEGER,
    zones: options?.zones,
  })

  return {
    points: analytics.domains.map((domain) => ({
      id: domain.id,
      productGroup: domain.label,
      label: domain.label,
      periodKey: undefined,
      totalCalls: domain.totalCalls,
      problemCallsUnique: domain.problemCallsUnique,
      problemRate: domain.problemRate,
      healthIndex: domain.healthIndex,
      riskIndex: domain.riskIndex,
      zone: domain.zone,
      topDriverTag: domain.topDriverTag,
      ...toIndicatorShares(domain.tagRates),
    })),
    scoreThresholds: analytics.scoreThresholds,
  }
}

function buildDomainRollupsForScoreContext(events: InsightEvent[]): Array<{
  label: string
  rollup: CaseRollup
}> {
  const domainMap = new Map<string, Map<string, CaseAccumulator>>()

  for (const event of events) {
    const resolvedTag = resolveTag(event)
    const caseKey = event.caseId || event.id
    const domainCases = domainMap.get(event.productGroup) ?? new Map<string, CaseAccumulator>()
    const domainCase = getOrCreateCaseAccumulator(domainCases, caseKey)
    updateCaseAccumulator(domainCase, event, resolvedTag)
    domainMap.set(event.productGroup, domainCases)
  }

  return Array.from(domainMap.entries()).map(([label, cases]) => ({
    label,
    rollup: summarizeCases(cases),
  }))
}

function buildProductRollupsByBucket(
  events: InsightEvent[],
  granularity: OverlapGranularity
): Map<string, Map<string, CaseRollup>> {
  const bucketMap = new Map<string, Map<string, Map<string, CaseAccumulator>>>()

  for (const event of events) {
    const resolvedTag = resolveTag(event)
    const caseKey = event.caseId || event.id
    const bucketDate = toBucketDate(event.date, granularity)
    const productCasesByBucket = bucketMap.get(bucketDate) ?? new Map<string, Map<string, CaseAccumulator>>()
    const productCases = productCasesByBucket.get(event.productGroup) ?? new Map<string, CaseAccumulator>()
    const caseAccumulator = getOrCreateCaseAccumulator(productCases, caseKey)

    updateCaseAccumulator(caseAccumulator, event, resolvedTag)
    productCasesByBucket.set(event.productGroup, productCases)
    bucketMap.set(bucketDate, productCasesByBucket)
  }

  return new Map(
    Array.from(bucketMap.entries()).map(([bucketDate, productCasesByBucket]) => [
      bucketDate,
      new Map(
        Array.from(productCasesByBucket.entries()).map(([productGroup, cases]) => [
          productGroup,
          summarizeCases(cases),
        ])
      ),
    ])
  )
}

export function buildProductTimelineBubbleModel(
  events: InsightEvent[],
  options: BuildProductTimelineBubbleModelOptions
): ProductBubbleMatrixModel {
  const domainRollups = buildDomainRollupsForScoreContext(events)
  const scoreContext = buildScoreContext(domainRollups.map((item) => item.rollup))
  const productRollupsByBucket = buildProductRollupsByBucket(events, options.granularity)
  const points: ProductBubblePoint[] = []

  for (const [bucketDate, productRollups] of Array.from(productRollupsByBucket.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const rollup = productRollups.get(options.productGroup)
    if (!rollup) {
      continue
    }

    const riskMetrics = computeRiskMetrics(rollup, scoreContext)

    points.push({
      id: `timeline:${options.productGroup}:${bucketDate}`,
      productGroup: options.productGroup,
      label: options.productGroup,
      periodKey: bucketDate,
      totalCalls: rollup.totalCalls,
      problemCallsUnique: rollup.problemCallsUnique,
      problemRate: riskMetrics.problemRate,
      healthIndex: riskMetrics.healthIndex,
      riskIndex: riskMetrics.riskIndex,
      zone: zoneByScore(riskMetrics.healthIndex, scoreContext.thresholds),
      topDriverTag: topDriverTag(rollup.tagCounts),
      ...toIndicatorShares(riskMetrics.tagRates),
    })
  }

  return {
    points,
    scoreThresholds: scoreContext.thresholds,
  }
}

export function buildBubbleMatrixPoints(
  events: InsightEvent[],
  options?: BuildBubbleMatrixPointsOptions
): ProductBubblePoint[] {
  return buildBubbleMatrixModel(events, options).points
}

export function buildProductSituationAnalytics(
  events: InsightEvent[],
  options: BuildHealthIndexMetricsOptions
): ProductSituationAnalytics {
  return buildHealthIndexMetrics(events, options)
}

export function buildProductSituationBubblePoints(
  events: InsightEvent[],
  options?: BuildBubbleMatrixPointsOptions
): ProductBubblePoint[] {
  return buildBubbleMatrixPoints(events, options)
}
