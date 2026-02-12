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
  CONTACT_TAGS,
  PRODUCT_GROUPS,
  SECTORS,
  type ProductGroup,
  type Sector,
} from '@/lib/metrics-data'

export const FIXED_CHANNEL = 'Мобильный банк' as const

export interface DashboardFilters {
  sector: Sector
  channel: typeof FIXED_CHANNEL
  productGroup: ProductGroup
  tag: string | 'all'
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

interface DashboardToolbarProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onReset: () => void
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  sector: 'РБ',
  channel: FIXED_CHANNEL,
  productGroup: PRODUCT_GROUPS[0],
  tag: 'all',
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

export function DashboardToolbar({
  filters,
  onFiltersChange,
  onReset,
}: DashboardToolbarProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-3 backdrop-blur">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Поток</p>
          <Select
            value={filters.sector}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, sector: value as Sector })
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
                productGroup: value as ProductGroup,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
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
          <div className="flex h-8 items-center rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
            {filters.channel}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Тег</p>
          <Select
            value={filters.tag}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                tag: value,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {CONTACT_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2 xl:col-span-1">
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

        <div className="flex items-end">
          <Button
            variant="outline"
            className="h-8 w-full text-xs"
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
