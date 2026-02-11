'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, RotateCcw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CHANNELS,
  PRODUCT_GROUPS,
  PROCESSES,
  SECTORS,
  SUB_PRODUCTS_BY_GROUP,
  type ProductGroup,
  type Sector,
} from '@/lib/metrics-data'

export interface MetricsFilters {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  sectors: Sector[]
  channels: string[]
  processes: string[]
  productGroup: ProductGroup | 'all'
  subProduct: string | 'all'
}

interface MetricsFiltersProps {
  filters: MetricsFilters
  onFiltersChange: (filters: MetricsFilters) => void
  onReset?: () => void
}

export const DEFAULT_FILTERS: MetricsFilters = {
  dateRange: { from: undefined, to: undefined },
  sectors: ['БММБ'],
  channels: [],
  processes: [],
  productGroup: 'all',
  subProduct: 'all',
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

function getSubProducts(group: ProductGroup | 'all') {
  if (group === 'all') {
    return PRODUCT_GROUPS.flatMap((item) => SUB_PRODUCTS_BY_GROUP[item])
  }

  return [...SUB_PRODUCTS_BY_GROUP[group]]
}

export function MetricsFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: MetricsFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.dateRange.from) ||
    Boolean(filters.dateRange.to) ||
    filters.channels.length > 0 ||
    filters.processes.length > 0 ||
    filters.sectors[0] !== DEFAULT_FILTERS.sectors[0] ||
    filters.productGroup !== 'all' ||
    filters.subProduct !== 'all'

  const subProducts = getSubProducts(filters.productGroup)

  const handleReset = () => {
    if (onReset) {
      onReset()
      return
    }

    onFiltersChange(DEFAULT_FILTERS)
  }

  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Фильтры</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={handleReset}
          disabled={!hasActiveFilters}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Сектор</label>
          <Select
            value={filters.sectors[0]}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, sectors: [value as Sector] })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Сектор" />
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

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Product Group</label>
          <Select
            value={filters.productGroup}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                productGroup: value as ProductGroup | 'all',
                subProduct: 'all',
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Product Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все группы</SelectItem>
              {PRODUCT_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Sub Product</label>
          <Select
            value={filters.subProduct}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                subProduct: value,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Sub Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подпродукты</SelectItem>
              {subProducts.map((subProduct) => (
                <SelectItem key={subProduct} value={subProduct}>
                  {subProduct}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Период: от</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-full justify-start bg-transparent text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  format(filters.dateRange.from, 'dd MMM yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">Не задан</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={(date) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, from: date },
                  })
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Период: до</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-full justify-start bg-transparent text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to ? (
                  format(filters.dateRange.to, 'dd MMM yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">Не задан</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={(date) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, to: date },
                  })
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Каналы</label>
          <div className="flex min-h-9 flex-wrap gap-1.5 rounded-md border border-border p-1.5">
            {CHANNELS.map((channel) => (
              <Badge
                key={channel}
                variant={filters.channels.includes(channel) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    channels: toggleValue(filters.channels, channel),
                  })
                }
              >
                {channel}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-2">
          <label className="text-xs text-muted-foreground">Процессы</label>
          <div className="flex flex-wrap gap-1.5 rounded-md border border-border p-1.5">
            {PROCESSES.map((process) => (
              <Badge
                key={process}
                variant={filters.processes.includes(process) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    processes: toggleValue(filters.processes, process),
                  })
                }
              >
                {process}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
