import {
  DEFAULT_PRODUCT_OPTIONS,
  DEFAULT_SECTOR_OPTIONS,
} from '@/features/insight-dashboard/config/constants'
import type { InsightEvent } from '@/features/insight-dashboard/logic/types'

export interface InsightFilterOptions {
  sectorOptions: string[]
  productOptions: string[]
}

interface BuildInsightFilterOptionsParams {
  events: InsightEvent[]
  sectorOptions?: string[]
  productOptions?: string[]
}

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of values) {
    const value = raw.trim()

    if (!value || seen.has(value)) {
      continue
    }

    seen.add(value)
    result.push(value)
  }

  return result
}

function toFallback(values: readonly string[]): string[] {
  return [...values]
}

function sortRu(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, 'ru'))
}

function mergeWithPreferredOrder(
  values: string[],
  preferredOrder: readonly string[]
): string[] {
  const valueSet = new Set(values)
  const orderedKnown = preferredOrder.filter((value) => valueSet.has(value))
  const additional = sortRu(values.filter((value) => !preferredOrder.includes(value)))
  const result = [...orderedKnown, ...additional]

  if (result.length > 0) {
    return result
  }

  return toFallback(preferredOrder)
}

export function buildInsightFilterOptions(
  params: BuildInsightFilterOptionsParams
): InsightFilterOptions {
  const sectorsFromEvents = uniqueOrdered(params.events.map((event) => event.sector))
  const productsFromEvents = uniqueOrdered(
    params.events.map((event) => event.productGroup)
  )

  const sectorOptions = params.sectorOptions?.length
    ? uniqueOrdered(params.sectorOptions)
    : mergeWithPreferredOrder(sectorsFromEvents, DEFAULT_SECTOR_OPTIONS)

  const productOptions = params.productOptions?.length
    ? uniqueOrdered(params.productOptions)
    : mergeWithPreferredOrder(productsFromEvents, DEFAULT_PRODUCT_OPTIONS)

  return {
    sectorOptions,
    productOptions,
  }
}

export function ensureOption(
  value: string,
  options: string[],
  fallback: string
): string {
  if (options.includes(value)) {
    return value
  }

  return options[0] ?? fallback
}
