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
  negativeRate: number
  weightedNegativeRate: number
  volumeWeight: number
  riskIndex: number
  healthIndex: number
  tagCounts: Record<ProductSituationTag, number>
  tagRates: Record<ProductSituationTag, number>
  consultationCalls: number
  consultationNegativeCalls: number
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
  negativeRate: number
  weightedNegativeRate: number
  volumeWeight: number
  riskIndex: number
  healthIndex: number
  zone: ProductSituationZone
  tagCounts: Record<ProductSituationTag, number>
  tagRates: Record<ProductSituationTag, number>
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

interface BucketAccumulator {
  date: string
  totalCalls: number
  tagCounts: Record<ProductSituationTag, number>
  consultationCalls: number
  consultationTagCounts: Record<ProductSituationTag, number>
}

interface DomainAccumulator {
  label: string
  totalCalls: number
  tagCounts: Record<ProductSituationTag, number>
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
  const yellowMax = clamp(
    zones?.yellowMax ?? DEFAULT_ZONES.yellowMax,
    greenMax,
    max
  )

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

function volumeWeight(totalCalls: number, baselineCalls: number) {
  if (totalCalls <= 0 || baselineCalls <= 0) {
    return 0.6
  }

  return round1(clamp(Math.sqrt(totalCalls / baselineCalls), 0.6, 1.8))
}

function healthFromRisk(riskIndex: number, maxRisk: number) {
  return round1(clamp(maxRisk - riskIndex, 0, 100))
}

function buildSummary(
  buckets: ProductSituationBucket[]
): ProductSituationExecutiveSummary {
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
    problematicCalls: current.negativeCalls,
    problematicRate: current.negativeRate,
    totalCalls: current.totalCalls,
  }

  const previousPoint: ProductSituationExecutiveSummaryPoint | null = previous
    ? {
        label: previous.date,
        healthIndex: previous.healthIndex,
        problematicCalls: previous.negativeCalls,
        problematicRate: previous.negativeRate,
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
  let totalNegativeCalls = 0

  for (const bucket of buckets) {
    totalNegativeCalls += bucket.negativeCalls
    for (const tag of PRODUCT_SITUATION_TAGS) {
      totalTagCounts[tag] += bucket.tagCounts[tag]
    }
  }

  return PRODUCT_SITUATION_TAGS.map<ProductSituationDriverRow>((tag) => {
    const contributionRate =
      totalNegativeCalls > 0
        ? round1((totalTagCounts[tag] / totalNegativeCalls) * 100)
        : 0
    const currentContributionRate =
      current.negativeCalls > 0
        ? round1((current.tagCounts[tag] / current.negativeCalls) * 100)
        : 0
    const previousContributionRate =
      previous && previous.negativeCalls > 0
        ? round1((previous.tagCounts[tag] / previous.negativeCalls) * 100)
        : currentContributionRate
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
    const bucketDate = toBucketDate(event.date, granularity)
    const bucket =
      bucketMap.get(bucketDate) ??
      {
        date: bucketDate,
        totalCalls: 0,
        tagCounts: buildEmptyTagCounts(),
        consultationCalls: 0,
        consultationTagCounts: buildEmptyTagCounts(),
      }

    bucket.totalCalls += 1

    const tag = event.tag as ProductSituationTag
    if (PRODUCT_SITUATION_TAGS.includes(tag)) {
      bucket.tagCounts[tag] += 1
    }

    if (event.dialogueType === 'Консультация') {
      bucket.consultationCalls += 1

      if (PRODUCT_SITUATION_TAGS.includes(tag)) {
        bucket.consultationTagCounts[tag] += 1
      }
    }

    bucketMap.set(bucketDate, bucket)

    const domain =
      domainMap.get(event.productGroup) ??
      {
        label: event.productGroup,
        totalCalls: 0,
        tagCounts: buildEmptyTagCounts(),
      }

    domain.totalCalls += 1

    if (PRODUCT_SITUATION_TAGS.includes(tag)) {
      domain.tagCounts[tag] += 1
    }

    domainMap.set(event.productGroup, domain)
  }

  const orderedBuckets = Array.from(bucketMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  const bucketBaselineCalls = median(
    orderedBuckets.map((bucket) => bucket.totalCalls).filter((count) => count > 0)
  )

  const buckets: ProductSituationBucket[] = orderedBuckets.map((bucket) => {
    const tagRates = toTagRates(bucket.tagCounts, bucket.totalCalls)
    const negativeCalls = sumTagCounts(bucket.tagCounts)
    const negativeRate =
      bucket.totalCalls > 0 ? round1((negativeCalls / bucket.totalCalls) * 100) : 0
    const weightedNegativeRate = weightedRate(tagRates)
    const currentVolumeWeight = volumeWeight(bucket.totalCalls, bucketBaselineCalls)
    const riskIndex = round1(
      clamp(weightedNegativeRate * currentVolumeWeight, 0, zones.max)
    )

    const consultationTagRates = toTagRates(
      bucket.consultationTagCounts,
      bucket.consultationCalls
    )
    const consultationNegativeCalls = sumTagCounts(bucket.consultationTagCounts)
    const consultationNegativeRate =
      bucket.consultationCalls > 0
        ? round1((consultationNegativeCalls / bucket.consultationCalls) * 100)
        : 0

    return {
      date: bucket.date,
      totalCalls: bucket.totalCalls,
      negativeCalls,
      negativeRate,
      weightedNegativeRate,
      volumeWeight: currentVolumeWeight,
      riskIndex,
      healthIndex: healthFromRisk(riskIndex, zones.max),
      tagCounts: bucket.tagCounts,
      tagRates,
      consultationCalls: bucket.consultationCalls,
      consultationNegativeCalls,
      consultationNegativeRate,
      consultationWeightedNegativeRate: weightedRate(consultationTagRates),
      consultationTagCounts: bucket.consultationTagCounts,
      consultationTagRates,
    }
  })

  const domainBaselineCalls = median(
    Array.from(domainMap.values())
      .map((domain) => domain.totalCalls)
      .filter((count) => count > 0)
  )

  const domains = Array.from(domainMap.values())
    .map<ProductSituationDomainPoint>((domain) => {
      const tagRates = toTagRates(domain.tagCounts, domain.totalCalls)
      const negativeCalls = sumTagCounts(domain.tagCounts)
      const negativeRate =
        domain.totalCalls > 0
          ? round1((negativeCalls / domain.totalCalls) * 100)
          : 0
      const weightedNegativeRate = weightedRate(tagRates)
      const currentVolumeWeight = volumeWeight(domain.totalCalls, domainBaselineCalls)
      const riskIndex = round1(
        clamp(weightedNegativeRate * currentVolumeWeight, 0, zones.max)
      )

      return {
        id: `domain:${domain.label}`,
        label: domain.label,
        totalCalls: domain.totalCalls,
        negativeCalls,
        negativeRate,
        weightedNegativeRate,
        volumeWeight: currentVolumeWeight,
        riskIndex,
        healthIndex: healthFromRisk(riskIndex, zones.max),
        zone: zoneByRisk(riskIndex, zones),
        tagCounts: domain.tagCounts,
        tagRates,
      }
    })
    .sort((a, b) => {
      if (a.riskIndex !== b.riskIndex) {
        return b.riskIndex - a.riskIndex
      }

      if (a.negativeCalls !== b.negativeCalls) {
        return b.negativeCalls - a.negativeCalls
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
