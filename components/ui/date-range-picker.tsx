'use client'

import { format } from 'date-fns'
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
} from '@/features/insight-dashboard/domain/date-bucketing'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

type DateRangePickerGranularity = 'day' | 'week' | 'month'

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  placeholder?: string
  granularity?: DateRangePickerGranularity
}

function formatRangeLabel(
  date: DateRange | undefined,
  granularity: DateRangePickerGranularity
) {
  if (!date?.from) {
    return null
  }

  if (granularity === 'week' || granularity === 'month') {
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

  if (date.to) {
    return `${format(date.from, 'dd MMM', { locale: ru })} - ${format(
      date.to,
      'dd MMM',
      { locale: ru }
    )}`
  }

  return format(date.from, 'dd MMM', { locale: ru })
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
  placeholder = 'Выберите период',
  granularity = 'day',
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
    if (!hoveredDay || granularity === 'day') {
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
            defaultMonth={committedRange?.from ?? date?.from}
            selected={displayedRange}
            onSelect={(nextRange) => {
              if (granularity === 'day') {
                onDateChange(nextRange)
              }
            }}
            onDayClick={(day) => {
              if (granularity === 'day') {
                return
              }

              const nextRange = buildPeriodRangeFromAnchor(day, granularity)
              onDateChange({
                from: nextRange.from,
                to: nextRange.to,
              })
            }}
            onDayMouseEnter={(day) => {
              if (granularity === 'day') {
                return
              }

              setHoveredDay(day)
            }}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
