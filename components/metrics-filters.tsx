'use client'

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
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export interface MetricsFilters {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  metrics: string[]
  channels: string[]
  tags: string[]
}

interface MetricsFiltersProps {
  filters: MetricsFilters
  onFiltersChange: (filters: MetricsFilters) => void
}

const AVAILABLE_CHANNELS = [
  'онлайн-банк',
  'мобильное приложение',
  'колл-центр',
  'отделение',
]

const AVAILABLE_TAGS = [
  'кредиты',
  'вклады',
  'переводы',
  'карты',
  'консультации',
]

export function MetricsFiltersComponent({
  filters,
  onFiltersChange,
}: MetricsFiltersProps) {
  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
      },
    })
  }

  const handleChannelToggle = (channel: string) => {
    const newChannels = filters.channels.includes(channel)
      ? filters.channels.filter((c) => c !== channel)
      : [...filters.channels, channel]
    onFiltersChange({ ...filters, channels: newChannels })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleReset = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      metrics: [],
      channels: [],
      tags: [],
    })
  }

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.channels.length > 0 ||
    filters.tags.length > 0

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Фильтры</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Дата от */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Дата от
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  format(filters.dateRange.from, 'dd MMM yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">Выберите дату</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={(date) => handleDateSelect(date, 'from')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Дата до */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Дата до
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to ? (
                  format(filters.dateRange.to, 'dd MMM yyyy', { locale: ru })
                ) : (
                  <span className="text-muted-foreground">Выберите дату</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={(date) => handleDateSelect(date, 'to')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Каналы */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Каналы обращения
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_CHANNELS.map((channel) => (
              <Badge
                key={channel}
                variant={
                  filters.channels.includes(channel) ? 'default' : 'outline'
                }
                className="cursor-pointer"
                onClick={() => handleChannelToggle(channel)}
              >
                {channel}
              </Badge>
            ))}
          </div>
        </div>

        {/* Теги */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Теги
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
