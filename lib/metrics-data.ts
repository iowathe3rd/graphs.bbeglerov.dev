export type Sector = 'БММБ' | 'РБ' | 'КРС' | 'КСБ'
export type MetricCategory = 'service' | 'operations' | 'risk'
export type MetricDirection = 'higher-better' | 'lower-better'
export type MetricFormat = 'percent' | 'seconds' | 'count'
export type ProductGroup = string
export type SubProduct = string
export type Language = 'kk' | 'ru'
export type ContactDirection = 'Внутренний' | 'Входящий'
export type DialogueType = 'Консультация' | 'Претензия'
export type EventStage = 'Intake' | 'Routing' | 'Work' | 'Resolve'
export type EventStatus = 'resolved' | 'pending' | 'escalated'
export type SankeyNodeType = 'channel' | 'process' | 'status'
export type OverlapDimension = 'domain' | 'indicator'
export type OverlapGranularity = 'day' | 'week' | 'month'
export type OverlapZone = 'green' | 'yellow' | 'red'
export type OverlapZoneFilter = 'all' | OverlapZone
export type OverlapSeriesSelectionMode = 'single' | 'multiple'
type EventScenario =
  | 'steady'
  | 'seasonal-peak'
  | 'backlog'
  | 'incident'
  | 'fraud-watch'
  | 'recovery'

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
  category: string
  subProduct: SubProduct
  language: Language
  operator: string
  direction: ContactDirection
  dialogueType: DialogueType
  tag: string
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

export interface OverlapSnapshotPoint {
  id: string
  label: string
  dimension: OverlapDimension
  totalCases: number
  intersections: number
  overlapRate: number
  zone: OverlapZone
}

export interface OverlapTimelinePoint {
  date: string
  label: string
  dimension: OverlapDimension
  totalCases: number
  intersections: number
  overlapRate: number
  zone: OverlapZone
}

export interface OverlapTimelineSeries {
  id: string
  label: string
  dimension: OverlapDimension
  totalCases: number
  intersections: number
  overlapRate: number
  zone: OverlapZone
  points: OverlapTimelinePoint[]
}

export interface OverlapAnalytics {
  dimension: OverlapDimension
  granularity: OverlapGranularity
  snapshot: OverlapSnapshotPoint[]
  timeline: OverlapTimelineSeries[]
}

export interface OverlapBucketSummary {
  date: string
  zoneCounts: {
    green: number
    yellow: number
    red: number
  }
  seriesValues: Record<string, number>
  sortedSeries: Array<{
    label: string
    value: number
    zone: OverlapZone
  }>
}

export interface OverlapZoneConfig {
  greenMax: number
  yellowMax: number
  max?: number
}

export interface OverlapValueTransformContext {
  label: string
  date: string
  avgOverlapRate: number
  loadShare: number
  totalCases: number
  bucketTotalCases: number
  zones: Required<OverlapZoneConfig>
}

export interface OverlapBucketsOptions {
  granularity: OverlapGranularity
  visibleSeriesLimit: number
  selectedSeries?: string[]
  zones?: OverlapZoneConfig
  valueTransform?: (ctx: OverlapValueTransformContext) => number
}

export interface OverlapFromMetricSeriesParams {
  metricSeries: Record<string, MetricDataPoint[]>
  metricIds: string[]
  metricsMap: Record<string, MetricInfo>
  granularity: OverlapGranularity
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
  category: string
  subProduct: SubProduct
  language: Language
  operator: string
  direction: ContactDirection
  dialogueType: DialogueType
  tag: string
  stage: EventStage
  hour: number
  channel: string
  tags: string[]
  status: EventStatus
  description: string
}

export const SECTORS: Sector[] = ['РБ']

export const CHANNELS = [
  'Колл-центр',
  'Мобильный банк',
  'Отделение',
  'Онлайн-банк',
] as const

export const PRODUCT_GROUPS = [
  'Автокредитование',
  'Платежные карты',
  'Депозиты',
  'Ипотека',
  'Кредит без залога онлайн',
  'Под залог недвижимости',
  'Бонусы',
  'МП Bereke',
  'Переводы',
  'Премиум карта',
] as const

export const CATEGORIES_BY_PRODUCT: Record<ProductGroup, readonly string[]> = {
  Автокредитование: [
    'Оформление',
    'График платежей',
    'Досрочное погашение',
  ],
  'Платежные карты': [
    'Выпуск карты',
    'Лимиты и комиссии',
    'Блокировка/разблокировка',
  ],
  Депозиты: [
    'Открытие депозита',
    'Пополнение',
    'Закрытие депозита',
  ],
  Ипотека: [
    'Подача заявки',
    'Одобрение и условия',
    'Сопровождение ипотеки',
  ],
  'Кредит без залога онлайн': [
    'Подача заявки',
    'Статус заявки',
    'Погашение кредита',
  ],
  'Под залог недвижимости': [
    'Подача заявки',
    'Оценка залога',
    'Обслуживание кредита',
  ],
  Бонусы: ['Начисление бонусов', 'Списание бонусов', 'Проверка баланса'],
  'МП Bereke': [
    'Вход и авторизация',
    'Технические проблемы/сбои',
    'Настройки и уведомления',
  ],
  Переводы: [
    'Переводы между счетами',
    'Межбанковские переводы',
    'Международные переводы',
  ],
  'Премиум карта': ['Выпуск карты', 'Привилегии', 'Обслуживание карты'],
}

export const SUB_PRODUCTS_BY_GROUP: Record<ProductGroup, readonly SubProduct[]> = {
  Автокредитование: [
    'Новый авто',
    'Авто с пробегом',
    'Рефинансирование',
  ],
  'Платежные карты': [
    'Дебетовая карта',
    'Кредитная карта',
    'Виртуальная карта',
  ],
  Депозиты: [
    'Срочный депозит',
    'Накопительный депозит',
    'Детский депозит',
  ],
  Ипотека: [
    'Первичное жилье',
    'Вторичное жилье',
    'Рефинансирование ипотеки',
  ],
  'Кредит без залога онлайн': [
    'На личные цели',
    'Рефинансирование',
    'Покупка техники',
  ],
  'Под залог недвижимости': [
    'Квартира',
    'Дом',
    'Коммерческая недвижимость',
  ],
  Бонусы: ['Бонусы за покупки', 'Кэшбэк', 'Партнерские бонусы'],
  'МП Bereke': [
    'Главная страница',
    'Платежи',
    'История операций',
  ],
  Переводы: [
    'По номеру телефона',
    'По реквизитам',
    'SWIFT',
  ],
  'Премиум карта': ['Infinite', 'Signature', 'Platinum'],
}

export const PROCESSES = Array.from(
  new Set(PRODUCT_GROUPS.flatMap((group) => CATEGORIES_BY_PRODUCT[group]))
) as string[]

export const LANGUAGES: readonly Language[] = ['kk', 'ru']

export const OPERATORS = [
  'Аббас Ануар Талғатұлы',
  'Абдугапбар Аружан Асқарқызы',
  'Ярмухамедова Санам Туйгунжановна',
] as const

export const DIRECTIONS: readonly ContactDirection[] = ['Внутренний', 'Входящий']

export const DIALOGUE_TYPES: readonly DialogueType[] = [
  'Консультация',
  'Претензия',
]

export const CONTACT_TAGS = [
  'Технические проблемы/сбои',
  'Запрос не решен',
  'Отрицательный продуктовый фидбэк',
  'Угроза ухода/отказа от продуктов банка',
] as const

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
  РБ: [
    'Технические проблемы/сбои',
    'Подача заявки',
    'Выпуск карты',
  ],
  БММБ: ['Технические проблемы/сбои'],
  КРС: ['Подача заявки'],
  КСБ: ['Выпуск карты'],
}

const STAGE_BY_INDEX: readonly EventStage[] = ['Intake', 'Routing', 'Work', 'Resolve']
const MAX_INTERSECTION_SCORE = 6
const EVENT_SCENARIOS: readonly EventScenario[] = [
  'steady',
  'seasonal-peak',
  'backlog',
  'incident',
  'fraud-watch',
  'recovery',
]
const PROCESS_STRESS: Record<string, number> = {
  Антифрод: 0.33,
  'Технические ошибки при входе в Bereke Business': 0.31,
  'Ошибки при подписании платежного поручения': 0.28,
  'Проблемы с биометрией': 0.3,
  'Классическое кредитование': 0.22,
  'Посткредитное обслуживание (скоринг)': 0.2,
  'Входящие переводы в тенге: ожидание возврата от БВУ': 0.24,
  'Информация по действующему POS-терминалу': 0.17,
  'Выпуск банковской гарантии': 0.15,
  'FX-платформа': 0.18,
}
const CHANNEL_STRESS: Record<string, number> = {
  'Колл-центр': 0.14,
  'Мобильный банк': 0.17,
  Отделение: 0.08,
  'Онлайн-банк': 0.22,
}
const SCENARIO_STRESS: Record<EventScenario, number> = {
  steady: 0.02,
  'seasonal-peak': 0.16,
  backlog: 0.24,
  incident: 0.31,
  'fraud-watch': 0.38,
  recovery: -0.08,
}
const SCENARIO_VOLATILITY: Record<EventScenario, number> = {
  steady: 0.22,
  'seasonal-peak': 0.36,
  backlog: 0.43,
  incident: 0.5,
  'fraud-watch': 0.62,
  recovery: 0.27,
}

export const METRICS: Record<string, MetricInfo> = {
  sla: {
    id: 'sla',
    name: 'Технические проблемы/сбои',
    description: 'Доля обращений с техническими сбоями',
    unit: '%',
    category: 'operations',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 28, medium: 18, high: 10 },
    color: '#2563eb',
  },
  aht: {
    id: 'aht',
    name: 'Запрос не решен',
    description: 'Доля нерешенных запросов',
    unit: '%',
    category: 'service',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 24, medium: 14, high: 8 },
    color: '#f97316',
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
    name: 'Отрицательный продуктовый фидбэк',
    description: 'Доля негативной обратной связи по продуктам',
    unit: '%',
    category: 'risk',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 20, medium: 12, high: 6 },
    color: '#0f766e',
  },
  abandonment: {
    id: 'abandonment',
    name: 'Угроза ухода/отказа от продуктов банка',
    description: 'Доля обращений с риском ухода клиента',
    unit: '%',
    category: 'risk',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 16, medium: 9, high: 4 },
    color: '#64748b',
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

function pickWeighted<T>(
  entries: ReadonlyArray<{ value: T; weight: number }>,
  random: () => number
): T {
  let sum = 0

  for (const entry of entries) {
    sum += Math.max(0, entry.weight)
  }

  if (sum <= 0) {
    return entries[0]?.value as T
  }

  const threshold = random() * sum
  let cursor = 0

  for (const entry of entries) {
    cursor += Math.max(0, entry.weight)

    if (threshold <= cursor) {
      return entry.value
    }
  }

  return entries[entries.length - 1]?.value as T
}

function pickScenario(random: () => number): EventScenario {
  const value = random()

  if (value < 0.32) {
    return 'steady'
  }

  if (value < 0.52) {
    return 'seasonal-peak'
  }

  if (value < 0.72) {
    return 'backlog'
  }

  if (value < 0.86) {
    return 'incident'
  }

  if (value < 0.94) {
    return 'fraud-watch'
  }

  return EVENT_SCENARIOS[EVENT_SCENARIOS.length - 1]
}

function pickHourByScenario(random: () => number, scenario: EventScenario) {
  const rnd = random()

  if (scenario === 'fraud-watch') {
    if (rnd < 0.42) {
      return Math.floor(random() * 6)
    }

    if (rnd < 0.78) {
      return 21 + Math.floor(random() * 3)
    }

    return Math.floor(random() * 24)
  }

  if (scenario === 'incident' || scenario === 'backlog') {
    if (rnd < 0.36) {
      return 8 + Math.floor(random() * 4)
    }

    if (rnd < 0.74) {
      return 12 + Math.floor(random() * 7)
    }

    return Math.floor(random() * 24)
  }

  if (rnd < 0.31) {
    return 9 + Math.floor(random() * 4)
  }

  if (rnd < 0.63) {
    return 13 + Math.floor(random() * 5)
  }

  if (rnd < 0.82) {
    return 18 + Math.floor(random() * 3)
  }

  return Math.floor(random() * 24)
}

function pickDayOffset(random: () => number, days: number, scenario: EventScenario) {
  const horizon = Math.max(days, 1)
  const rnd = random()

  if (scenario === 'incident' || scenario === 'backlog') {
    if (rnd < 0.67) {
      return Math.floor(Math.pow(random(), 2.1) * horizon)
    }

    if (rnd < 0.87) {
      return Math.floor(random() * Math.min(horizon, 42))
    }

    return Math.floor(random() * horizon)
  }

  if (scenario === 'recovery') {
    if (rnd < 0.45) {
      return Math.floor((0.2 + random() * 0.8) * horizon)
    }

    return Math.floor(random() * horizon)
  }

  if (rnd < 0.56) {
    return Math.floor(Math.pow(random(), 1.35) * horizon)
  }

  return Math.floor(random() * horizon)
}

function weightedStage(random: () => number, scenario: EventScenario): EventStage {
  switch (scenario) {
    case 'backlog':
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.38 },
          { value: 'Routing', weight: 0.3 },
          { value: 'Work', weight: 0.24 },
          { value: 'Resolve', weight: 0.08 },
        ],
        random
      )
    case 'incident':
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.3 },
          { value: 'Routing', weight: 0.28 },
          { value: 'Work', weight: 0.3 },
          { value: 'Resolve', weight: 0.12 },
        ],
        random
      )
    case 'recovery':
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.18 },
          { value: 'Routing', weight: 0.22 },
          { value: 'Work', weight: 0.24 },
          { value: 'Resolve', weight: 0.36 },
        ],
        random
      )
    case 'fraud-watch':
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.25 },
          { value: 'Routing', weight: 0.33 },
          { value: 'Work', weight: 0.28 },
          { value: 'Resolve', weight: 0.14 },
        ],
        random
      )
    case 'seasonal-peak':
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.29 },
          { value: 'Routing', weight: 0.31 },
          { value: 'Work', weight: 0.25 },
          { value: 'Resolve', weight: 0.15 },
        ],
        random
      )
    default:
      return pickWeighted(
        [
          { value: 'Intake', weight: 0.24 },
          { value: 'Routing', weight: 0.28 },
          { value: 'Work', weight: 0.26 },
          { value: 'Resolve', weight: 0.22 },
        ],
        random
      )
  }
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

function randomDateAndHour(random: () => number, days: number, scenario: EventScenario) {
  const date = new Date(MOCK_ANCHOR_DATE)
  const dayOffset = pickDayOffset(random, days, scenario)
  const hour = pickHourByScenario(random, scenario)
  const minute = Math.floor(random() * 60)

  date.setUTCDate(date.getUTCDate() - dayOffset)
  date.setUTCHours(hour, minute, 0, 0)

  return { date, hour, dayOffset }
}

function buildDailyMetricShock(
  seed: number,
  context: {
    dateKey: string
    dayOffset: number
    sector: Sector
    metricId: string
  }
) {
  const { dateKey, dayOffset, sector, metricId } = context
  const shockSeedKey = `${dateKey}:${sector}:${metricId}`
  const regimeBucket = Math.floor(dayOffset / 5)
  const regimeRandom = seeded(seed, `regime:${sector}:${metricId}:${regimeBucket}`)()
  const dayRandom = seeded(seed, `day:${shockSeedKey}`)()
  const burstGate = seeded(seed, `burst:${shockSeedKey}`)()

  let shock =
    (regimeRandom - 0.5) * 1.75 +
    (dayRandom - 0.5) * 1.18 +
    Math.sin((dayOffset + 1) / 2.3) * 0.36 +
    Math.sin((dayOffset + 4) / 6.7) * 0.44

  if (burstGate > 0.84) {
    const burstDirection = seeded(seed, `burst-dir:${shockSeedKey}`)() < 0.5 ? -1 : 1
    const burstMagnitude = 0.64 + seeded(seed, `burst-mag:${shockSeedKey}`)() * 1.16
    shock += burstDirection * burstMagnitude
  }

  return clamp(shock, -2.4, 2.4)
}

function buildMetricValue(
  metricInfo: MetricInfo,
  random: () => number,
  context: {
    sector: Sector
    stage: EventStage
    status: EventStatus
    scenario: EventScenario
    hour: number
    dayOffset: number
    days: number
    process: string
    channel: string
    dayShock: number
  }
) {
  const {
    sector,
    stage,
    status,
    scenario,
    hour,
    dayOffset,
    days,
    process,
    channel,
    dayShock,
  } = context
  const base = metricBaseline(metricInfo) * sectorFactor(sector)
  const range = metricInfo.format === 'seconds' ? 240 : 34

  const stageStress = stage === 'Resolve' ? -0.06 : stage === 'Work' ? 0.08 : 0.17
  const statusStress =
    status === 'resolved' ? -0.12 : status === 'pending' ? 0.1 : 0.29
  const processStress = PROCESS_STRESS[process] ?? 0.08
  const channelStress = CHANNEL_STRESS[channel] ?? 0.1
  const scenarioStress = SCENARIO_STRESS[scenario]
  const volatility = SCENARIO_VOLATILITY[scenario]
  const hourStress =
    hour < 6 || hour >= 22
      ? 0.23
      : hour < 9
        ? 0.12
        : hour <= 17
          ? 0.06
          : 0.15
  const recencyStress = (1 - dayOffset / Math.max(days, 1)) * 0.13
  const totalStress =
    stageStress +
    statusStress +
    processStress +
    channelStress +
    scenarioStress +
    hourStress +
    recencyStress
  const stressFactor = metricInfo.direction === 'higher-better' ? -0.31 : 0.37
  const directionalSwing =
    dayShock *
    (metricInfo.direction === 'higher-better' ? -1 : 1) *
    (metricInfo.format === 'seconds' ? 118 : 18.5)
  const noiseAmplitude = range * (0.36 + volatility * 0.74)
  const noise = (random() - 0.5) * noiseAmplitude

  let raw = base + directionalSwing + noise + base * totalStress * stressFactor

  const extremeChance =
    0.004 +
    volatility * 0.03 +
    (status === 'escalated' ? 0.017 : 0) +
    (scenario === 'incident' ? 0.012 : 0)

  if (random() < extremeChance) {
    const extremeMagnitude = range * (0.32 + random() * 0.76)

    if (metricInfo.direction === 'higher-better') {
      raw -= extremeMagnitude
    } else {
      raw += extremeMagnitude
    }
  }

  if (metricInfo.format === 'seconds') {
    return formatMetricValue(metricInfo, clamp(raw, 70, 740))
  }

  return formatMetricValue(metricInfo, clamp(raw, 0.2, 99.8))
}

function buildStatus(
  stage: EventStage,
  random: () => number,
  scenario: EventScenario
): EventStatus {
  if (stage === 'Resolve') {
    switch (scenario) {
      case 'recovery':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.94 },
            { value: 'pending', weight: 0.05 },
            { value: 'escalated', weight: 0.01 },
          ],
          random
        )
      case 'steady':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.9 },
            { value: 'pending', weight: 0.08 },
            { value: 'escalated', weight: 0.02 },
          ],
          random
        )
      case 'seasonal-peak':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.82 },
            { value: 'pending', weight: 0.13 },
            { value: 'escalated', weight: 0.05 },
          ],
          random
        )
      case 'backlog':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.72 },
            { value: 'pending', weight: 0.2 },
            { value: 'escalated', weight: 0.08 },
          ],
          random
        )
      case 'incident':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.68 },
            { value: 'pending', weight: 0.22 },
            { value: 'escalated', weight: 0.1 },
          ],
          random
        )
      case 'fraud-watch':
        return pickWeighted(
          [
            { value: 'resolved', weight: 0.64 },
            { value: 'pending', weight: 0.2 },
            { value: 'escalated', weight: 0.16 },
          ],
          random
        )
      default:
        return 'pending'
    }
  }

  switch (scenario) {
    case 'recovery':
      return random() < 0.86 ? 'pending' : 'escalated'
    case 'steady':
      return random() < 0.8 ? 'pending' : 'escalated'
    case 'seasonal-peak':
      return random() < 0.74 ? 'pending' : 'escalated'
    case 'backlog':
      return random() < 0.66 ? 'pending' : 'escalated'
    case 'incident':
      return random() < 0.58 ? 'pending' : 'escalated'
    case 'fraud-watch':
      return random() < 0.52 ? 'pending' : 'escalated'
    default:
      return random() < 0.78 ? 'pending' : 'escalated'
  }
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

function startOfWeekKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  const day = (date.getUTCDay() + 6) % 7

  date.setUTCDate(date.getUTCDate() - day)

  return date.toISOString().slice(0, 10)
}

function startOfMonthKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)

  date.setUTCDate(1)

  return date.toISOString().slice(0, 10)
}

function normalizeOverlapZones(zones?: OverlapZoneConfig): Required<OverlapZoneConfig> {
  const max = zones?.max ?? 100
  const greenMax = clamp(zones?.greenMax ?? 20, 0, max)
  const yellowMax = clamp(zones?.yellowMax ?? 40, greenMax, max)

  return {
    greenMax,
    yellowMax,
    max,
  }
}

function toOverlapBucketDate(dateKey: string, granularity: OverlapGranularity) {
  if (granularity === 'week') {
    return startOfWeekKey(dateKey)
  }

  if (granularity === 'month') {
    return startOfMonthKey(dateKey)
  }

  return dateKey
}

function overlapLabel(event: EventRecord, dimension: OverlapDimension) {
  if (dimension === 'domain') {
    return event.productGroup
  }

  return event.process
}

function overlapScore(event: EventRecord) {
  let score = 0

  if (event.status === 'escalated') {
    score += 2
  } else if (event.status === 'pending') {
    score += 1
  }

  if (event.slaBreach) {
    score += 1
  }

  if (event.anomaly) {
    score += 2
  }

  if (event.stage !== 'Resolve') {
    score += 1
  }

  return clamp(score, 0, MAX_INTERSECTION_SCORE)
}

function overlapZone(overlapRate: number): OverlapZone {
  if (overlapRate > 30) {
    return 'red'
  }

  if (overlapRate > 10) {
    return 'yellow'
  }

  return 'green'
}

function overlapZoneByValue(value: number, zones: Required<OverlapZoneConfig>) {
  const greenMax = zones.greenMax
  const yellowMax = zones.yellowMax

  if (value > yellowMax) {
    return 'red'
  }

  if (value > greenMax) {
    return 'yellow'
  }

  return 'green'
}

function overlapRate(intersections: number, totalCases: number) {
  if (totalCases === 0) {
    return 0
  }

  const value = (intersections / (totalCases * MAX_INTERSECTION_SCORE)) * 100
  return Math.round(value * 10) / 10
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
  count = 30000,
  days = 180,
  seed = 42,
  sector?: Sector
): EventRecord[] {
  const random = seeded(seed, `events:${sector ?? 'all'}:${count}:${days}`)
  const availableSectors = sector ? [sector] : [...SECTORS]
  const metricIds = Object.keys(METRICS)
  const casePool = Math.max(Math.floor(count * 0.72), 4200)
  const hotCasePool = Math.max(Math.floor(casePool * 0.11), 420)
  const stream: EventRecord[] = []
  const dayShockByKey = new Map<string, number>()

  for (let index = 0; index < count; index += 1) {
    const scenario = pickScenario(random)
    const currentSector = pick(availableSectors, random)
    const productGroup = pick(PRODUCT_GROUPS, random)
    const categories = CATEGORIES_BY_PRODUCT[productGroup]
    const subProduct = pick(SUB_PRODUCTS_BY_GROUP[productGroup], random)

    const sectorProcesses = PROCESS_BY_SECTOR[currentSector]
    const productProcesses = categories
    const candidateProcesses = sectorProcesses.filter((process) =>
      productProcesses.includes(process)
    )

    const process =
      candidateProcesses.length > 0
        ? candidateProcesses.length > 1 && random() < 0.38
          ? pickWeighted(
              candidateProcesses.map((item) => ({
                value: item,
                weight:
                  (PROCESS_STRESS[item] ?? 0.1) +
                  (scenario === 'incident' && item.includes('Ошиб') ? 0.24 : 0) +
                  (scenario === 'fraud-watch' && item.includes('Антифрод') ? 0.28 : 0) +
                  (scenario === 'recovery' && item.includes('Прочие консультации') ? -0.16 : 0) +
                  0.05,
              })),
              random
            )
          : pick(candidateProcesses, random)
        : pick(productProcesses, random)

    const metricId = pickWeighted(
      metricIds.map((metricId) => {
        let weight = 1

        if (scenario === 'incident') {
          if (metricId === 'queueLoad' || metricId === 'abandonment') weight = 2.9
          if (metricId === 'aht' || metricId === 'sla') weight = 2.2
        } else if (scenario === 'backlog') {
          if (metricId === 'aht' || metricId === 'queueLoad') weight = 2.45
          if (metricId === 'sla') weight = 2
        } else if (scenario === 'fraud-watch') {
          if (metricId === 'abandonment') weight = 2.5
          if (metricId === 'sla') weight = 1.95
        } else if (scenario === 'recovery') {
          if (metricId === 'fcr' || metricId === 'csat') weight = 2.1
          if (metricId === 'abandonment') weight = 0.6
        } else if (scenario === 'seasonal-peak') {
          if (metricId === 'queueLoad' || metricId === 'aht') weight = 1.9
        }

        return { value: metricId, weight }
      }),
      random
    )
    const metricInfo = METRICS[metricId]
    const stage = weightedStage(random, scenario)
    const status = buildStatus(stage, random, scenario)
    const channel = pickWeighted(
      CHANNELS.map((item) => {
        let weight = 1

        if (scenario === 'incident') {
          if (item === 'Колл-центр') weight = 2.3
          if (item === 'Онлайн-банк') weight = 1.8
        } else if (scenario === 'backlog') {
          if (item === 'Колл-центр' || item === 'Отделение') weight = 2.15
        } else if (scenario === 'fraud-watch') {
          if (item === 'Онлайн-банк' || item === 'Мобильный банк') weight = 2.35
        } else if (scenario === 'recovery') {
          if (item === 'Мобильный банк') weight = 1.75
        } else if (scenario === 'seasonal-peak') {
          if (item === 'Колл-центр' || item === 'Мобильный банк') weight = 1.82
        }

        return { value: item, weight }
      }),
      random
    )
    const language = pickWeighted(
      LANGUAGES.map((item) => ({
        value: item,
        weight: item === 'ru' ? 0.74 : 0.26,
      })),
      random
    )
    const operator = pick(OPERATORS, random)
    const direction = pickWeighted(
      DIRECTIONS.map((item) => ({
        value: item,
        weight: item === 'Входящий' ? 0.86 : 0.14,
      })),
      random
    )
    const dialogueType = pickWeighted(
      DIALOGUE_TYPES.map((item) => ({
        value: item,
        weight: item === 'Консультация' ? 0.79 : 0.21,
      })),
      random
    )
    const tag = pick(CONTACT_TAGS, random)
    const { date: eventDate, hour, dayOffset } = randomDateAndHour(random, days, scenario)
    const dateKey = eventDate.toISOString().slice(0, 10)
    const dayShockKey = `${dateKey}|${currentSector}|${metricId}`
    const dayShockCached = dayShockByKey.get(dayShockKey)
    const dayShock =
      dayShockCached ??
      buildDailyMetricShock(seed, {
        dateKey,
        dayOffset,
        sector: currentSector,
        metricId,
      })

    if (dayShockCached === undefined) {
      dayShockByKey.set(dayShockKey, dayShock)
    }

    const value = buildMetricValue(metricInfo, random, {
      sector: currentSector,
      stage,
      status,
      scenario,
      hour,
      dayOffset,
      days,
      process,
      channel,
      dayShock,
    })

    const slaBreach =
      (metricId === 'sla' && value < metricInfo.thresholds.medium) ||
      (metricId === 'aht' && value > metricInfo.thresholds.medium) ||
      (metricId === 'abandonment' && value > metricInfo.thresholds.medium) ||
      random() <
        clamp(
          (scenario === 'incident'
            ? 0.58
            : scenario === 'backlog'
              ? 0.47
              : scenario === 'seasonal-peak'
                ? 0.39
                : scenario === 'fraud-watch'
                  ? 0.51
                  : scenario === 'recovery'
                    ? 0.16
                    : 0.28) +
            (status === 'escalated' ? 0.21 : status === 'pending' ? 0.09 : -0.11) +
            (stage === 'Resolve' ? -0.13 : 0.04) +
            (channel === 'Онлайн-банк' ? 0.05 : 0) +
            (hour < 6 || hour >= 22 ? 0.07 : 0) +
            (process.includes('Ошиб') || process.includes('Антифрод') ? 0.09 : 0),
          0.02,
          0.97
        )

    const anomaly =
      random() <
      clamp(
        0.004 +
          (status === 'escalated' ? 0.043 : status === 'pending' ? 0.013 : 0) +
          (slaBreach ? 0.028 : 0) +
          SCENARIO_VOLATILITY[scenario] * 0.041 +
          (process === 'Эскалации' ? 0.018 : 0) +
          (channel === 'Онлайн-банк' ? 0.01 : 0),
        0.002,
        0.88
      )

    const caseIdNumber =
      random() < 0.14
        ? 1 + Math.floor(random() * hotCasePool)
        : hotCasePool + 1 + Math.floor(random() * Math.max(casePool - hotCasePool, 1))

    stream.push({
      id: `EVT-${String(index + 1).padStart(7, '0')}`,
      caseId: `CASE-${String(caseIdNumber).padStart(6, '0')}`,
      timestamp: eventDate.toISOString(),
      date: eventDate.toISOString().slice(0, 10),
      hour,
      sector: currentSector,
      channel,
      process,
      productGroup,
      category: process,
      subProduct,
      language,
      operator,
      direction,
      dialogueType,
      tag,
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
  const events = generateEventStream(Math.max(days * 140, 7000), days, seed, sector)
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

export function buildOverlapAnalyticsFromMetricSeries({
  metricSeries,
  metricIds,
  metricsMap,
  granularity,
}: OverlapFromMetricSeriesParams): OverlapAnalytics {
  const dimension: OverlapDimension = 'indicator'
  const timeline: OverlapTimelineSeries[] = []
  const bucketKeys = new Set<string>()

  for (const metricId of metricIds) {
    const metric = metricsMap[metricId]
    const sourcePoints = metricSeries[metricId] ?? []

    if (!metric || sourcePoints.length === 0) {
      continue
    }

    const label = metric.name
    const byBucket = new Map<string, { sum: number; count: number }>()

    for (const point of sourcePoints) {
      const value = Number(point.value)
      if (!Number.isFinite(value)) {
        continue
      }

      const bucket = toOverlapBucketDate(point.date, granularity)
      const current = byBucket.get(bucket)

      if (current) {
        current.sum += value
        current.count += 1
      } else {
        byBucket.set(bucket, { sum: value, count: 1 })
      }

      bucketKeys.add(bucket)
    }

    if (byBucket.size === 0) {
      continue
    }

    const orderedBuckets = Array.from(byBucket.keys()).sort((a, b) => a.localeCompare(b))
    const points: OverlapTimelinePoint[] = []
    let total = 0
    let maxValue = 0

    for (const date of orderedBuckets) {
      const bucket = byBucket.get(date)
      if (!bucket || bucket.count === 0) {
        continue
      }

      const overlapValue = Math.round((bucket.sum / bucket.count) * 10) / 10
      total += overlapValue
      maxValue = Math.max(maxValue, overlapValue)

      points.push({
        date,
        label,
        dimension,
        totalCases: 100,
        intersections: Math.round(overlapValue),
        overlapRate: overlapValue,
        zone: overlapZone(overlapValue),
      })
    }

    // Hide zero-only series for selected period.
    if (points.length === 0 || maxValue <= 0) {
      continue
    }

    const average = Math.round((total / points.length) * 10) / 10

    timeline.push({
      id: `${dimension}:${metricId}`,
      label,
      dimension,
      totalCases: points.length * 100,
      intersections: Math.round(total),
      overlapRate: average,
      zone: overlapZone(average),
      points,
    })
  }

  const snapshot = timeline
    .map((series) => ({
      id: series.id,
      label: series.label,
      dimension,
      totalCases: series.totalCases,
      intersections: series.intersections,
      overlapRate: series.overlapRate,
      zone: series.zone,
    }))
    .sort((a, b) => b.overlapRate - a.overlapRate)

  const orderedBucketKeys = Array.from(bucketKeys).sort((a, b) => a.localeCompare(b))

  for (const series of timeline) {
    const byDate = new Map(series.points.map((point) => [point.date, point]))
    series.points = orderedBucketKeys
      .map((date) => byDate.get(date))
      .filter((point): point is OverlapTimelinePoint => Boolean(point))
  }

  return {
    dimension,
    granularity,
    snapshot,
    timeline,
  }
}

export function generateOverlapAnalytics(
  events: EventRecord[],
  options: {
    dimension?: OverlapDimension
    granularity?: OverlapGranularity
    topN?: number
  } = {}
): OverlapAnalytics {
  const dimension = options.dimension ?? 'domain'
  const granularity = options.granularity ?? 'week'
  const topN = options.topN ?? 6

  const totalsByLabel = new Map<string, { totalCases: number; intersections: number }>()
  const timelineByBucketAndLabel = new Map<
    string,
    { totalCases: number; intersections: number }
  >()
  const bucketKeys = new Set<string>()

  for (const event of events) {
    const label = overlapLabel(event, dimension)
    const bucket = toOverlapBucketDate(event.date, granularity)
    const score = overlapScore(event)

    const currentLabel = totalsByLabel.get(label)
    if (currentLabel) {
      currentLabel.totalCases += 1
      currentLabel.intersections += score
    } else {
      totalsByLabel.set(label, {
        totalCases: 1,
        intersections: score,
      })
    }

    const timelineKey = `${bucket}|${label}`
    const currentTimeline = timelineByBucketAndLabel.get(timelineKey)
    if (currentTimeline) {
      currentTimeline.totalCases += 1
      currentTimeline.intersections += score
    } else {
      timelineByBucketAndLabel.set(timelineKey, {
        totalCases: 1,
        intersections: score,
      })
    }

    bucketKeys.add(bucket)
  }

  const snapshot: OverlapSnapshotPoint[] = []

  for (const [label, stats] of totalsByLabel.entries()) {
    const rate = overlapRate(stats.intersections, stats.totalCases)
    snapshot.push({
      id: `${dimension}:${label}`,
      label,
      dimension,
      totalCases: stats.totalCases,
      intersections: stats.intersections,
      overlapRate: rate,
      zone: overlapZone(rate),
    })
  }

  snapshot.sort((a, b) => {
    if (a.overlapRate !== b.overlapRate) {
      return b.overlapRate - a.overlapRate
    }

    if (a.intersections !== b.intersections) {
      return b.intersections - a.intersections
    }

    return a.label.localeCompare(b.label, 'ru')
  })

  const selectedLabels = (topN > 0 ? snapshot.slice(0, topN) : snapshot).map(
    (item) => item.label
  )
  const orderedBuckets = Array.from(bucketKeys).sort((a, b) => a.localeCompare(b))

  const timeline: OverlapTimelineSeries[] = []

  for (const label of selectedLabels) {
    const points: OverlapTimelinePoint[] = []
    let totalCases = 0
    let intersections = 0

    for (const date of orderedBuckets) {
      const cell = timelineByBucketAndLabel.get(`${date}|${label}`)
      const pointTotal = cell?.totalCases ?? 0
      const pointIntersections = cell?.intersections ?? 0
      const pointRate = overlapRate(pointIntersections, pointTotal)

      points.push({
        date,
        label,
        dimension,
        totalCases: pointTotal,
        intersections: pointIntersections,
        overlapRate: pointRate,
        zone: overlapZone(pointRate),
      })

      totalCases += pointTotal
      intersections += pointIntersections
    }

    const totalRate = overlapRate(intersections, totalCases)

    timeline.push({
      id: `${dimension}:${label}`,
      label,
      dimension,
      totalCases,
      intersections,
      overlapRate: totalRate,
      zone: overlapZone(totalRate),
      points,
    })
  }

  return {
    dimension,
    granularity,
    snapshot,
    timeline,
  }
}

export function buildOverlapBuckets(
  analytics: OverlapAnalytics,
  options: OverlapBucketsOptions
): OverlapBucketSummary[] {
  const {
    granularity,
    visibleSeriesLimit,
    selectedSeries = [],
    zones: zonesInput,
    valueTransform,
  } = options
  const zones = normalizeOverlapZones(zonesInput)

  if (analytics.timeline.length === 0) {
    return []
  }

  const seriesByLabel = new Map<
    string,
    {
      label: string
      score: number
      points: OverlapTimelinePoint[]
    }
  >()

  for (const series of analytics.timeline) {
    let total = 0
    let count = 0

    for (const point of series.points) {
      total += point.overlapRate
      count += 1
    }

    const score = count > 0 ? total / count : series.overlapRate

    seriesByLabel.set(series.label, {
      label: series.label,
      score,
      points: series.points,
    })
  }

  const orderedLabels = Array.from(seriesByLabel.values())
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score
      }
      return a.label.localeCompare(b.label, 'ru')
    })
    .map((item) => item.label)

  const selectedSet = new Set(
    selectedSeries.filter((label) => seriesByLabel.has(label))
  )
  let visibleLabels =
    visibleSeriesLimit > 0
      ? orderedLabels.slice(0, visibleSeriesLimit)
      : [...orderedLabels]

  for (const label of selectedSet) {
    if (!visibleLabels.includes(label)) {
      if (visibleSeriesLimit <= 0 || visibleLabels.length < visibleSeriesLimit) {
        visibleLabels.push(label)
      } else {
        for (let index = visibleLabels.length - 1; index >= 0; index -= 1) {
          if (!selectedSet.has(visibleLabels[index])) {
            visibleLabels[index] = label
            break
          }
        }
      }
    }
  }

  const visibleLabelSet = new Set(visibleLabels)
  const aggregateByDateAndLabel = new Map<
    string,
    { overlapRateSum: number; count: number; totalCases: number }
  >()
  const bucketTotalCasesByDate = new Map<string, number>()
  const bucketDates = new Set<string>()

  for (const series of analytics.timeline) {
    for (const point of series.points) {
      const bucketDate = toOverlapBucketDate(point.date, granularity)
      const totalCasesByDate = bucketTotalCasesByDate.get(bucketDate)

      if (totalCasesByDate === undefined) {
        bucketTotalCasesByDate.set(bucketDate, point.totalCases)
      } else {
        bucketTotalCasesByDate.set(bucketDate, totalCasesByDate + point.totalCases)
      }

      if (visibleLabelSet.has(series.label)) {
        const bucketKey = `${bucketDate}|${series.label}`
        const current = aggregateByDateAndLabel.get(bucketKey)

        if (current) {
          current.overlapRateSum += point.overlapRate
          current.count += 1
          current.totalCases += point.totalCases
        } else {
          aggregateByDateAndLabel.set(bucketKey, {
            overlapRateSum: point.overlapRate,
            count: 1,
            totalCases: point.totalCases,
          })
        }
      }

      bucketDates.add(bucketDate)
    }
  }

  const orderedDates = Array.from(bucketDates).sort((a, b) => a.localeCompare(b))
  const result: OverlapBucketSummary[] = []

  for (const date of orderedDates) {
    const seriesValues: Record<string, number> = {}
    const zoneCounts = { green: 0, yellow: 0, red: 0 }
    const bucketTotalCases = bucketTotalCasesByDate.get(date) ?? 0
    const sortedSeries: OverlapBucketSummary['sortedSeries'] = []

    for (const label of visibleLabels) {
      const bucket = aggregateByDateAndLabel.get(`${date}|${label}`)
      const avgOverlapRate =
        bucket && bucket.count > 0 ? bucket.overlapRateSum / bucket.count : 0
      const loadShare = bucket && bucketTotalCases > 0 ? bucket.totalCases / bucketTotalCases : 0
      const baseValue = clamp(avgOverlapRate * (0.42 + loadShare * 2.2), 0, zones.max)
      const transformedValue = valueTransform
        ? valueTransform({
            label,
            date,
            avgOverlapRate,
            loadShare,
            totalCases: bucket?.totalCases ?? 0,
            bucketTotalCases,
            zones,
          })
        : baseValue
      const value = Math.round(clamp(transformedValue, 0, zones.max) * 10) / 10
      const zone = overlapZoneByValue(value, zones)

      seriesValues[label] = value
      zoneCounts[zone] += 1
      sortedSeries.push({
        label,
        value,
        zone,
      })
    }

    sortedSeries.sort((a, b) => b.value - a.value)

    result.push({
      date,
      zoneCounts,
      seriesValues,
      sortedSeries,
    })
  }

  return result
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
    product: event.productGroup,
    productGroup: event.productGroup,
    category: event.category,
    subProduct: event.subProduct,
    language: event.language,
    operator: event.operator,
    direction: event.direction,
    dialogueType: event.dialogueType,
    tag: event.tag,
    stage: event.stage,
    hour: event.hour,
    channel: event.channel,
    tags: [event.tag, event.direction, event.dialogueType],
    status: event.status,
    description: buildDescription(event),
  }))
}

export { ALL_SUB_PRODUCTS }
