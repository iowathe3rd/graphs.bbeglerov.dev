import {
  BUBBLE_ZONE_BREAKPOINTS,
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

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
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

function normalizeZones(zones?: Partial<ProductSituationZones>): ProductSituationZones {
  const max = Math.max(1, zones?.max ?? BUBBLE_ZONE_BREAKPOINTS.max)
  const greenMax = clamp(zones?.greenMax ?? BUBBLE_ZONE_BREAKPOINTS.greenMax, 0, max)
  const yellowMax = clamp(zones?.yellowMax ?? BUBBLE_ZONE_BREAKPOINTS.yellowMax, greenMax, max)

  return {
    greenMax,
    yellowMax,
    max,
  }
}

function zoneByRisk(value: number, zones: ProductSituationZones): ProductSituationZone {
  if (value <= zones.greenMax) {
    return 'green'
  }

  if (value <= zones.yellowMax) {
    return 'yellow'
  }

  return 'red'
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
  _baselineCalls: number,
  maxRisk: number
): RiskMetrics {
  const problemRate =
    rollup.totalCalls > 0
      ? round1((rollup.problemCallsUnique / rollup.totalCalls) * 100)
      : 0

  const tagRates = toTagRates(rollup.tagCounts, rollup.totalCalls)
  const weightedNegativeRate = problemRate

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

  // PO simplification:
  // health/risk is driven only by share of calls with at least one indicator.
  const currentVolumeWeight = 1
  const confidence = 1
  const severityRate = problemRate
  const riskCore = problemRate
  const riskIndex = round1(clamp(problemRate, 0, maxRisk))
  const healthIndex = round1(clamp(problemRate, 0, 100))

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
    consultationWeightedNegativeRate: consultationNegativeRate,
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
          healthIndex: round1(currentPoint.healthIndex - previousPoint.healthIndex),
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
  const zones = normalizeZones(options.zones)

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

  const bucketBaselineCalls = median(
    orderedBucketRollups
      .map((bucket) => bucket.rollup.totalCalls)
      .filter((count) => count > 0)
  )

  const buckets: ProductSituationBucket[] = orderedBucketRollups.map((bucket) => {
    const riskMetrics = computeRiskMetrics(bucket.rollup, bucketBaselineCalls, zones.max)

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

  const orderedDomainRollups = Array.from(domainMap.values()).map((domain) => ({
    label: domain.label,
    rollup: summarizeCases(domain.cases),
  }))

  const domainBaselineCalls = median(
    orderedDomainRollups
      .map((domain) => domain.rollup.totalCalls)
      .filter((count) => count > 0)
  )

  const domains = orderedDomainRollups
    .map<ProductSituationDomainPoint>((domain) => {
      const riskMetrics = computeRiskMetrics(domain.rollup, domainBaselineCalls, zones.max)

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
        zone: zoneByRisk(riskMetrics.riskIndex, zones),
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
    summary: buildSummary(buckets),
    drivers: buildDrivers(buckets),
  }
}

export function buildBubbleMatrixPoints(
  events: InsightEvent[],
  options?: BuildBubbleMatrixPointsOptions
): ProductBubblePoint[] {
  const zones = normalizeZones(options?.zones)
  const analytics = buildHealthIndexMetrics(events, {
    granularity: 'month',
    topDomainsLimit: Number.MAX_SAFE_INTEGER,
    zones: options?.zones,
  })

  return analytics.domains.map((domain) => ({
    id: domain.id,
    productGroup: domain.label,
    label: domain.label,
    totalCalls: domain.totalCalls,
    problemCallsUnique: domain.problemCallsUnique,
    problemRate: domain.problemRate,
    healthIndex: domain.healthIndex,
    riskIndex: domain.riskIndex,
    zone: zoneByRisk(domain.problemRate, zones),
    topDriverTag: domain.topDriverTag,
  }))
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
