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
1. `useProductSituationModel({ events?, defaultWindowDays? })`
2. `useProductDetailedModel({ events?, query? })`

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

Current runtime source:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/public/calls.csv`.

Parsing/mapping layer:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard/domain/calls-csv.ts`.

The old synthetic generator (`generateEventStream`) is not used by `/` and `/product-analytics`.

Current sample note:
`calls.csv` is an anonymized real extract where every call row already has at least one negative tag.
Because of this, `problemRate` is close to `100%` across products on `/`.
Bubble differentiation is currently mostly by bubble size (`problemCallsUnique`) and health index mix.

## Drilldown contract
Bubble click navigates with:
`/product-analytics?productGroup=<...>&sector=<...>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&source=bubble`

Detailed page initialization priority:
`query params > localStorage > defaults`

## Health model source of truth
Formulas, weights, and zone definitions are documented in:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/docs/health-index-model.md`

## Integration guide
Step-by-step external integration guide:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/docs/component-library-integration.md`
