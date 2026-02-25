'use client'

import { CircleHelp } from 'lucide-react'
import type { ReactNode } from 'react'

import type { InsightHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface InsightHelpDialogButtonProps {
  copy: InsightHelpDialogCopy
  ariaLabel: string
  triggerClassName?: string
  contentClassName?: string
}

type ZoneKey = 'green' | 'yellow' | 'red'

function zoneDotClass(zone: ZoneKey): string {
  if (zone === 'green') {
    return 'bg-emerald-500'
  }

  if (zone === 'yellow') {
    return 'bg-amber-500'
  }

  return 'bg-red-500'
}

function zoneBorderClass(zone: ZoneKey): string {
  if (zone === 'green') {
    return 'border-emerald-300/80 text-emerald-700'
  }

  if (zone === 'yellow') {
    return 'border-amber-300/80 text-amber-700'
  }

  return 'border-red-300/80 text-red-700'
}

function indicatorColorByLabel(label: string): string {
  if (label.includes('Техническая проблема/сбои')) {
    return '#2563eb'
  }

  if (label.includes('Запрос не решен')) {
    return '#f97316'
  }

  if (label.includes('Отрицательный продуктовый фидбэк')) {
    return '#0f766e'
  }

  if (label.includes('Угроза ухода/отказа')) {
    return '#dc2626'
  }

  return '#64748b'
}

function formatThreshold(value: number): string {
  const rounded = Math.round(value * 10) / 10
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(1)
}

function renderPoint(
  point: string,
  key: string,
  zoneThresholds?: {
    lower: number
    upper: number
  }
) {
  const normalized = point.trim()
  const indicatorMatch = /^o\s+«(.+)»\s*(≤|≥)\s*([0-9]+(?:[.,][0-9]+)?%)\.?$/u.exec(normalized)

  if (indicatorMatch) {
    const label = indicatorMatch[1] ?? ''
    const operator = indicatorMatch[2] ?? ''
    const value = indicatorMatch[3] ?? ''

    return (
      <div key={key} className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 px-2 py-1">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: indicatorColorByLabel(label) }}
        />
        <span className="text-foreground/95">o «{label}»</span>
        <Badge variant="secondary">
          {operator} {value}
        </Badge>
      </div>
    )
  }

  const extras: ReactNode[] = []

  if (
    normalized ===
      '«Оценка неудовлетворенности продукта» рассчитывается как сумма произведений: доля каждого индикатора × весовой коэффициент соответствующего индикатора.'
  ) {
    extras.push(
      <div key={`${key}-formula`} className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">доля каждого индикатора</Badge>
        <span className="text-muted-foreground">×</span>
        <Badge variant="outline">весовой коэффициент</Badge>
      </div>
    )
  }

  if (normalized === 'Состояние продукта классифицируется по трем зонам:') {
    const lower = zoneThresholds ? formatThreshold(zoneThresholds.lower) : null
    const upper = zoneThresholds ? formatThreshold(zoneThresholds.upper) : null

    extras.push(
      <div key={`${key}-zones`} className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <Badge variant="outline" className={cn('gap-1', zoneBorderClass('green'))}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', zoneDotClass('green'))} />
            {lower ? `Зеленая ≤ ${lower}` : 'Зеленая зона'}
          </Badge>
          <Badge variant="outline" className={cn('gap-1', zoneBorderClass('yellow'))}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', zoneDotClass('yellow'))} />
            {lower && upper ? `Желтая ${lower}–${upper}` : 'Желтая зона'}
          </Badge>
          <Badge variant="outline" className={cn('gap-1', zoneBorderClass('red'))}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', zoneDotClass('red'))} />
            {upper ? `Красная ≥ ${upper}` : 'Красная зона'}
          </Badge>
        </div>
        <div className="space-y-1 text-muted-foreground">
          <p>Зеленая зона: целевое состояние, в пределах нормы.</p>
          <p>Желтая зона: зона внимания, требуется контроль динамики.</p>
          <p>Красная зона: критическая зона, нужен приоритетный план действий.</p>
        </div>
      </div>
    )
  }

  if (normalized === 'Размер пузыря пропорционален числу обращений.') {
    extras.push(
      <div key={`${key}-bubble`} className="mt-2 flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1">
        <span className="relative inline-flex h-6 w-6 items-center justify-center">
          <span className="h-4.5 w-4.5 rounded-full border-2 border-emerald-700 bg-emerald-400/30" />
        </span>
        <Badge variant="outline">Размер пузыря = объем обращений</Badge>
      </div>
    )
  }

  return (
    <div key={key}>
      <p>{point}</p>
      {extras}
    </div>
  )
}

export function InsightHelpDialogButton({
  copy,
  ariaLabel,
  triggerClassName,
  contentClassName,
}: InsightHelpDialogButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground',
            triggerClassName
          )}
          aria-label={ariaLabel}
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-2xl', contentClassName)}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          {copy.description ? <DialogDescription>{copy.description}</DialogDescription> : null}
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="space-y-3 text-sm leading-6">
            {copy.sections.map((section) => {
              return (
                <section key={section.title} className="rounded-md border border-border/70 p-3">
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <div className="mt-1 space-y-2 text-muted-foreground">
                    {section.points.map((point, index) =>
                      renderPoint(
                        point,
                        `${section.title}-${index}-${point}`,
                        copy.zoneThresholds
                      )
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
