'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductSituationDomainPoint } from '@/lib/product-situation-analytics'

interface ProductSituationExecutiveRiskTableProps {
  items: ProductSituationDomainPoint[]
}

function zoneMeta(zone: ProductSituationDomainPoint['zone']) {
  if (zone === 'green') {
    return {
      label: 'Норма',
      className: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    }
  }

  if (zone === 'yellow') {
    return {
      label: 'Внимание',
      className: 'border-amber-200 bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Критично',
    className: 'border-red-200 bg-red-100 text-red-700',
  }
}

export function ProductSituationExecutiveRiskTable({
  items,
}: ProductSituationExecutiveRiskTableProps) {
  const topItems = items.slice(0, 5)

  if (topItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Риск по продуктам</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Риск по продуктам</CardTitle>
        <p className="text-xs text-muted-foreground">
          Топ-5 продуктов с самым низким индексом здоровья.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {topItems.map((item) => {
          const zone = zoneMeta(item.zone)

          return (
            <div
              key={item.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
            >
              <p className="truncate text-sm font-medium">{item.label}</p>
              <span className="text-sm font-semibold tabular-nums">
                {item.healthIndex.toFixed(1)}
              </span>
              <Badge variant="outline" className={`text-[11px] ${zone.className}`}>
                {zone.label}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
