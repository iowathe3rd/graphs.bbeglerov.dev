export type Sector = 'БММБ' | 'РБ' | 'КРС' | 'КСБ'
export type MetricCategory = 'service' | 'operations' | 'risk'
export type MetricDirection = 'higher-better' | 'lower-better'
export type MetricFormat = 'percent' | 'seconds' | 'count'
export type ProductGroup =
  | 'Платежи'
  | 'Кредитование'
  | 'Сбережения'
  | 'Карты'
  | 'Цифровые сервисы'
export type SubProduct = string
export type EventStage = 'Intake' | 'Routing' | 'Work' | 'Resolve'
export type EventStatus = 'resolved' | 'pending' | 'escalated'
export type SankeyNodeType = 'channel' | 'process' | 'status'

export interface MetricDataPoint {
  date: string
  value: number
}

export interface MetricInfo {
  id: string
  name: string
  description: string
  unit: string
  category: MetricCategory
  direction: MetricDirection
  format: MetricFormat
  thresholds: {
    low: number
    medium: number
    high: number
  }
  color: string
}

export interface EventRecord {
  id: string
  caseId: string
  timestamp: string
  date: string
  hour: number
  sector: Sector
  channel: string
  process: string
  productGroup: ProductGroup
  subProduct: SubProduct
  metric: string
  value: number
  stage: EventStage
  status: EventStatus
  slaBreach: boolean
  anomaly: boolean
}

export interface HeatmapCell {
  hour: number
  channel: string
  count: number
  slaBreaches: number
}

export interface SankeyNode {
  name: string
  nodeType: SankeyNodeType
  key: string
}

export interface SankeyLink {
  source: number
  target: number
  value: number
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export interface FunnelStageData {
  stage: EventStage
  count: number
  conversion: number
  dropOff: number
}

export interface DetailedRecord {
  id: string
  date: string
  clientId: string
  metric: string
  value: number
  sector: Sector
  process: string
  product: string
  productGroup: ProductGroup
  subProduct: SubProduct
  stage: EventStage
  hour: number
  channel: string
  tags: string[]
  status: EventStatus
  description: string
}

export const SECTORS: Sector[] = ['БММБ', 'РБ', 'КРС', 'КСБ']

export const CHANNELS = [
  'Колл-центр',
  'Мобильный банк',
  'Отделение',
  'Онлайн-банк',
] as const

export const PROCESSES = [
  'Идентификация',
  'Платежи',
  'Карты',
  'Кредиты',
  'Депозиты',
  'Сервисы ДБО',
  'Счета ФЛ/ЮЛ',
  'Эскалации',
] as const

export const PRODUCT_GROUPS: ProductGroup[] = [
  'Платежи',
  'Кредитование',
  'Сбережения',
  'Карты',
  'Цифровые сервисы',
]

export const SUB_PRODUCTS_BY_GROUP: Record<ProductGroup, readonly SubProduct[]> = {
  Платежи: ['P2P переводы', 'Межбанк', 'Коммунальные', 'SWIFT'],
  Кредитование: ['Потребкредит', 'Кредитная линия', 'Ипотека'],
  Сбережения: ['Депозит стандарт', 'Накопительный счет', 'Вклад премиум'],
  Карты: ['Debit Classic', 'Premium Card', 'Virtual Card', 'Business Card'],
  'Цифровые сервисы': ['Mobile App', 'Web Banking', 'API Кабинет', 'Bot Support'],
}

export const FUNNEL_STAGES: readonly EventStage[] = [
  'Intake',
  'Routing',
  'Work',
  'Resolve',
]

export const EVENT_STATUSES: readonly EventStatus[] = [
  'resolved',
  'pending',
  'escalated',
]

const PROCESS_BY_SECTOR: Record<Sector, readonly string[]> = {
  БММБ: ['Карты', 'Платежи', 'Депозиты'],
  РБ: ['Идентификация', 'Сервисы ДБО', 'Эскалации'],
  КРС: ['Кредиты', 'Платежи', 'Эскалации'],
  КСБ: ['Счета ФЛ/ЮЛ', 'Платежи', 'Эскалации'],
}

const PROCESS_BY_PRODUCT_GROUP: Record<ProductGroup, readonly string[]> = {
  Платежи: ['Платежи', 'Эскалации'],
  Кредитование: ['Кредиты', 'Идентификация', 'Эскалации'],
  Сбережения: ['Депозиты', 'Счета ФЛ/ЮЛ'],
  Карты: ['Карты', 'Платежи', 'Эскалации'],
  'Цифровые сервисы': ['Сервисы ДБО', 'Идентификация', 'Эскалации'],
}

const STAGE_BY_INDEX: readonly EventStage[] = ['Intake', 'Routing', 'Work', 'Resolve']

export const METRICS: Record<string, MetricInfo> = {
  sla: {
    id: 'sla',
    name: 'SLA',
    description: 'Доля обращений в SLA',
    unit: '%',
    category: 'service',
    direction: 'higher-better',
    format: 'percent',
    thresholds: { low: 75, medium: 85, high: 95 },
    color: 'hsl(var(--chart-1))',
  },
  aht: {
    id: 'aht',
    name: 'AHT',
    description: 'Среднее время обработки',
    unit: 'с',
    category: 'operations',
    direction: 'lower-better',
    format: 'seconds',
    thresholds: { low: 380, medium: 300, high: 220 },
    color: 'hsl(var(--chart-2))',
  },
  fcr: {
    id: 'fcr',
    name: 'FCR',
    description: 'Решение с первого контакта',
    unit: '%',
    category: 'service',
    direction: 'higher-better',
    format: 'percent',
    thresholds: { low: 55, medium: 70, high: 82 },
    color: 'hsl(var(--chart-3))',
  },
  csat: {
    id: 'csat',
    name: 'CSAT',
    description: 'Удовлетворенность клиентов',
    unit: '%',
    category: 'service',
    direction: 'higher-better',
    format: 'percent',
    thresholds: { low: 70, medium: 82, high: 90 },
    color: 'hsl(var(--chart-4))',
  },
  queueLoad: {
    id: 'queueLoad',
    name: 'Queue Load',
    description: 'Средняя загрузка очереди',
    unit: '%',
    category: 'operations',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 68, medium: 52, high: 35 },
    color: 'hsl(var(--chart-5))',
  },
  abandonment: {
    id: 'abandonment',
    name: 'Abandonment',
    description: 'Доля пропущенных обращений',
    unit: '%',
    category: 'risk',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 15, medium: 9, high: 5 },
    color: 'hsl(var(--chart-6))',
  },
}

const MOCK_ANCHOR_DATE = new Date('2026-02-01T00:00:00.000Z')

function mulberry32(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(input: string) {
  let hash = 0

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

function seeded(seed: number, key: string) {
  return mulberry32(seed + hashString(key))
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)]
}

function weightedStage(random: () => number): EventStage {
  const value = random()

  if (value < 0.28) {
    return 'Intake'
  }

  if (value < 0.54) {
    return 'Routing'
  }

  if (value < 0.78) {
    return 'Work'
  }

  return 'Resolve'
}

function stageIndex(stage: EventStage) {
  return STAGE_BY_INDEX.indexOf(stage)
}

function metricBaseline(metric: MetricInfo) {
  return (metric.thresholds.low + metric.thresholds.medium) / 2
}

function sectorFactor(sector: Sector) {
  switch (sector) {
    case 'БММБ':
      return 1
    case 'РБ':
      return 0.97
    case 'КРС':
      return 1.07
    case 'КСБ':
      return 1.03
    default:
      return 1
  }
}

function formatMetricValue(metric: MetricInfo, raw: number) {
  if (metric.format === 'seconds') {
    return Math.round(raw)
  }

  return Math.round(raw * 10) / 10
}

function randomDateAndHour(random: () => number, days: number) {
  const date = new Date(MOCK_ANCHOR_DATE)
  const dayOffset = Math.floor(random() * days)
  const hour = Math.floor(random() * 24)
  const minute = Math.floor(random() * 60)

  date.setUTCDate(date.getUTCDate() - dayOffset)
  date.setUTCHours(hour, minute, 0, 0)

  return { date, hour }
}

function buildMetricValue(metricInfo: MetricInfo, random: () => number, sector: Sector, stage: EventStage) {
  const base = metricBaseline(metricInfo) * sectorFactor(sector)
  const range = metricInfo.format === 'seconds' ? 180 : 24
  const stagePenalty = stage === 'Resolve' ? -0.06 : stage === 'Work' ? 0 : 0.08
  const noise = (random() - 0.5) * (range * 0.4)
  const raw = base + noise + base * stagePenalty

  if (metricInfo.format === 'seconds') {
    return formatMetricValue(metricInfo, clamp(raw, 90, 560))
  }

  return formatMetricValue(metricInfo, clamp(raw, 1, 99))
}

function buildStatus(stage: EventStage, random: () => number): EventStatus {
  if (stage === 'Resolve') {
    const value = random()

    if (value < 0.86) {
      return 'resolved'
    }

    return value < 0.95 ? 'pending' : 'escalated'
  }

  return random() < 0.78 ? 'pending' : 'escalated'
}

function buildDescription(event: Pick<EventRecord, 'process' | 'status' | 'stage'>) {
  if (event.status === 'escalated') {
    return `Эскалация на этапе ${event.stage}`
  }

  if (event.status === 'resolved') {
    return `Завершено по процессу ${event.process}`
  }

  return `В работе: ${event.process}`
}

function buildDayKeys(days: number) {
  const keys: string[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(MOCK_ANCHOR_DATE)
    date.setUTCDate(date.getUTCDate() - i)
    keys.push(date.toISOString().slice(0, 10))
  }

  return keys
}

function getAllSubProducts() {
  const values: string[] = []

  for (const group of PRODUCT_GROUPS) {
    for (const subProduct of SUB_PRODUCTS_BY_GROUP[group]) {
      values.push(subProduct)
    }
  }

  return values
}

const ALL_SUB_PRODUCTS = getAllSubProducts()

export function generateEventStream(
  count = 20000,
  days = 180,
  seed = 42,
  sector?: Sector
): EventRecord[] {
  const random = seeded(seed, `events:${sector ?? 'all'}:${count}:${days}`)
  const availableSectors = sector ? [sector] : [...SECTORS]
  const metricIds = Object.keys(METRICS)
  const casePool = Math.max(Math.floor(count * 0.38), 1800)
  const stream: EventRecord[] = []

  for (let index = 0; index < count; index += 1) {
    const currentSector = pick(availableSectors, random)
    const productGroup = pick(PRODUCT_GROUPS, random)
    const subProduct = pick(SUB_PRODUCTS_BY_GROUP[productGroup], random)

    const sectorProcesses = PROCESS_BY_SECTOR[currentSector]
    const productProcesses = PROCESS_BY_PRODUCT_GROUP[productGroup]
    const candidateProcesses = sectorProcesses.filter((process) =>
      productProcesses.includes(process)
    )

    const process =
      candidateProcesses.length > 0
        ? pick(candidateProcesses, random)
        : pick(sectorProcesses, random)

    const metricId = pick(metricIds, random)
    const metricInfo = METRICS[metricId]
    const stage = weightedStage(random)
    const status = buildStatus(stage, random)
    const { date: eventDate, hour } = randomDateAndHour(random, days)
    const value = buildMetricValue(metricInfo, random, currentSector, stage)

    const slaBreach =
      status !== 'resolved' ||
      (metricId === 'sla' && value < metricInfo.thresholds.medium) ||
      (metricId === 'aht' && value > metricInfo.thresholds.medium) ||
      (metricId === 'abandonment' && value > metricInfo.thresholds.medium)

    const anomaly =
      random() > 0.986 ||
      (status === 'escalated' && random() > 0.52) ||
      (slaBreach && random() > 0.88)

    stream.push({
      id: `EVT-${String(index + 1).padStart(7, '0')}`,
      caseId: `CASE-${String(1 + Math.floor(random() * casePool)).padStart(6, '0')}`,
      timestamp: eventDate.toISOString(),
      date: eventDate.toISOString().slice(0, 10),
      hour,
      sector: currentSector,
      channel: pick(CHANNELS, random),
      process,
      productGroup,
      subProduct,
      metric: metricId,
      value,
      stage,
      status,
      slaBreach,
      anomaly,
    })
  }

  return stream.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function generateMetricsDataFromEvents(events: EventRecord[], days = 180) {
  const dayKeys = buildDayKeys(days)
  const dayLookup = new Set(dayKeys)
  const metricIds = Object.keys(METRICS)

  const buckets = new Map<string, { sum: number; count: number }>()

  for (const event of events) {
    if (!dayLookup.has(event.date)) {
      continue
    }

    const key = `${event.metric}|${event.date}`
    const current = buckets.get(key)

    if (current) {
      current.sum += event.value
      current.count += 1
      continue
    }

    buckets.set(key, { sum: event.value, count: 1 })
  }

  const result: Record<string, MetricDataPoint[]> = {}

  for (const metricId of metricIds) {
    const metric = METRICS[metricId]
    const fallback = metricBaseline(metric)
    let previous = fallback

    result[metricId] = dayKeys.map((day) => {
      const bucket = buckets.get(`${metricId}|${day}`)

      if (bucket && bucket.count > 0) {
        previous = formatMetricValue(metric, bucket.sum / bucket.count)
      }

      return {
        date: day,
        value: formatMetricValue(metric, previous),
      }
    })
  }

  return result
}

export function generateAllMetricsData(days = 30, seed = 42, sector?: Sector) {
  const events = generateEventStream(Math.max(days * 90, 4000), days, seed, sector)
  return generateMetricsDataFromEvents(events, days)
}

export function generateHeatmapData(
  events: EventRecord[],
  options: { axisX: 'hour'; axisY: 'channel' } = { axisX: 'hour', axisY: 'channel' }
): HeatmapCell[] {
  if (options.axisX !== 'hour' || options.axisY !== 'channel') {
    return []
  }

  const buckets = new Map<string, HeatmapCell>()

  for (const channel of CHANNELS) {
    for (let hour = 0; hour < 24; hour += 1) {
      buckets.set(`${channel}|${hour}`, {
        hour,
        channel,
        count: 0,
        slaBreaches: 0,
      })
    }
  }

  for (const event of events) {
    const key = `${event.channel}|${event.hour}`
    const cell = buckets.get(key)

    if (!cell) {
      continue
    }

    cell.count += 1

    if (event.slaBreach) {
      cell.slaBreaches += 1
    }
  }

  const result: HeatmapCell[] = []

  for (const channel of CHANNELS) {
    for (let hour = 0; hour < 24; hour += 1) {
      const cell = buckets.get(`${channel}|${hour}`)
      if (cell) {
        result.push(cell)
      }
    }
  }

  return result
}

function latestEventsByCase(events: EventRecord[]) {
  const byCase = new Map<string, EventRecord>()

  for (const event of events) {
    if (!byCase.has(event.caseId)) {
      byCase.set(event.caseId, event)
      continue
    }

    const current = byCase.get(event.caseId)

    if (current && event.timestamp > current.timestamp) {
      byCase.set(event.caseId, event)
    }
  }

  return Array.from(byCase.values())
}

export function generateSankeyData(
  events: EventRecord[],
  options: { flow: 'channel-process-status' } = { flow: 'channel-process-status' }
): SankeyData {
  if (options.flow !== 'channel-process-status') {
    return { nodes: [], links: [] }
  }

  const latestEvents = latestEventsByCase(events)
  const nodes: SankeyNode[] = []
  const nodeIndexByKey = new Map<string, number>()
  const linkValueByKey = new Map<string, number>()

  const ensureNode = (nodeType: SankeyNodeType, value: string) => {
    const key = `${nodeType}:${value}`
    const existing = nodeIndexByKey.get(key)

    if (existing !== undefined) {
      return existing
    }

    const index = nodes.length

    nodes.push({
      name: value,
      nodeType,
      key,
    })

    nodeIndexByKey.set(key, index)

    return index
  }

  for (const event of latestEvents) {
    const channelIndex = ensureNode('channel', event.channel)
    const processIndex = ensureNode('process', event.process)
    const statusIndex = ensureNode('status', event.status)

    const channelToProcessKey = `${channelIndex}->${processIndex}`
    const processToStatusKey = `${processIndex}->${statusIndex}`

    linkValueByKey.set(channelToProcessKey, (linkValueByKey.get(channelToProcessKey) ?? 0) + 1)
    linkValueByKey.set(processToStatusKey, (linkValueByKey.get(processToStatusKey) ?? 0) + 1)
  }

  const links: SankeyLink[] = []

  for (const [key, value] of linkValueByKey.entries()) {
    const [source, target] = key.split('->').map((entry) => Number(entry))

    links.push({
      source,
      target,
      value,
    })
  }

  return { nodes, links }
}

export function generateFunnelData(
  events: EventRecord[],
  options: { stages: readonly EventStage[] } = { stages: FUNNEL_STAGES }
): FunnelStageData[] {
  const stages = options.stages
  const maxStageByCase = new Map<string, number>()

  for (const event of events) {
    const index = stageIndex(event.stage)

    if (index < 0) {
      continue
    }

    const current = maxStageByCase.get(event.caseId)

    if (current === undefined || index > current) {
      maxStageByCase.set(event.caseId, index)
    }
  }

  const stageCounts = new Array(stages.length).fill(0)

  for (const maxStage of maxStageByCase.values()) {
    for (let index = 0; index <= maxStage && index < stageCounts.length; index += 1) {
      stageCounts[index] += 1
    }
  }

  const firstCount = stageCounts[0] || 1

  return stages.map((stage, index) => {
    const count = stageCounts[index]
    const previous = index === 0 ? count : stageCounts[index - 1]

    return {
      stage,
      count,
      conversion: Number(((count / firstCount) * 100).toFixed(1)),
      dropOff: index === 0 || previous === 0 ? 0 : Number((((previous - count) / previous) * 100).toFixed(1)),
    }
  })
}

export function generateDetailedRecords(
  count = 50,
  seed = 42,
  sector?: Sector,
  sourceEvents?: EventRecord[]
): DetailedRecord[] {
  const events =
    sourceEvents ??
    generateEventStream(Math.max(count * 4, 1200), 180, seed, sector)

  return events.slice(0, count).map((event, index) => ({
    id: `REC-${String(index + 1).padStart(5, '0')}`,
    date: event.date,
    clientId: event.caseId,
    metric: event.metric,
    value: event.value,
    sector: event.sector,
    process: event.process,
    product: event.subProduct,
    productGroup: event.productGroup,
    subProduct: event.subProduct,
    stage: event.stage,
    hour: event.hour,
    channel: event.channel,
    tags: [event.sector, event.process, event.productGroup],
    status: event.status,
    description: buildDescription(event),
  }))
}

export { ALL_SUB_PRODUCTS }
