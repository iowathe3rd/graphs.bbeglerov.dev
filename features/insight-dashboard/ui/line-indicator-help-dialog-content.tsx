'use client'

import { Badge } from '@/components/ui/badge'

import {
  getIndicatorTooltipCopy,
} from '@/features/insight-dashboard/config/indicator-tooltip-copy'
import { METRICS } from '@/lib/metrics-data'

interface LineIndicatorHelpDialogContentProps {
  metricId?: string
}

export function LineIndicatorHelpDialogContent({ metricId }: LineIndicatorHelpDialogContentProps) {
  const metric = metricId ? METRICS[metricId] : null
  const copy = metricId ? getIndicatorTooltipCopy(metricId) : null

  if (!metric || !copy) {
    return (
      <section className="rounded-md border border-border/70 p-3">
        <p className="text-sm leading-6 text-muted-foreground">
          Детальное описание для выбранного индикатора пока недоступно.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-md border border-border/70 p-3">
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5"
            style={{ borderColor: `${metric.color}66`, color: metric.color }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            {copy.title}
          </Badge>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/30 p-2.5">
          <p className="font-medium text-foreground">Когда тег ставится</p>
          <p className="mt-1">{copy.appliesWhen}</p>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/30 p-2.5">
          <p className="font-medium text-foreground">Тег НЕ ставится, если:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {copy.notAppliedWhen.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
