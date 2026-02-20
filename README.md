# Insight Service Dashboard

Internal Next.js dashboard with reusable UI + analytics feature module for product health monitoring.

## Runtime routes
1. `/` — executive screen with one bubble matrix (`Состояние продуктов`).
2. `/product-analytics` — detailed product analytics (line indicators + overlap map).

`/showcase/*` and legacy demo pages are removed from runtime.

## Quick start
```bash
pnpm install
pnpm dev
```

Validation:
```bash
pnpm lint
pnpm build
```

## Internal component library architecture
Main reusable module:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard`

Structure:
1. `domain/*` — pure calculations and aggregations (no React).
2. `hooks/*` — state orchestration and view-model assembly.
3. `ui/*` — presentation components.
4. `config/*` — constants, zones, tooltip copy.
5. `index.ts` — public entrypoint.

## Public API (`features/insight-dashboard/index.ts`)
Types:
1. `InsightEvent`, `InsightEventInput`
2. `InsightFilters`, `InsightDetailedFilters`, `InsightGranularity`
3. `ProductBubblePoint`, `HealthIndexBreakpoints`

Domain functions:
1. `buildHealthIndexMetrics(events, options)`
2. `buildBubbleMatrixPoints(events, options)`
3. `buildDetailedAnalyticsModel({ events, filters, granularity })`

Hooks:
1. `useProductSituationModel({ events, loading?, error?, defaultWindowDays?, sectorOptions?, productOptions? })`
2. `useProductDetailedModel({ events, loading?, error?, query?, channel?, sectorOptions?, productOptions? })`
3. `useInsightEvents()` — optional file adapter for local demo/runtime only

UI components:
1. `<ProductSituationToolbar />`
2. `<ProductSituationBubbleMatrix />`
3. `<ProductDetailedAnalyticsView />`

## Data integration contract
The library accepts raw events as `InsightEvent[]`.

Minimal required input fields (for external mapping):
1. `id`
2. `caseId`
3. `date`
4. `sector`
5. `productGroup`
6. `channel`
7. `dialogueType`
8. `metric`
9. `tag`

Default adapter in this repository:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/public/export.xlsx`.

Excel parsing/mapping layer:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard/domain/calls-xlsx.ts`.

Core hooks are API-agnostic and do not fetch by themselves.
They only consume ready data (`events/loading/error`) from any source:
SWR, TanStack Query, REST, GraphQL, server actions, etc.

Filter options are also source-agnostic:
1. By default they are derived from incoming events.
2. You can override them explicitly via `sectorOptions` / `productOptions`.

The old synthetic generator (`generateEventStream`) is not used by `/` and `/product-analytics`.

Fallback compatibility:
if `export.xlsx` is unavailable or empty, adapter falls back to:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/public/calls.csv`.

## Drilldown contract
Bubble click navigates with:
`/product-analytics?productGroup=<...>&sector=<...>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&source=bubble`

Detailed page initialization priority:
`query params > localStorage > defaults`

## Health model source of truth
Current formula and zone definitions are documented in:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/docs/health-index-model.md`

## Integration guide
Step-by-step external integration guide:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/docs/component-library-integration.md`
