'use client'

import { Badge } from '@/components/ui/badge'
import { BlockMath } from 'react-katex'
import { cn } from '@/lib/utils'

interface MainProductDissatisfactionHelpDialogContentProps {
  zoneThresholds?: {
    lower: number
    upper: number
  }
}

type ZoneKey = 'green' | 'yellow' | 'red'

const ZONE_STYLES: Record<ZoneKey, { dot: string; badge: string }> = {
  green: {
    dot: 'bg-emerald-500',
    badge: 'border-emerald-300/80 text-emerald-700',
  },
  yellow: {
    dot: 'bg-amber-500',
    badge: 'border-amber-300/80 text-amber-700',
  },
  red: {
    dot: 'bg-red-500',
    badge: 'border-red-300/80 text-red-700',
  },
}

const INDICATOR_ITEMS = [
  {
    label: 'Техническая проблема/сбои',
    green: '10%',
    red: '20%',
    dot: 'bg-blue-600',
    badge: 'border-blue-300/80 text-blue-700',
  },
  {
    label: 'Запрос не решен',
    green: '30%',
    red: '60%',
    dot: 'bg-orange-500',
    badge: 'border-orange-300/80 text-orange-700',
  },
  {
    label: 'Отрицательный продуктовый фидбэк',
    green: '5%',
    red: '10%',
    dot: 'bg-teal-700',
    badge: 'border-teal-300/80 text-teal-700',
  },
  {
    label: 'Угроза ухода/отказа',
    green: '2%',
    red: '5%',
    dot: 'bg-red-600',
    badge: 'border-red-300/80 text-red-700',
  },
] as const

function formatThreshold(value: number): string {
  const rounded = Math.round(value * 10) / 10
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return String(Math.round(rounded))
  }

  return rounded.toFixed(1)
}

export function MainProductDissatisfactionHelpDialogContent({ zoneThresholds }: MainProductDissatisfactionHelpDialogContentProps) {
  const lower = zoneThresholds ? formatThreshold(zoneThresholds.lower) : null
  const upper = zoneThresholds ? formatThreshold(zoneThresholds.upper) : null

  return (
    <section className="rounded-md border border-border/70 p-3">
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          Инструмент визуализирует метрику «Оценка неудовлетворенности продуктом», рассчитанную на
          основе обращений клиентов. Чем выше значение, тем критичнее состояние продукта и тем
          приоритетнее задача по устранению причин негативных индикаторов.
        </p>

        <h4 className="text-base font-semibold text-foreground">Методика расчета:</h4>
        <p>
          «Оценка неудовлетворенности продуктом» рассчитывается как сумма произведений: доля каждого
          индикатора × весовой коэффициент соответствующего индикатора.
        </p>
        <div className="rounded-md border border-border/70 bg-muted/40 p-2">
          <p className="mb-2 text-xs font-medium text-foreground">Формула метрики</p>
          <div className="space-y-1.5 overflow-x-auto rounded-md border border-border/60 bg-background/70 p-2">
            <BlockMath
              math={String.raw`\text{Оценка неудовлетворенности продуктом}=
(\text{Доля тех. проблем}\times\text{Вес})+
(\text{Доля «Запрос не решен»}\times\text{Вес})+
(\text{Доля негативного фидбэка}\times\text{Вес})+
(\text{Доля риска ухода}\times\text{Вес})`}
            />
            <BlockMath
              math={String.raw`\text{Доля индикатора}=
\frac{\text{Количество обращений с этим индикатором}}{\text{Все обращения по продукту}}\times100\%`}
            />
          </div>
        </div>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold text-foreground">Доля индикатора</span> — это % обращений
            по конкретной проблеме от общего количества обращений по продукту.
          </li>
          <li>
            <span className="font-semibold text-foreground">Весовой коэффициент</span> — множитель,
            определяющий степень влияния проблемы на итоговую оценку.
          </li>
        </ul>

        <p>
          <span className="font-semibold text-foreground">Размер пузыря</span> на карте
          пропорционален общему количеству обращений.
        </p>
        <div className="flex items-end gap-2 rounded-md bg-muted/40 px-2 py-1" aria-hidden>
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-emerald-700/70 bg-emerald-400/30" />
          <span className="inline-block h-4 w-4 rounded-full border-2 border-emerald-700/80 bg-emerald-400/30" />
          <span className="inline-block h-6 w-6 rounded-full border-2 border-emerald-700 bg-emerald-400/30" />
        </div>

        <h4 className="text-base font-semibold text-foreground">Уровни качества продукта</h4>

        <div className="space-y-3">
          <div className="rounded-md border border-emerald-300/70 bg-emerald-50/40 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.green.badge)}>
                <span
                  className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.green.dot)}
                />
                {lower ? `Зеленая ≤ ${lower}` : 'Зеленая зона'}
              </Badge>
            </div>
            <p className="mt-2">Доля каждого типа индикаторов в общем количестве обращений не должна превышать:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {INDICATOR_ITEMS.map((item) => (
                <Badge key={`green-${item.label}`} variant="outline" className={cn('w-fit gap-1.5', item.badge)}>
                  <span className={cn('inline-block h-2.5 w-2.5 rounded-full', item.dot)} />
                  «{item.label}» ≤ {item.green}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-amber-300/70 bg-amber-50/40 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.yellow.badge)}>
                <span
                  className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.yellow.dot)}
                />
                {lower && upper ? `Желтая ${lower}–${upper}` : 'Желтая зона'}
              </Badge>
            </div>
            <p className="mt-2">
              Диапазон значений между Зеленой и Красной зонами. Он фиксирует состояние, когда
              целевые нормативы уже нарушены, но показатели еще не достигли критических отметок
              Красной зоны.
            </p>
          </div>

          <div className="rounded-md border border-red-300/70 bg-red-50/40 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('gap-1', ZONE_STYLES.red.badge)}>
                <span className={cn('inline-block h-2.5 w-2.5 rounded-full', ZONE_STYLES.red.dot)} />
                {upper ? `Красная ≥ ${upper}` : 'Красная зона'}
              </Badge>
            </div>
            <p className="mt-2">
              Доля индикаторов в общем количестве обращений достигла или превысила критический
              уровень:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {INDICATOR_ITEMS.map((item) => (
                <Badge key={`red-${item.label}`} variant="outline" className={cn('w-fit gap-1.5', item.badge)}>
                  <span className={cn('inline-block h-2.5 w-2.5 rounded-full', item.dot)} />
                  «{item.label}» ≥ {item.red}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <p>
          Логика описания индикаторов доступна в Сервисе инсайтов:{' '}
          <a
            href="https://genai-insight-service.paas-dataplatform-prod.berekebank.kz/configurator"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-primary underline underline-offset-2"
          >
            <i>Сервисинсайтов → Сетка классификации → Tag RB</i>
          </a>
        </p>
      </div>
    </section>
  )
}
