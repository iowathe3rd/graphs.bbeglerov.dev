'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

function formatRangeLabel(date: DateRange | undefined) {
  if (!date?.from) {
    return null
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
}: DateRangePickerProps) {
  const isMobile = useIsMobile()
  const label = formatRangeLabel(date)

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
