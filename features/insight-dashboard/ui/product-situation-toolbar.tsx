'use client'

import { RotateCcw } from 'lucide-react'

import {
  DEFAULT_PRODUCT_OPTIONS,
  DEFAULT_SECTOR_OPTIONS,
} from '@/features/insight-dashboard/config/constants'
import { normalizeDateRangeByGranularity } from '@/features/insight-dashboard/domain/date-bucketing'
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
  InsightProductGroup,
  InsightSector,
  InsightFilters,
  ProductSituationMode,
} from '@/features/insight-dashboard/domain/types'
import { cn } from '@/lib/utils'

export type ProductSituationExecutiveGranularity = 'week' | 'month'
export type ProductSituationToolbarVariant = 'executive' | 'home'

interface ProductSituationToolbarProps {
  variant?: ProductSituationToolbarVariant
  filters: InsightFilters
  granularity?: ProductSituationExecutiveGranularity
  mode?: ProductSituationMode
  sectorOptions?: string[]
  productOptions?: string[]
  onFiltersChange: (filters: InsightFilters) => void
  onGranularityChange?: (granularity: ProductSituationExecutiveGranularity) => void
  onModeChange?: (mode: ProductSituationMode) => void
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
  variant = 'executive',
  filters,
  granularity = 'month',
  mode = 'combo',
  sectorOptions = [...DEFAULT_SECTOR_OPTIONS],
  productOptions = [...DEFAULT_PRODUCT_OPTIONS],
  onFiltersChange,
  onGranularityChange,
  onModeChange,
  onReset,
}: ProductSituationToolbarProps) {
  const isHome = variant === 'home'

  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-2.5 backdrop-blur md:p-3">
      <div
        className={cn(
          'grid gap-1.5 md:gap-2',
          isHome
            ? 'md:grid-cols-[160px_1fr_auto] md:items-end'
            : 'md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]'
        )}
      >
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

        {!isHome ? (
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground">Продукт</p>
            <Select
              value={filters.productGroup}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  productGroup: value as InsightProductGroup | 'all',
                })
              }
            >
              <SelectTrigger className="h-8 text-xs md:h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все продукты</SelectItem>
                {productOptions.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Период</p>
          <DateRangePicker
            date={filters.dateRange}
            placeholder="Все"
            className="h-8 md:h-7 max-w-64"
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

        {isHome ? (
          <div className="flex flex-wrap items-end gap-2 md:justify-end">
            <ToggleGroup
              type="single"
              value={granularity}
              onValueChange={(value) => {
                if (!onGranularityChange) {
                  return
                }

                if (isExecutiveGranularity(value)) {
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
        ) : null}
      </div>

      {!isHome ? (
        <div className="mt-3 grid gap-2 md:grid-cols-[auto_auto_1fr] md:items-end">
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground">Показать</p>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => {
                if (!onModeChange) {
                  return
                }

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
                if (!onGranularityChange) {
                  return
                }

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
      ) : null}
    </div>
  )
}
