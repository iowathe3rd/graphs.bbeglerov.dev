'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductSituationDriverRow } from '@/lib/product-situation-analytics'

interface ProductSituationExecutiveDriversProps {
  drivers: ProductSituationDriverRow[]
}

function trendMeta(row: ProductSituationDriverRow) {
  if (row.trend === 'up') {
    return {
      label: `↑ +${Math.abs(row.deltaContributionRate).toFixed(1)}`,
      className: 'border-red-200 bg-red-100 text-red-700',
    }
  }

  if (row.trend === 'down') {
    return {
      label: `↓ -${Math.abs(row.deltaContributionRate).toFixed(1)}`,
      className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    }
  }

  return {
    label: '≈ 0.0',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  }
}

export function ProductSituationExecutiveDrivers({
  drivers,
}: ProductSituationExecutiveDriversProps) {
  const topDrivers = drivers.slice(0, 5)

  if (topDrivers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Что ухудшает здоровье</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Что ухудшает здоровье</CardTitle>
        <p className="text-xs text-muted-foreground">
          Топ причин, формирующих проблемные обращения в выбранном периоде.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {topDrivers.map((row) => {
          const trend = trendMeta(row)

          return (
            <div
              key={row.tag}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
            >
              <p className="truncate text-sm font-medium">{row.label}</p>
              <span className="text-sm font-semibold tabular-nums">
                {row.contributionRate.toFixed(1)}%
              </span>
              <Badge variant="outline" className={`text-[11px] ${trend.className}`}>
                {trend.label}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
