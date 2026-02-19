'use client'

import { useEffect, useState } from 'react'

import { parseCallsCsv } from '@/features/insight-dashboard/domain/calls-csv'
import type { InsightEvent } from '@/features/insight-dashboard/domain/types'

type InsightEventsStatus = 'idle' | 'loading' | 'ready' | 'error'

interface InsightEventsState {
  events: InsightEvent[]
  status: InsightEventsStatus
  error: string | null
}

let cachedEvents: InsightEvent[] | null = null
let loadPromise: Promise<InsightEvent[]> | null = null

async function loadInsightEventsFromCsv(): Promise<InsightEvent[]> {
  if (cachedEvents) {
    return cachedEvents
  }

  if (!loadPromise) {
    loadPromise = fetch('/calls.csv', { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Не удалось загрузить calls.csv (${response.status})`)
        }

        const buffer = await response.arrayBuffer()
        const events = parseCallsCsv(buffer)
        cachedEvents = events
        return events
      })
      .finally(() => {
        loadPromise = null
      })
  }

  return loadPromise
}

export function useInsightEvents() {
  const [state, setState] = useState<InsightEventsState>(() => ({
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

    loadInsightEventsFromCsv()
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
          error: error instanceof Error ? error.message : 'Не удалось прочитать calls.csv',
        })
      })
  }, [])

  return state
}
