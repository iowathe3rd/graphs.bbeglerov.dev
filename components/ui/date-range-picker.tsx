'use client'

import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useMemo, useState } from 'react'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  buildPeriodRangeFromAnchor,
  formatBucketLabel,
  normalizeDateRangeByGranularity,
  toDateKey,
} from '@/features/insight-dashboard/logic/date-bucketing'
import type { PeriodGranularity } from '@/features/insight-dashboard/logic/metrics-catalog'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  placeholder?: string
  granularity?: PeriodGranularity
}

function formatRangeLabel(
  date: DateRange | undefined,
  granularity: PeriodGranularity
) {
  if (!date?.from) {
    return null
  }

  const normalized = normalizeDateRangeByGranularity(
    {
      from: date.from,
      to: date.to,
    },
    granularity
  )
  const fromKey = toDateKey(normalized.from)
  const toKey = toDateKey(normalized.to)

  if (!fromKey || !toKey) {
    return null
  }

  const fromLabel = formatBucketLabel(fromKey, granularity)
  const toLabel = formatBucketLabel(toKey, granularity)

  if (fromLabel === toLabel) {
    return fromLabel
  }

  return `${fromLabel} - ${toLabel}`
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = 'Выберите период',
  granularity = 'week',
}: DateRangePickerProps) {
  const isMobile = useIsMobile()
  const [hoveredDay, setHoveredDay] = useState<Date | undefined>(undefined)
  const label = formatRangeLabel(date, granularity)
  const committedRange = useMemo<DateRange | undefined>(() => {
    const normalized = normalizeDateRangeByGranularity(
      {
        from: date?.from,
        to: date?.to,
      },
      granularity
    )

    return {
      from: normalized.from,
      to: normalized.to,
    }
  }, [date?.from, date?.to, granularity])
  const previewRange = useMemo<DateRange | undefined>(() => {
    if (!hoveredDay) {
      return undefined
    }

    const period = buildPeriodRangeFromAnchor(hoveredDay, granularity)
    return {
      from: period.from,
      to: period.to,
    }
  }, [granularity, hoveredDay])
  const displayedRange = previewRange ?? committedRange

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          setHoveredDay(undefined)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-8 w-full justify-start px-2 text-left text-xs font-normal',
            className
          )}
        >
          <CalendarIcon className="mr-1 h-3.5 w-3.5" />
          {label ? (
            <span className="truncate">{label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0" align="start">
        <div onMouseLeave={() => setHoveredDay(undefined)}>
          <Calendar
            initialFocus
            mode="range"
            locale={ru}
            weekStartsOn={1}
            defaultMonth={committedRange?.from ?? date?.from}
            selected={displayedRange}
            onDayClick={(day) => {
              const nextRange = buildPeriodRangeFromAnchor(day, granularity)
              onDateChange({
                from: nextRange.from,
                to: nextRange.to,
              })
            }}
            onDayMouseEnter={(day) => {
              setHoveredDay(day)
            }}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
