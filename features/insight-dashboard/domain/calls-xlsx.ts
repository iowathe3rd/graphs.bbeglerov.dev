import { DEFAULT_PRODUCT_OPTIONS } from '@/features/insight-dashboard/config/constants'
import type {
  InsightEvent,
  InsightProductGroup,
  InsightSector,
  ProductSituationTag,
} from '@/features/insight-dashboard/domain/types'

const TAG_TO_METRIC: Record<ProductSituationTag, string> = {
  'Технические проблемы/сбои': 'sla',
  'Запрос не решен': 'aht',
  'Отрицательный продуктовый фидбэк': 'queueLoad',
  'Угроза ухода/отказа от продуктов банка': 'abandonment',
}

const POSITIVE_TAG = 'Без негативного тега'

interface ProductMatcher {
  productGroup: InsightProductGroup
  patterns: string[]
}

interface TagMatcher {
  tag: ProductSituationTag
  patterns: string[]
}

const PRODUCT_MATCHERS: ProductMatcher[] = [
  {
    productGroup: 'Под залог недвижимости',
    patterns: ['Под залог недвижимости', 'Кредит ПОД залог', 'Продажа залогового имущества'],
  },
  {
    productGroup: 'Кредит без залога онлайн',
    patterns: ['Кредит БЕЗ залога', 'Кредит без залога'],
  },
  {
    productGroup: 'Премиум карта',
    patterns: ['Премиум карта'],
  },
  {
    productGroup: 'Платежные карты',
    patterns: ['Платежные карты', 'Дебетовая карта'],
  },
  {
    productGroup: 'Автокредитование',
    patterns: ['Автокредитование', 'Автокредит'],
  },
  {
    productGroup: 'Ипотека',
    patterns: ['Ипотека'],
  },
  {
    productGroup: 'Депозиты',
    patterns: ['Депозиты', 'Депозит'],
  },
  {
    productGroup: 'Лояльность',
    patterns: ['Лояльность'],
  },
  {
    productGroup: 'Переводы',
    patterns: ['Переводы', 'Перевод'],
  },
  {
    productGroup: 'МП Bereke',
    patterns: ['МП Bereke Bank', 'МП Bereke'],
  },
]

const TAG_MATCHERS: TagMatcher[] = [
  {
    tag: 'Технические проблемы/сбои',
    patterns: ['Технические проблемы/сбои'],
  },
  {
    tag: 'Запрос не решен',
    patterns: ['Запрос не решен'],
  },
  {
    tag: 'Отрицательный продуктовый фидбэк',
    patterns: ['Отрицательный продуктовый фидбэк'],
  },
  {
    tag: 'Угроза ухода/отказа от продуктов банка',
    patterns: ['Угроза ухода/отказа от продуктов банка'],
  },
]

const PRODUCT_MATCHERS_NORMALIZED = PRODUCT_MATCHERS.map((matcher) => ({
  productGroup: matcher.productGroup,
  patterns: matcher.patterns.map((pattern) => pattern.toLowerCase()),
}))

const TAG_MATCHERS_NORMALIZED = TAG_MATCHERS.map((matcher) => ({
  tag: matcher.tag,
  patterns: matcher.patterns.map((pattern) => pattern.toLowerCase()),
}))

interface HeaderIndexMap {
  dialogueId: number
  sector: number
  timestamp: number
  callId: number
  productClassification: number
  categoryClassification: number
  tags: number
  dialogueType: number
  crmTopic: number
  crmSubtopic: number
  crmSubtopicType: number
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return ''
}

function mapSector(value: string): InsightSector {
  const normalized = value.trim().toUpperCase()

  if (normalized === 'RB' || normalized === 'РБ') {
    return 'РБ'
  }

  if (normalized === 'БММБ') {
    return 'БММБ'
  }

  if (normalized === 'КРС') {
    return 'КРС'
  }

  if (normalized === 'КСБ') {
    return 'КСБ'
  }

  return 'РБ'
}

function parseExcelDate(cellValue: unknown): Date | undefined {
  if (cellValue instanceof Date && !Number.isNaN(cellValue.getTime())) {
    return cellValue
  }

  if (typeof cellValue === 'number' && Number.isFinite(cellValue)) {
    const excelEpochMs = Date.UTC(1899, 11, 30)
    const ms = Math.round(cellValue * 86400000)
    const date = new Date(excelEpochMs + ms)

    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  const text = toText(cellValue)

  if (!text) {
    return undefined
  }

  const parsed = new Date(text)

  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed
}

function detectProductGroup(candidates: string[]): InsightProductGroup {
  const normalizedCandidates = candidates
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toLowerCase())

  for (const matcher of PRODUCT_MATCHERS_NORMALIZED) {
    if (normalizedCandidates.some((candidate) => matcher.patterns.some((pattern) => candidate.includes(pattern)))) {
      return matcher.productGroup
    }
  }

  const fallback = candidates.find((value) => value.trim().length > 0)
  return fallback ?? DEFAULT_PRODUCT_OPTIONS[0]
}

function detectTags(rawTags: string): ProductSituationTag[] {
  const normalized = rawTags.toLowerCase()

  if (!normalized) {
    return []
  }

  const tags = TAG_MATCHERS_NORMALIZED.filter((matcher) =>
    matcher.patterns.some((pattern) => normalized.includes(pattern))
  ).map((matcher) => matcher.tag)

  return Array.from(new Set(tags))
}

function detectDialogueType(raw: string): InsightEvent['dialogueType'] {
  const normalized = raw.toLowerCase()

  if (normalized.includes('претенз')) {
    return 'Претензия'
  }

  return 'Консультация'
}

function buildHeaderIndexMap(headerRow: unknown[]): HeaderIndexMap {
  const headerByName = new Map<string, number>()

  headerRow.forEach((value, index) => {
    const key = toText(value).toLowerCase()
    if (!key) {
      return
    }
    headerByName.set(key, index)
  })

  return {
    dialogueId: headerByName.get('id диалога') ?? 0,
    sector: headerByName.get('поток') ?? 1,
    timestamp: headerByName.get('дата и время диалога') ?? 3,
    callId: headerByName.get('id звонка') ?? 6,
    productClassification: headerByName.get('продукт (классификация)') ?? 9,
    categoryClassification: headerByName.get('категория (классификация)') ?? 10,
    tags: headerByName.get('теги') ?? 12,
    dialogueType: headerByName.get('тип диалога') ?? 14,
    crmTopic: headerByName.get('тема_crm') ?? 15,
    crmSubtopic: headerByName.get('подтема_crm') ?? 16,
    crmSubtopicType: headerByName.get('тип подтемы_crm') ?? 17,
  }
}

export async function parseCallsWorkbook(buffer: ArrayBuffer): Promise<InsightEvent[]> {
  const { read, utils } = await import('xlsx')
  const workbook = read(buffer, {
    type: 'array',
    cellDates: true,
    dense: true,
  })

  const firstSheet = workbook.SheetNames[0]

  if (!firstSheet) {
    return []
  }

  const worksheet = workbook.Sheets[firstSheet]

  if (!worksheet) {
    return []
  }

  const rows = utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    raw: true,
    defval: null,
    blankrows: false,
  })

  if (rows.length <= 1) {
    return []
  }

  const header = rows[0] ?? []
  const column = buildHeaderIndexMap(header)
  const events: InsightEvent[] = []

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? []
    const rawSector = toText(row[column.sector])
    const parsedDate = parseExcelDate(row[column.timestamp])

    if (!parsedDate) {
      continue
    }

    const date = parsedDate.toISOString().slice(0, 10)
    const timestamp = parsedDate.toISOString()

    const productGroup = detectProductGroup([
      toText(row[column.productClassification]),
      toText(row[column.categoryClassification]),
      toText(row[column.crmTopic]),
      toText(row[column.crmSubtopic]),
    ])

    const tags = detectTags(toText(row[column.tags]))
    const dialogueType = detectDialogueType(
      `${toText(row[column.dialogueType])} ${toText(row[column.crmSubtopicType])}`
    )

    const caseIdRaw = toText(row[column.dialogueId]) || toText(row[column.callId]) || `${rowIndex}`
    const caseId = `xlsx-case-${caseIdRaw}`
    const sector = mapSector(rawSector)

    if (tags.length === 0) {
      events.push({
        id: `xlsx-${rowIndex}-0`,
        caseId,
        date,
        timestamp,
        sector,
        productGroup,
        channel: 'Колл-центр',
        dialogueType,
        metric: 'fcr',
        tag: POSITIVE_TAG,
      })
      continue
    }

    tags.forEach((tag, tagIndex) => {
      events.push({
        id: `xlsx-${rowIndex}-${tagIndex}`,
        caseId,
        date,
        timestamp,
        sector,
        productGroup,
        channel: 'Колл-центр',
        dialogueType,
        metric: TAG_TO_METRIC[tag],
        tag,
      })
    })
  }

  return events
}
