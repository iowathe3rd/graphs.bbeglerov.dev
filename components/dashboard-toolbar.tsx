'use client'

import { RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type OverlapGranularity,
  PRODUCT_GROUPS,
  SECTORS,
  type ProductGroup,
  type Sector,
} from '@/lib/metrics-data'

export const FIXED_CHANNEL = 'Колл-центр' as const

export interface DashboardFilters {
  sector: Sector
  channel: typeof FIXED_CHANNEL
  productGroup: ProductGroup
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface DashboardToolbarProps {
  filters: DashboardFilters
  granularity: OverlapGranularity
  onFiltersChange: (filters: DashboardFilters) => void
  onGranularityChange: (granularity: OverlapGranularity) => void
  onReset: () => void
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  sector: 'РБ',
  channel: FIXED_CHANNEL,
  productGroup: PRODUCT_GROUPS[0],
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

export function DashboardToolbar({
  filters,
  granularity,
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
              onFiltersChange({ ...filters, sector: value as Sector })
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
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
                productGroup: value as ProductGroup,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_GROUPS.map((group) => (
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
            className="h-8 md:h-7"
            onDateChange={(date) =>
              onFiltersChange({
                ...filters,
                dateRange: {
                  from: date?.from,
                  to: date?.to,
                },
              })
            }
          />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Группировка</p>
          <Select
            value={granularity}
            onValueChange={(value) =>
              onGranularityChange(value as OverlapGranularity)
            }
          >
            <SelectTrigger className="h-8 text-xs md:h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">День</SelectItem>
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
