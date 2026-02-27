'use client'

import { RotateCcw } from 'lucide-react'

import {
  DEFAULT_SECTOR_OPTIONS,
} from '@/features/insight-dashboard/config/constants'
import { normalizeDateRangeByGranularity } from '@/features/insight-dashboard/logic/date-bucketing'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type {
  InsightSector,
  InsightFilters,
} from '@/features/insight-dashboard/logic/types'

export type ProductSituationGranularity = 'week' | 'month'

interface ProductSituationToolbarProps {
  filters: InsightFilters
  granularity?: ProductSituationGranularity
  sectorOptions?: string[]
  onFiltersChange: (filters: InsightFilters) => void
  onGranularityChange?: (granularity: ProductSituationGranularity) => void
  onReset: () => void
}

function isGranularity(value: string): value is ProductSituationGranularity {
  return value === 'week' || value === 'month'
}

export function ProductSituationToolbar({
  filters,
  granularity = 'week',
  sectorOptions = [...DEFAULT_SECTOR_OPTIONS],
  onFiltersChange,
  onGranularityChange,
  onReset,
}: ProductSituationToolbarProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-2.5 backdrop-blur md:p-3">
      <div className="grid gap-1.5 md:grid-cols-[160px_1fr_auto] md:items-end md:gap-2">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Поток</p>
          <Select
            value={filters.sector}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sector: value as InsightSector,
              })
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
          <p className="text-[11px] text-muted-foreground">Период</p>
          <DateRangePicker
            date={filters.dateRange}
            placeholder="Все"
            className="h-8 max-w-64 md:h-7"
            granularity={granularity}
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

        <div className="flex flex-wrap items-end gap-2 md:justify-end">
          <ToggleGroup
            type="single"
            value={granularity}
            onValueChange={(value) => {
              if (!onGranularityChange) {
                return
              }

              if (isGranularity(value)) {
                onGranularityChange(value)
              } else if (!value) {
                onGranularityChange('week')
              }
            }}
            className="justify-start gap-1"
          >
            <ToggleGroupItem value="week" variant="outline" size="sm" className="h-8 px-2 text-xs md:h-7">
              Неделя
            </ToggleGroupItem>
            <ToggleGroupItem value="month" variant="outline" size="sm" className="h-8 px-2 text-xs md:h-7">
              Месяц
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            className="h-8 w-auto px-2.5 text-[12px] md:h-7"
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
