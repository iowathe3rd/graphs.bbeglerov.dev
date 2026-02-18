'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductSituationExecutiveSummary } from '@/lib/product-situation-analytics'

interface ProductSituationExecutiveSummaryProps {
  summary: ProductSituationExecutiveSummary
}

function formatSigned(value: number) {
  if (value > 0) {
    return `+${value.toFixed(1)}`
  }

  return value.toFixed(1)
}

function deltaText(value: number | null, suffix: string) {
  if (value === null) {
    return 'Недостаточно данных для сравнения'
  }

  if (value > 0) {
    return `↑ ${formatSigned(value)} ${suffix}`
  }

  if (value < 0) {
    return `↓ ${Math.abs(value).toFixed(1)} ${suffix}`
  }

  return 'Без изменений к прошлому периоду'
}

function deltaTone(value: number | null, higherIsBetter = false) {
  if (value === null || value === 0) {
    return 'text-muted-foreground'
  }

  const positive = value > 0
  if (higherIsBetter) {
    return positive ? 'text-emerald-600' : 'text-red-600'
  }

  return positive ? 'text-red-600' : 'text-emerald-600'
}

export function ProductSituationExecutiveSummary({
  summary,
}: ProductSituationExecutiveSummaryProps) {
  if (!summary.current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ключевые факты</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных</CardContent>
      </Card>
    )
  }

  const healthDelta = summary.delta?.healthIndex ?? null
  const problemCallsDelta = summary.delta?.problematicCalls ?? null
  const totalCallsDelta = summary.delta?.totalCalls ?? null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ключевые факты</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Индекс здоровья сейчас</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {summary.current.healthIndex.toFixed(1)}
            </p>
            <p className={`mt-1 text-xs ${deltaTone(healthDelta, true)}`}>
              {deltaText(healthDelta, 'пункта')}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Проблемные обращения</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {summary.current.problematicCalls.toLocaleString('ru-RU')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.current.problematicRate.toFixed(1)}% от всех обращений
            </p>
            <p className={`mt-1 text-xs ${deltaTone(problemCallsDelta, false)}`}>
              {problemCallsDelta === null
                ? 'Недостаточно данных для сравнения'
                : `${problemCallsDelta > 0 ? '↑' : problemCallsDelta < 0 ? '↓' : '≈'} ${Math.abs(problemCallsDelta).toLocaleString('ru-RU')} к прошлому периоду`}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">Все обращения</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {summary.current.totalCalls.toLocaleString('ru-RU')}
            </p>
            <p className={`mt-1 text-xs ${deltaTone(totalCallsDelta, false)}`}>
              {totalCallsDelta === null
                ? 'Недостаточно данных для сравнения'
                : `${totalCallsDelta > 0 ? '↑' : totalCallsDelta < 0 ? '↓' : '≈'} ${Math.abs(totalCallsDelta).toLocaleString('ru-RU')} к прошлому периоду`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
