'use client'

import { useEffect, useState } from 'react'

import { parseCallsWorkbook } from '@/features/insight-dashboard/logic/calls-xlsx'
import { parseCallsCsv } from '@/features/insight-dashboard/logic/calls-csv'
import type { InsightDataSourceState, InsightEvent } from '@/features/insight-dashboard/logic/types'

let cachedEvents: InsightEvent[] | null = null
let loadPromise: Promise<InsightEvent[]> | null = null

async function loadInsightEventsFromSource(): Promise<InsightEvent[]> {
  if (cachedEvents) {
    return cachedEvents
  }

  if (!loadPromise) {
    loadPromise = fetch('/export.xlsx', { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Не удалось загрузить export.xlsx (${response.status})`)
        }

        const buffer = await response.arrayBuffer()
        const events = await parseCallsWorkbook(buffer)
        if (events.length === 0) {
          throw new Error('Не удалось извлечь события из export.xlsx')
        }
        cachedEvents = events
        return events
      })
      .catch(async (error: unknown) => {
        const fallbackResponse = await fetch('/calls.csv', { cache: 'force-cache' })

        if (!fallbackResponse.ok) {
          throw error
        }

        const fallbackBuffer = await fallbackResponse.arrayBuffer()
        const fallbackEvents = parseCallsCsv(fallbackBuffer)
        cachedEvents = fallbackEvents
        return fallbackEvents
      })
      .finally(() => {
        loadPromise = null
      })
  }

  return loadPromise
}

export function useInsightEvents() {
  const [state, setState] = useState<InsightDataSourceState>(() => ({
    events: cachedEvents ?? [],
    status: cachedEvents ? 'ready' : 'idle',
    error: null,
  }))

  useEffect(() => {
    if (cachedEvents) {
      return
    }

    setState((previous) => ({
      ...previous,
      status: 'loading',
    }))

    loadInsightEventsFromSource()
      .then((events) => {
        setState({
          events,
          status: 'ready',
          error: null,
        })
      })
      .catch((error: unknown) => {
        setState({
          events: [],
          status: 'error',
          error: error instanceof Error ? error.message : 'Не удалось прочитать источник данных',
        })
      })
  }, [])

  return state
}
