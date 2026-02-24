'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
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
  const label = formatRangeLabel(date, granularity)

  return (
    <Popover>
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
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={isMobile ? 1 : 2}
        />
      </PopoverContent>
    </Popover>
  )
}
