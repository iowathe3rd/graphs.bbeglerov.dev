import type {
  EventRecord,
  OverlapGranularity,
  ProductGroup,
  Sector,
} from '@/lib/metrics-data'

export const PRODUCT_TAG_WEIGHTS = {
  'Технические проблемы/сбои': 0.2,
  'Запрос не решен': 0.3,
  'Отрицательный продуктовый фидбэк': 0.2,
  'Угроза ухода/отказа от продуктов банка': 0.3,
} as const

const METRIC_TO_TAG = {
  sla: 'Технические проблемы/сбои',
  aht: 'Запрос не решен',
  queueLoad: 'Отрицательный продуктовый фидбэк',
  abandonment: 'Угроза ухода/отказа от продуктов банка',
} as const

const POSITIVE_METRICS = new Set(['fcr', 'csat'])

const DEFAULT_HEALTH_THRESHOLDS = {
  greenMin: 85,
  yellowMin: 70,
}

export type ProductSituationTag = keyof typeof PRODUCT_TAG_WEIGHTS
export type ProductSituationMode = 'rate' | 'volume' | 'combo'
export type ProductSituationZone = 'green' | 'yellow' | 'red'
export type ProductSituationDriverTrend = 'up' | 'down' | 'flat'

export interface ProductSituationFilters {
  sector: Sector
  productGroup: ProductGroup | 'all'
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
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

export interface ProductSituationTagShare {
  tag: ProductSituationTag
  count: number
  rate: number
}

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

export interface ProductSituationBubblePoint {
  id: string
  productGroup: ProductGroup
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
  summary: ProductSituationExecutiveSummary
  drivers: ProductSituationDriverRow[]
}

export interface ProductSituationZones {
  greenMax: number
  yellowMax: number
  max: number
}

interface BuildProductSituationAnalyticsOptions {
  granularity: OverlapGranularity
  topDomainsLimit?: number
  zones?: Partial<ProductSituationZones>
}

interface BuildProductSituationBubblePointsOptions {
  zones?: Partial<ProductSituationZones>
  healthThresholds?: {
    greenMin: number
    yellowMin: number
  }
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

const DEFAULT_ZONES: ProductSituationZones = {
  greenMax: 10,
  yellowMax: 30,
  max: 100,
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function buildEmptyTagCounts() {
  return Object.fromEntries(
    PRODUCT_SITUATION_TAGS.map((tag) => [tag, 0])
  ) as Record<ProductSituationTag, number>
}

function buildEmptyTagFlags() {
  return Object.fromEntries(
    PRODUCT_SITUATION_TAGS.map((tag) => [tag, false])
  ) as Record<ProductSituationTag, boolean>
}

function toTagRates(
  tagCounts: Record<ProductSituationTag, number>,
  totalCalls: number
) {
  const result = buildEmptyTagCounts()

  if (totalCalls <= 0) {
    return result
  }

  for (const tag of PRODUCT_SITUATION_TAGS) {
    result[tag] = round1((tagCounts[tag] / totalCalls) * 100)
  }

  return result
}

function weightedRate(tagRates: Record<ProductSituationTag, number>) {
  let value = 0

  for (const tag of PRODUCT_SITUATION_TAGS) {
    value += tagRates[tag] * PRODUCT_TAG_WEIGHTS[tag]
  }

  return round1(value)
}

function sumTagCounts(tagCounts: Record<ProductSituationTag, number>) {
  return PRODUCT_SITUATION_TAGS.reduce((sum, tag) => sum + tagCounts[tag], 0)
}

function toBucketDate(dateKey: string, granularity: OverlapGranularity) {
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

function median(values: number[]) {
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

function normalizeZones(zones?: Partial<ProductSituationZones>) {
  const max = Math.max(1, zones?.max ?? DEFAULT_ZONES.max)
  const greenMax = clamp(zones?.greenMax ?? DEFAULT_ZONES.greenMax, 0, max)
  const yellowMax = clamp(zones?.yellowMax ?? DEFAULT_ZONES.yellowMax, greenMax, max)

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

function zoneByHealthIndex(
  healthIndex: number,
  thresholds: { greenMin: number; yellowMin: number }
): ProductSituationZone {
  if (healthIndex >= thresholds.greenMin) {
    return 'green'
  }

  if (healthIndex >= thresholds.yellowMin) {
    return 'yellow'
  }

  return 'red'
}

function volumeWeight(totalCalls: number, baselineCalls: number) {
  if (totalCalls <= 0 || baselineCalls <= 0) {
    return 0.6
  }

  return round1(clamp(Math.sqrt(totalCalls / baselineCalls), 0.6, 1.8))
}

function confidenceWeight(totalCalls: number) {
  if (totalCalls <= 0) {
    return 0.35
  }

  return round1(clamp(Math.sqrt(totalCalls) / Math.sqrt(400), 0.35, 1))
}

function healthFromRisk(riskIndex: number, maxRisk: number) {
  return round1(clamp(maxRisk - riskIndex, 0, 100))
}

function resolveTag(event: EventRecord): ProductSituationTag | null {
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
) {
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
  event: EventRecord,
  tag: ProductSituationTag | null
) {
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
  baselineCalls: number,
  maxRisk: number
): RiskMetrics {
  const problemRate =
    rollup.totalCalls > 0
      ? round1((rollup.problemCallsUnique / rollup.totalCalls) * 100)
      : 0

  const tagRates = toTagRates(rollup.tagCounts, rollup.totalCalls)
  const weightedNegativeRate = weightedRate(tagRates)

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

  const currentVolumeWeight = volumeWeight(rollup.totalCalls, baselineCalls)
  const confidence = confidenceWeight(rollup.totalCalls)
  const severityRate = weightedNegativeRate
  const riskCore = round1(
    0.65 * severityRate +
      0.35 * problemRate +
      0.15 * (100 - consultationCleanRate)
  )
  const riskIndex = round1(
    clamp(riskCore * currentVolumeWeight * confidence, 0, maxRisk)
  )

  return {
    problemRate,
    weightedNegativeRate,
    severityRate,
    volumeWeight: currentVolumeWeight,
    confidence,
    riskCore,
    riskIndex,
    healthIndex: healthFromRisk(riskIndex, maxRisk),
    tagRates,
    consultationNegativeRate,
    consultationCleanRate,
    consultationWeightedNegativeRate: weightedRate(consultationTagRates),
    consultationTagRates,
  }
}

function topDriverTag(tagCounts: Record<ProductSituationTag, number>) {
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

function buildDrivers(buckets: ProductSituationBucket[]) {
  if (buckets.length === 0) {
    return [] as ProductSituationDriverRow[]
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

function normalizeHealthThresholds(
  thresholds?: BuildProductSituationBubblePointsOptions['healthThresholds']
) {
  const greenMin = clamp(
    thresholds?.greenMin ?? DEFAULT_HEALTH_THRESHOLDS.greenMin,
    0,
    100
  )
  const yellowMin = clamp(
    thresholds?.yellowMin ?? DEFAULT_HEALTH_THRESHOLDS.yellowMin,
    0,
    greenMin
  )

  return {
    greenMin,
    yellowMin,
  }
}

export function buildProductSituationAnalytics(
  events: EventRecord[],
  options: BuildProductSituationAnalyticsOptions
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

export function buildProductSituationBubblePoints(
  events: EventRecord[],
  options?: BuildProductSituationBubblePointsOptions
): ProductSituationBubblePoint[] {
  const thresholds = normalizeHealthThresholds(options?.healthThresholds)
  const analytics = buildProductSituationAnalytics(events, {
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
    zone: zoneByHealthIndex(domain.healthIndex, thresholds),
    topDriverTag: domain.topDriverTag,
  }))
}
