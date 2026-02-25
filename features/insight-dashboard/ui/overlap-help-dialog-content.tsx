'use client'

import { Badge } from '@/components/ui/badge'

export function OverlapHelpDialogContent() {
  return (
    <section className="rounded-md border border-border/70 p-3">
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          График пересечений показывает, как часто по одному продукту одновременно растут несколько
          проблемных индикаторов. Чем выше линия, тем выше доля пересечений и тем больше нагрузка
          на клиентский опыт.
        </p>

        <div className="rounded-md border border-border/70 bg-muted/30 p-2.5">
          <p className="font-medium text-foreground">Как интерпретировать зоны</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1 border-emerald-300/80 text-emerald-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Зеленая
            </Badge>
            <Badge variant="outline" className="gap-1 border-amber-300/80 text-amber-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
              Желтая
            </Badge>
            <Badge variant="outline" className="gap-1 border-red-300/80 text-red-700">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Красная
            </Badge>
          </div>
          <p className="mt-2">Зеленая зона: пересечения на низком уровне, ситуация стабильна.</p>
          <p>Желтая зона: есть рост пересечений, нужна дополнительная проверка причин.</p>
          <p>Красная зона: высокий уровень пересечений, требуется приоритетное вмешательство.</p>
        </div>
      </div>
    </section>
  )
}
