'use client'

import { useMemo } from 'react'

import { DashboardOverlapCard } from '@/components/dashboard-overlap-card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type {
  OverlapAnalytics,
  OverlapGranularity,
  OverlapZone,
  OverlapZoneConfig,
} from '@/lib/metrics-data'

interface DashboardOverlapDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: OverlapAnalytics
  granularity: OverlapGranularity
  selectedSeries: string[]
  onSelectedSeriesChange: (next: string[]) => void
  seriesColorMap?: Record<string, string>
  zones?: OverlapZoneConfig
}

function zoneLabel(zone: OverlapZone) {
  if (zone === 'red') {
    return 'Красная'
  }

  if (zone === 'yellow') {
    return 'Жёлтая'
  }

  return 'Зелёная'
}

function zoneBadgeClass(zone: OverlapZone) {
  if (zone === 'red') {
    return 'border-red-200 bg-red-100 text-red-700'
  }

  if (zone === 'yellow') {
    return 'border-amber-200 bg-amber-100 text-amber-700'
  }

  return 'border-emerald-200 bg-emerald-100 text-emerald-700'
}

export function DashboardOverlapDetailsSheet({
  open,
  onOpenChange,
  data,
  granularity,
  selectedSeries,
  onSelectedSeriesChange,
  seriesColorMap,
  zones,
}: DashboardOverlapDetailsSheetProps) {
  const topRows = useMemo(
    () =>
      [...data.snapshot]
        .sort((a, b) => b.overlapRate - a.overlapRate)
        .slice(0, 8),
    [data.snapshot]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90dvh] rounded-t-2xl p-0 sm:max-h-none"
      >
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="px-4 pb-2 pt-3">
            <SheetTitle className="text-base">Детали температурной карты</SheetTitle>
            <SheetDescription className="text-xs">
              Расширенный обзор и топ пересечений по текущим фильтрам.
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pb-4">
            <div className="h-[52dvh] min-h-[360px] max-h-[56dvh]">
              <DashboardOverlapCard
                data={data}
                granularity={granularity}
                selectedSeries={selectedSeries}
                onSelectedSeriesChange={onSelectedSeriesChange}
                seriesColorMap={seriesColorMap}
                zones={zones}
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-card/70 p-3">
              <h3 className="text-sm font-semibold">Топ пересечений</h3>
              {topRows.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">Нет данных</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {topRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md border border-border/60 px-2 py-1.5"
                    >
                      <p className="truncate text-xs font-medium">{row.label}</p>
                      <span className="text-xs font-semibold tabular-nums text-foreground/90">
                        {row.overlapRate.toFixed(1)}%
                      </span>
                      <Badge
                        variant="outline"
                        className={`${zoneBadgeClass(row.zone)} whitespace-nowrap`}
                      >
                        {zoneLabel(row.zone)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
