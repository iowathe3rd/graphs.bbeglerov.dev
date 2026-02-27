import { DEFAULT_PRODUCT_OPTIONS } from '@/features/insight-dashboard/config/constants'
import type {
  InsightEvent,
  InsightProductGroup,
  InsightSector,
} from '@/features/insight-dashboard/logic/types'

const TAG_TO_METRIC: Record<string, string> = {
  'Технические проблемы/сбои': 'sla',
  'Запрос не решен': 'aht',
  'Отрицательный продуктовый фидбэк': 'queueLoad',
  'Угроза ухода/отказа от продуктов банка': 'abandonment',
}

interface ProductMatcher {
  productGroup: InsightProductGroup
  patterns: string[]
}

interface TagMatcher {
  tag: keyof typeof TAG_TO_METRIC
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

const DIALOGUE_PATTERNS = {
  consultation: ['Консультация'],
  claim: ['Претензия'],
} as const

const POSITIVE_TAG = 'Без негативного тега'

function toPseudoByte(value: number): number {
  if (value >= 0xc0 && value <= 0xff) {
    return value - 0xb0
  }

  if (value === 0xa8 || value === 0xb8) {
    return value - 0x80
  }

  return value
}

function encodeWindows1251(text: string): Uint8Array {
  const bytes: number[] = []

  for (const char of text) {
    const code = char.charCodeAt(0)

    if (code <= 0x7f) {
      bytes.push(code)
      continue
    }

    if (code >= 0x0410 && code <= 0x042f) {
      bytes.push(code - 0x0410 + 0xc0)
      continue
    }

    if (code >= 0x0430 && code <= 0x044f) {
      bytes.push(code - 0x0430 + 0xe0)
      continue
    }

    if (code === 0x0401) {
      bytes.push(0xa8)
      continue
    }

    if (code === 0x0451) {
      bytes.push(0xb8)
      continue
    }

    bytes.push(0x3f)
  }

  return Uint8Array.from(bytes)
}

function toPseudoBinaryString(text: string): string {
  const cpBytes = encodeWindows1251(text)
  const pseudoBytes = cpBytes.map(toPseudoByte)

  return String.fromCharCode(...pseudoBytes)
}

function buildMatcherPatterns() {
  return {
    products: PRODUCT_MATCHERS.map((matcher) => ({
      productGroup: matcher.productGroup,
      patterns: matcher.patterns.map((pattern) => toPseudoBinaryString(pattern)),
    })),
    tags: TAG_MATCHERS.map((matcher) => ({
      tag: matcher.tag,
      patterns: matcher.patterns.map((pattern) => toPseudoBinaryString(pattern)),
    })),
    dialogue: {
      consultation: DIALOGUE_PATTERNS.consultation.map((pattern) =>
        toPseudoBinaryString(pattern)
      ),
      claim: DIALOGUE_PATTERNS.claim.map((pattern) => toPseudoBinaryString(pattern)),
    },
  }
}

const MATCHERS = buildMatcherPatterns()

function mapSector(value: string): InsightSector {
  const normalized = value.trim().toUpperCase()

  if (normalized === 'RB') {
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

function detectProductGroup(rawTail: string): InsightProductGroup {
  for (const matcher of MATCHERS.products) {
    if (matcher.patterns.some((pattern) => rawTail.includes(pattern))) {
      return matcher.productGroup
    }
  }

  return DEFAULT_PRODUCT_OPTIONS[0]
}

function detectTags(rawTail: string): Array<keyof typeof TAG_TO_METRIC> {
  const tags = MATCHERS.tags
    .filter((matcher) => matcher.patterns.some((pattern) => rawTail.includes(pattern)))
    .map((matcher) => matcher.tag)

  return tags
}

function detectDialogueType(rawTail: string): InsightEvent['dialogueType'] {
  if (MATCHERS.dialogue.claim.some((pattern) => rawTail.includes(pattern))) {
    return 'Претензия'
  }

  if (MATCHERS.dialogue.consultation.some((pattern) => rawTail.includes(pattern))) {
    return 'Консультация'
  }

  return 'Консультация'
}

function toBinaryString(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer)
  let result = ''

  for (let index = 0; index < view.length; index += 1) {
    result += String.fromCharCode(view[index] as number)
  }

  return result
}

function toIsoTimestamp(dateTimeRaw: string): string {
  const isoCandidate = `${dateTimeRaw.trim().replace(' ', 'T')}Z`
  const parsed = new Date(isoCandidate)

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

export function parseCallsCsv(buffer: ArrayBuffer): InsightEvent[] {
  const rawText = toBinaryString(buffer)
  const lines = rawText.split(/\r?\n/)

  const events: InsightEvent[] = []

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]?.trim()

    if (!line) {
      continue
    }

    const firstDelimiter = line.indexOf(';')
    const secondDelimiter = line.indexOf(';', firstDelimiter + 1)

    if (firstDelimiter <= 0 || secondDelimiter <= firstDelimiter) {
      continue
    }

    const sectorRaw = line.slice(0, firstDelimiter)
    const dateTimeRaw = line.slice(firstDelimiter + 1, secondDelimiter)
    const rawTail = line.slice(secondDelimiter + 1)

    const sector = mapSector(sectorRaw)
    const date = dateTimeRaw.slice(0, 10)
    const timestamp = toIsoTimestamp(dateTimeRaw)
    const productGroup = detectProductGroup(rawTail)
    const dialogueType = detectDialogueType(rawTail)
    const tags = detectTags(rawTail)
    const caseId = `csv-case-${lineIndex}`

    if (tags.length === 0) {
      events.push({
        id: `csv-${lineIndex}-0`,
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
        id: `csv-${lineIndex}-${tagIndex}`,
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
