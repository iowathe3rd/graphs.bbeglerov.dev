'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ZoneKey = 'green' | 'yellow' | 'red'

const ZONE_STYLES: Record<ZoneKey, { dot: string; badge: string; card: string }> = {
  green: {
    dot: 'bg-emerald-500',
    badge: 'border-emerald-300/80 text-emerald-700',
    card: 'border-emerald-300/70 bg-emerald-50/40',
  },
  yellow: {
    dot: 'bg-amber-500',
    badge: 'border-amber-300/80 text-amber-700',
    card: 'border-amber-300/70 bg-amber-50/40',
  },
  red: {
    dot: 'bg-red-500',
    badge: 'border-red-300/80 text-red-700',
    card: 'border-red-300/70 bg-red-50/40',
  },
}

export function DetailedProductZonesHelpDialogContent() {
  return (
    <section className="rounded-md border border-border/70 p-3">
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <div className={cn('rounded-md border p-2.5', ZONE_STYLES.green.card)}>
          <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.green.badge)}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.green.dot)} />
            Зеленая зона: Стабильное состояние
          </Badge>
          <p className="mt-2">
            <span className="font-semibold text-foreground">Кратко:</span> Все показатели в
            норме.
          </p>
          <p className="mt-1">
            <span className="font-semibold text-foreground">Пояснение:</span> Доля негативных
            обращений не превышает целевые нормативы. Продукт работает стабильно, критических
            отклонений в клиентском опыте не выявлено.
          </p>
        </div>

        <div className={cn('rounded-md border p-2.5', ZONE_STYLES.yellow.card)}>
          <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.yellow.badge)}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.yellow.dot)} />
            Желтая зона: Требуется внимание
          </Badge>
          <p className="mt-2">
            <span className="font-semibold text-foreground">Кратко:</span> Целевые нормативы
            нарушены.
          </p>
          <p className="mt-1">
            <span className="font-semibold text-foreground">Пояснение:</span> Наблюдается рост
            негативных индикаторов. Показатели выше нормы, но еще не достигли критического уровня.
            Рекомендуется проанализировать причины отклонений, чтобы не допустить перехода в
            красную зону.
          </p>
        </div>

        <div className={cn('rounded-md border p-2.5', ZONE_STYLES.red.card)}>
          <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.red.badge)}>
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.red.dot)} />
            Красная зона: Критическое состояние
          </Badge>
          <p className="mt-2">
            <span className="font-semibold text-foreground">Кратко:</span> Критический уровень
            неудовлетворенности.
          </p>
          <p className="mt-1">
            <span className="font-semibold text-foreground">Пояснение:</span> Доля негативных
            индикаторов достигла предельных значений. Требуется приоритетное вмешательство и
            оперативное устранение проблем, так как текущее состояние продукта несет высокие риски
            оттока клиентов.
          </p>
        </div>
      </div>
    </section>
  )
}
