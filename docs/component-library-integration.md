# Integration guide: insight-dashboard library

## 1) Что можно переиспользовать
Импорт:
`@/features/insight-dashboard`

Доступные слои:
1. Hooks-модели:
   - `useProductSituationModel`
   - `useProductDetailedModel`
2. Pure calculators:
   - `buildProductDissatisfactionScoreMetrics`
   - `buildBubbleMatrixPoints`
   - `buildDetailedAnalyticsModel`
3. UI-блоки:
   - `ProductSituationToolbar`
   - `ProductSituationBubbleMatrix`
   - `ProductDetailedAnalyticsView`

Хуки source-agnostic:
1. Принимают `events` и опционально `loading/error`.
2. Не привязаны к CSV/REST/GraphQL.
3. Могут строить filter options сами или принимать `sectorOptions`/`productOptions` извне.

Опциональный data-adapter внутри репозитория:
1. `useInsightEvents()` читает `/public/export.xlsx`.
2. `parseCallsWorkbook()` маппит XLSX в `InsightEvent[]`.
3. При ошибке автоматически использует fallback `/public/calls.csv`.

## 2) Контракт входных данных
Фича ожидает `InsightEvent[]`.

Минимальный контракт (`InsightEventInput`):
1. `id`
2. `caseId`
3. `date` (`YYYY-MM-DD`)
4. `sector`
5. `productGroup`
6. `channel`
7. `dialogueType` (`Консультация` | `Претензия`)
8. `metric` (`sla` | `aht` | `queueLoad` | `abandonment`)
9. `tag`

## 3) Пример интеграции главной страницы

```tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  ProductSituationBubbleMatrix,
  ProductSituationToolbar,
  useProductSituationModel,
  type ProductBubblePoint,
} from '@/features/insight-dashboard'
import { normalizeDateRange, toDateKey } from '@/features/insight-dashboard/logic/date-bucketing'

export function ExecutiveScreen({ events }: { events: any[] }) {
  const router = useRouter()
  const {
    filters,
    setFilters,
    granularity,
    setGranularity,
    resetFilters,
    sectorOptions,
    productOptions,
    bubblePoints,
    bubbleScoreThresholds,
  } = useProductSituationModel({
    events,
    loading: false,
    error: null,
  })

  const onPointClick = (point: ProductBubblePoint) => {
    const range = normalizeDateRange(filters.dateRange)
    const params = new URLSearchParams({
      productGroup: point.productGroup,
      sector: filters.sector,
      source: 'bubble',
      granularity,
    })

    const from = toDateKey(range.from)
    const to = toDateKey(range.to)
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    router.push(`/product-analytics?${params.toString()}`)
  }

  return (
    <>
      <ProductSituationToolbar
        filters={filters}
        granularity={granularity}
        sectorOptions={sectorOptions}
        onFiltersChange={setFilters}
        onGranularityChange={setGranularity}
        onReset={resetFilters}
      />
      <ProductSituationBubbleMatrix
        points={bubblePoints}
        scoreThresholds={bubbleScoreThresholds}
        productOrder={productOptions}
        onPointClick={onPointClick}
      />
    </>
  )
}
```

## 4) Пример интеграции детальной страницы

```tsx
import { ProductDetailedAnalyticsView } from '@/features/insight-dashboard'

export default function ProductAnalyticsPage() {
  return (
    <ProductDetailedAnalyticsView
      events={events}
      loading={isLoading}
      error={errorMessage}
    />
  )
}
```

## 5) Использование с внешним data-fetching

```tsx
// SWR
const { data, isLoading, error } = useSWR('/api/calls', fetcher)
const model = useProductSituationModel({
  events: data ?? [],
  loading: isLoading,
  error: error?.message ?? null,
})

// TanStack Query
const query = useQuery({ queryKey: ['calls'], queryFn: fetchCalls })
const detailed = useProductDetailedModel({
  events: query.data ?? [],
  loading: query.isPending,
  error: query.error instanceof Error ? query.error.message : null,
})
```

## 6) Контракт drilldown между страницами
Для перехода из bubble в детальную используйте query-параметры:
1. `productGroup`
2. `sector`
3. `from` (`YYYY-MM-DD`)
4. `to` (`YYYY-MM-DD`)
5. `granularity` (`week` | `month`)
6. `source` (необязательный marker, например `bubble`)

Инициализация детальной страницы:
1. query params
2. localStorage (`insight-service:dashboard:v1`)
3. defaults
