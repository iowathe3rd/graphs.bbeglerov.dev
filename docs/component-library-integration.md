# Integration guide: insight-dashboard internal library

## 1) What you reuse
Import from:
`@/features/insight-dashboard`

Available layers:
1. Headless hooks (`useProductSituationModel`, `useProductDetailedModel`)
2. Pure calculators (`buildHealthIndexMetrics`, `buildBubbleMatrixPoints`, `buildDetailedAnalyticsModel`)
3. UI blocks (`ProductSituationToolbar`, `ProductSituationBubbleMatrix`, `ProductDetailedAnalyticsView`)

Core hooks are source-agnostic:
1. They expect `events` and optional `loading/error`.
2. They do not fetch from CSV/REST/GraphQL by themselves.
3. They can derive filter options from events or receive explicit options (`sectorOptions`, `productOptions`).

Optional source adapter in this repo:
1. `useInsightEvents()` loads `/public/export.xlsx`.
2. `parseCallsWorkbook()` maps XLSX rows to `InsightEvent[]`.
3. If `export.xlsx` is unavailable, adapter falls back to `/public/calls.csv`.

## 2) External data mapping
Library expects `InsightEvent[]`.

Minimum mapping contract (`InsightEventInput`):
1. `id`
2. `caseId`
3. `date` (`YYYY-MM-DD`)
4. `sector`
5. `productGroup`
6. `channel`
7. `dialogueType` (`Консультация` | `Претензия`)
8. `metric`
9. `tag`

## 3) Executive page integration example
```tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  ProductSituationBubbleMatrix,
  ProductSituationToolbar,
  useProductSituationModel,
  type ProductBubblePoint,
} from '@/features/insight-dashboard'
import { normalizeDateRange, toDateKey } from '@/features/insight-dashboard/domain/date-bucketing'

export function ExecutiveScreen({ events }: { events: any[] }) {
  const router = useRouter()
  const { filters, setFilters, resetFilters, sectorOptions, productOptions, bubblePoints } = useProductSituationModel({
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
        variant="home"
        filters={filters}
        sectorOptions={sectorOptions}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
      <ProductSituationBubbleMatrix
        points={bubblePoints}
        productOrder={productOptions}
        onPointClick={onPointClick}
      />
    </>
  )
}
```

## 4) Detailed page integration example
```tsx
import { ProductDetailedAnalyticsView } from '@/features/insight-dashboard'

export default function ProductAnalyticsPage() {
  return <ProductDetailedAnalyticsView events={events} loading={isLoading} error={errorMessage} />
}
```

## 5) Data source examples (SWR / TanStack / GraphQL)
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

## 6) Query contract for drilldown
Use these query params when opening detailed analytics:
1. `productGroup`
2. `sector`
3. `from` (`YYYY-MM-DD`)
4. `to` (`YYYY-MM-DD`)
5. `source` (optional marker, e.g. `bubble`)

Detailed screen applies state with priority:
1. query params
2. localStorage (`insight-service:dashboard:v1`)
3. defaults

## 7) UI copy policy
For end users keep business wording:
1. `Индекс здоровья`
2. `Проблемные обращения`
3. `Все обращения`

Do not show debug terms (`weighted`, `volume weight`, `risk core`) in UI labels.
