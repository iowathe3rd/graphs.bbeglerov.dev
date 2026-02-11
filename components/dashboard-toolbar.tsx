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
  CATEGORIES_BY_PRODUCT,
  CHANNELS,
  CONTACT_TAGS,
  PRODUCT_GROUPS,
  SECTORS,
  SUB_PRODUCTS_BY_GROUP,
  type ProductGroup,
  type Sector,
} from '@/lib/metrics-data'

export interface DashboardFilters {
  sector: Sector
  channel: string | 'all'
  productGroup: ProductGroup | 'all'
  category: string | 'all'
  subProduct: string | 'all'
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
  sector: 'БММБ',
  channel: 'all',
  productGroup: 'all',
  category: 'all',
  subProduct: 'all',
  tag: 'all',
  dateRange: {
    from: undefined,
    to: undefined,
  },
}

function getSubProducts(group: ProductGroup | 'all') {
  const uniqueOrdered = (items: readonly string[]) => {
    const result: string[] = []
    const seen = new Set<string>()

    for (const item of items) {
      if (seen.has(item)) continue
      seen.add(item)
      result.push(item)
    }

    return result
  }

  if (group === 'all') {
    return uniqueOrdered(PRODUCT_GROUPS.flatMap((item) => SUB_PRODUCTS_BY_GROUP[item]))
  }

  return uniqueOrdered(SUB_PRODUCTS_BY_GROUP[group])
}

function getCategories(group: ProductGroup | 'all') {
  if (group === 'all') {
    return Array.from(new Set(PRODUCT_GROUPS.flatMap((item) => CATEGORIES_BY_PRODUCT[item])))
  }

  return [...CATEGORIES_BY_PRODUCT[group]]
}

export function DashboardToolbar({
  filters,
  onFiltersChange,
  onReset,
}: DashboardToolbarProps) {
  const subProducts = getSubProducts(filters.productGroup)
  const categories = getCategories(filters.productGroup)

  return (
    <div className="rounded-xl border border-border/80 bg-card/85 p-3 backdrop-blur">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-8">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Сектор</p>
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
                productGroup: value as ProductGroup | 'all',
                category: 'all',
                subProduct: 'all',
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {PRODUCT_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Категория</p>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                category: value,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Подкатегория</p>
          <Select
            value={filters.subProduct}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                subProduct: value,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {subProducts.map((subProduct) => (
                <SelectItem key={subProduct} value={subProduct}>
                  {subProduct}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Канал</p>
          <Select
            value={filters.channel}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                channel: value,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {CHANNELS.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectValue />
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
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
