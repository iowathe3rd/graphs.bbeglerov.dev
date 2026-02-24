'use client'

import { RotateCcw } from 'lucide-react'

import {
  DEFAULT_PRODUCT_OPTIONS,
  DEFAULT_SECTOR_OPTIONS,
} from '@/features/insight-dashboard/config/constants'
import { normalizeDateRangeByGranularity } from '@/features/insight-dashboard/domain/date-bucketing'
import type {
  InsightProductGroup,
  InsightSector,
} from '@/features/insight-dashboard/domain/types'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DetailedGranularity = 'week' | 'month'

export const FIXED_CHANNEL = 'Колл-центр' as const

export interface DashboardFilters {
  sector: InsightSector
  channel: string
  productGroup: InsightProductGroup
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface DashboardToolbarProps {
  filters: DashboardFilters
  granularity: DetailedGranularity
  sectorOptions?: string[]
  productOptions?: string[]
  onFiltersChange: (filters: DashboardFilters) => void
  onGranularityChange: (granularity: DetailedGranularity) => void
  onReset: () => void
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  sector: DEFAULT_SECTOR_OPTIONS[0],
  channel: FIXED_CHANNEL,
  productGroup: DEFAULT_PRODUCT_OPTIONS[0],
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

export function DashboardToolbar({
  filters,
  granularity,
  sectorOptions = [...DEFAULT_SECTOR_OPTIONS],
  productOptions = [...DEFAULT_PRODUCT_OPTIONS],
  onFiltersChange,
  onGranularityChange,
  onReset,
}: DashboardToolbarProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-2.5 backdrop-blur md:p-3">
      <div className="grid gap-1.5 md:gap-2 md:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(120px,1fr)_minmax(160px,190px)]">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Поток</p>
          <Select
            value={filters.sector}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, sector: value as InsightSector })
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sectorOptions.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Продукт</p>
          <Select
            value={filters.productGroup}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                productGroup: value as InsightProductGroup,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productOptions.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Канал обращения</p>
          <div className="flex h-8 items-center rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground md:h-7">
            КЦ (звонки)
          </div>
        </div>

        <div className="space-y-1 md:col-span-2 xl:col-span-1">
          <p className="text-[11px] text-muted-foreground">Период</p>
          <DateRangePicker
            date={filters.dateRange}
            placeholder="Все"
            granularity={granularity}
            className="h-8 md:h-7"
            onDateChange={(date) =>
              onFiltersChange({
                ...filters,
                dateRange: normalizeDateRangeByGranularity(
                  {
                    from: date?.from,
                    to: date?.to,
                  },
                  granularity
                ),
              })
            }
          />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Группировка</p>
          <Select
            value={granularity}
            onValueChange={(value) =>
              onGranularityChange(value as DetailedGranularity)
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden xl:block" aria-hidden />

        <div className="flex items-end xl:justify-end">
          <Button
            variant="outline"
            className="h-8 w-full text-[12px] md:h-7 xl:w-[190px]"
            onClick={onReset}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Сброс
          </Button>
        </div>
      </div>
    </div>
  )
}
