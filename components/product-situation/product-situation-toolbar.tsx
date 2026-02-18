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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PRODUCT_GROUPS, SECTORS, type ProductGroup, type Sector } from '@/lib/metrics-data'
import type {
  ProductSituationFilters,
  ProductSituationMode,
} from '@/lib/product-situation-analytics'

export type ProductSituationExecutiveGranularity = 'week' | 'month'

interface ProductSituationToolbarProps {
  filters: ProductSituationFilters
  granularity: ProductSituationExecutiveGranularity
  mode: ProductSituationMode
  onFiltersChange: (filters: ProductSituationFilters) => void
  onGranularityChange: (granularity: ProductSituationExecutiveGranularity) => void
  onModeChange: (mode: ProductSituationMode) => void
  onReset: () => void
}

function isExecutiveGranularity(
  value: string
): value is ProductSituationExecutiveGranularity {
  return value === 'week' || value === 'month'
}

function isMode(value: string): value is ProductSituationMode {
  return value === 'rate' || value === 'volume' || value === 'combo'
}

export function ProductSituationToolbar({
  filters,
  granularity,
  mode,
  onFiltersChange,
  onGranularityChange,
  onModeChange,
  onReset,
}: ProductSituationToolbarProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-3 backdrop-blur">
      <div className="grid gap-2 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Поток</p>
          <Select
            value={filters.sector}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sector: value as Sector,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
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
                productGroup: value as ProductGroup | 'all',
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все продукты</SelectItem>
              {PRODUCT_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
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
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[auto_auto_1fr] md:items-end">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Показать</p>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value) => {
              if (isMode(value)) {
                onModeChange(value)
              } else if (!value) {
                onModeChange('combo')
              }
            }}
            className="justify-start gap-1"
          >
            <ToggleGroupItem value="rate" variant="outline" size="sm" className="h-8 px-2 text-xs">
              %
            </ToggleGroupItem>
            <ToggleGroupItem value="volume" variant="outline" size="sm" className="h-8 px-2 text-xs">
              Кол-во
            </ToggleGroupItem>
            <ToggleGroupItem value="combo" variant="outline" size="sm" className="h-8 px-2 text-xs">
              Комбо
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Детализация</p>
          <ToggleGroup
            type="single"
            value={granularity}
            onValueChange={(value) => {
              if (isExecutiveGranularity(value)) {
                onGranularityChange(value)
              } else if (!value) {
                onGranularityChange('month')
              }
            }}
            className="justify-start gap-1"
          >
            <ToggleGroupItem value="week" variant="outline" size="sm" className="h-8 px-2 text-xs">
              Неделя
            </ToggleGroupItem>
            <ToggleGroupItem value="month" variant="outline" size="sm" className="h-8 px-2 text-xs">
              Месяц
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-end md:justify-end">
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={onReset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Сброс
          </Button>
        </div>
      </div>
    </div>
  )
}
