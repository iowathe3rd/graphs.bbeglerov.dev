'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { RotateCcw } from 'lucide-react'

import {
  DEFAULT_DASHBOARD_FILTERS,
  FIXED_CHANNEL,
  type DashboardFilters,
} from '@/components/dashboard-toolbar'
import {
  DEFAULT_PRODUCT_OPTIONS,
  DEFAULT_SECTOR_OPTIONS,
} from '@/features/insight-dashboard/config/constants'
import type {
  InsightProductGroup,
  InsightSector,
} from '@/features/insight-dashboard/domain/types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  type OverlapGranularity,
} from '@/lib/metrics-data'

interface DashboardMobileFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFilters: DashboardFilters
  initialGranularity: OverlapGranularity
  sectorOptions?: string[]
  productOptions?: string[]
  channelLabel?: string
  onApply: (filters: DashboardFilters, granularity: OverlapGranularity) => void
  onResetAndApply: () => void
}

function cloneFilters(filters: DashboardFilters): DashboardFilters {
  return {
    ...filters,
    dateRange: {
      from: filters.dateRange.from ? new Date(filters.dateRange.from) : undefined,
      to: filters.dateRange.to ? new Date(filters.dateRange.to) : undefined,
    },
  }
}

function periodLabel(range: DashboardFilters['dateRange']) {
  const from = range.from
  const to = range.to

  if (!from && !to) {
    return 'Все даты'
  }

  if (from && to) {
    return `${format(from, 'dd MMM', { locale: ru })} - ${format(to, 'dd MMM', {
      locale: ru,
    })}`
  }

  const oneDate = from ?? to

  if (!oneDate) {
    return 'Все даты'
  }

  return format(oneDate, 'dd MMM', { locale: ru })
}

export function DashboardMobileFilterSheet({
  open,
  onOpenChange,
  initialFilters,
  initialGranularity,
  sectorOptions = [...DEFAULT_SECTOR_OPTIONS],
  productOptions = [...DEFAULT_PRODUCT_OPTIONS],
  channelLabel = FIXED_CHANNEL,
  onApply,
  onResetAndApply,
}: DashboardMobileFilterSheetProps) {
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(() =>
    cloneFilters(initialFilters)
  )
  const [draftGranularity, setDraftGranularity] =
    useState<OverlapGranularity>(initialGranularity)

  useEffect(() => {
    if (!open) {
      return
    }

    setDraftFilters(cloneFilters(initialFilters))
    setDraftGranularity(initialGranularity)
  }, [open, initialFilters, initialGranularity])

  const handleApply = () => {
    onApply(draftFilters, draftGranularity)
  }

  const handleClearPeriod = () => {
    setDraftFilters({
      ...draftFilters,
      dateRange: {
        from: undefined,
        to: undefined,
      },
    })
  }

  const handleReset = () => {
    setDraftFilters(DEFAULT_DASHBOARD_FILTERS)
    setDraftGranularity('day')
    onResetAndApply()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90dvh] rounded-t-2xl p-0 sm:max-h-none"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="border-b border-border/70 px-4 pb-2 pt-3">
            <SheetTitle className="text-base">Фильтры</SheetTitle>
            <SheetDescription className="text-xs">
              Изменения применяются только после нажатия «Применить».
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-auto px-4 pb-4">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">Поток</p>
              <Select
                value={draftFilters.sector}
                onValueChange={(value) =>
                  setDraftFilters({
                    ...draftFilters,
                    sector: value as InsightSector,
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs">
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
                value={draftFilters.productGroup}
                onValueChange={(value) =>
                  setDraftFilters({
                    ...draftFilters,
                    productGroup: value as InsightProductGroup,
                  })
                }
              >
                <SelectTrigger className="h-9 text-xs">
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
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
                {channelLabel === 'Колл-центр' ? 'КЦ (звонки)' : channelLabel}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">Период</p>
              <div className="overflow-hidden rounded-lg border border-input bg-card">
                <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
                  <p className="truncate text-xs font-medium text-foreground/85">
                    {periodLabel(draftFilters.dateRange)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-[11px]"
                    disabled={
                      !draftFilters.dateRange.from && !draftFilters.dateRange.to
                    }
                    onClick={handleClearPeriod}
                  >
                    Очистить
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={draftFilters.dateRange}
                  defaultMonth={draftFilters.dateRange.from}
                  onSelect={(date) =>
                    setDraftFilters({
                      ...draftFilters,
                      dateRange: {
                        from: date?.from,
                        to: date?.to,
                      },
                    })
                  }
                  className="mx-auto w-fit p-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">Группировка</p>
              <Select
                value={draftGranularity}
                onValueChange={(value) =>
                  setDraftGranularity(value as OverlapGranularity)
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">День</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border/70 bg-background px-4 py-3">
            <Button variant="outline" className="h-9 text-xs" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Сбросить
            </Button>
            <Button className="h-9 text-xs" onClick={handleApply}>
              Применить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
