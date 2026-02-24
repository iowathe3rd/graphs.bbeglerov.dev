'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { SlidersHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DashboardFilters, DetailedGranularity } from '@/components/dashboard-toolbar'
import {
  formatBucketLabel,
  normalizeDateRangeByGranularity,
  toDateKey,
} from '@/features/insight-dashboard/domain/date-bucketing'

interface DashboardMobileFilterSummaryProps {
  filters: DashboardFilters
  granularity: DetailedGranularity
  activeCount: number
  onOpenFilters: () => void
}

function formatDateRangeLabel(
  filters: DashboardFilters,
  granularity: DetailedGranularity
) {
  const normalized = normalizeDateRangeByGranularity(filters.dateRange, granularity)
  const from = normalized.from
  const to = normalized.to

  if (!from && !to) {
    return 'Все'
  }

  if (from && to) {
    const fromKey = toDateKey(from)
    const toKey = toDateKey(to)
    if (fromKey && toKey) {
      const fromLabel = formatBucketLabel(fromKey, granularity)
      const toLabel = formatBucketLabel(toKey, granularity)

      if (fromLabel === toLabel) {
        return fromLabel
      }

      return `${fromLabel} - ${toLabel}`
    }
  }

  if (from && to) {
    return `${format(from, 'dd MMM', { locale: ru })} - ${format(to, 'dd MMM', {
      locale: ru,
    })}`
  }

  const oneDay = from ?? to

  if (!oneDay) {
    return 'Все'
  }

  return format(oneDay, 'dd MMM', { locale: ru })
}

function granularityLabel(granularity: DetailedGranularity) {
  if (granularity === 'week') {
    return 'Неделя'
  }

  return 'Месяц'
}

export function DashboardMobileFilterSummary({
  filters,
  granularity,
  activeCount,
  onOpenFilters,
}: DashboardMobileFilterSummaryProps) {
  return (
    <div className="space-y-2 rounded-xl border border-border/80 bg-card/85 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">Активные фильтры</p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1.5 px-2.5 text-[11px] font-medium"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Фильтры ({activeCount})
        </Button>
      </div>

      <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Badge variant="outline" className="shrink-0 text-[11px]">
          Поток: {filters.sector}
        </Badge>
        <Badge variant="outline" className="shrink-0 text-[11px]">
          Продукт: {filters.productGroup}
        </Badge>
        <Badge variant="outline" className="shrink-0 text-[11px]">
          Период: {formatDateRangeLabel(filters, granularity)}
        </Badge>
        <Badge variant="outline" className="shrink-0 text-[11px]">
          Группировка: {granularityLabel(granularity)}
        </Badge>
      </div>
    </div>
  )
}
