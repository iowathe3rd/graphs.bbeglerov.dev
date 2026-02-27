# Insight Service Dashboard

Next.js дашборд для мониторинга продуктового состояния на базе обращений клиентов.
Основная метрика визуализации: **«Оценка неудовлетворенности продуктом»**.

## Маршруты
1. `/` — главная страница с температурной картой продуктов.
2. `/product-analytics` — детальная аналитика по выбранному продукту.

## Технологии
1. Next.js 16 (`app` router, client components для интерактивных экранов).
2. React + TypeScript.
3. Tailwind CSS + shadcn/ui.
4. Recharts (bubble/line/bar визуализации).

## Архитектура (2 слоя)
Фича расположена в:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard`

```text
features/insight-dashboard
├── logic/        # вычисления, агрегации, типы, хуки состояния
├── components/   # UI-слой фичи (карточки, тулбары, диалоги, виджеты)
├── config/       # константы, тексты tooltip/dialog, справочники
└── index.ts      # публичный API фичи
```

### Logic layer
1. `logic/product-dissatisfaction-score.ts` — расчет метрики, зон, bubble-моделей (главная + timeline на детальной).
2. `logic/detailed-analytics.ts` — агрегаты для детальной страницы (индикаторы, покрытие консультаций, сериализация фильтров).
3. `logic/date-bucketing.ts` — нормализация диапазонов, ISO-недели, форматирование бакетов.
4. `logic/bubble-matrix.ts` — фильтрация событий для температурной карты.
5. `logic/filter-options.ts` — построение и валидация опций фильтров.
6. `logic/hooks/*` — orchestration hooks (`useInsightEvents`, `useProductSituationModel`, `useProductDetailedModel`).
7. `logic/types.ts` + `logic/metrics-catalog.ts` — доменные контракты и каталог индикаторов.

### Components layer
1. `components/product-situation-bubble-matrix.tsx` — основной bubble-график (main/focused режимы).
2. `components/product-detailed-analytics-page.tsx` — компоновка детальной страницы.
3. `components/indicator-combined-card.tsx` — комбинированная карточка индикатора (`%`/`шт`).
4. `components/call-coverage-chart-card.tsx` — график консультационных обращений.
5. `components/filters/*` — desktop/mobile фильтры детальной страницы.
6. `components/*help-dialog-content.tsx` + `insight-help-dialog-button.tsx` — help-dialog контент и триггеры.
7. `components/product-situation-bubble-matrix/*` — подкомпоненты bubble chart (layout/legend/tooltip).

## Источник данных
По умолчанию используется клиентский адаптер:
1. `public/export.xlsx` (первичный источник).
2. `public/calls.csv` (fallback, если `export.xlsx` недоступен).

Парсинг:
1. `logic/calls-xlsx.ts`
2. `logic/calls-csv.ts`

Хуки модели не привязаны к конкретному transport: можно передавать `events/loading/error` из любого источника (REST, GraphQL, Query, SWR).

## Быстрый старт
```bash
pnpm install
pnpm dev
```

Проверки:
```bash
pnpm lint
pnpm build
```

## Публичный API
Экспортируется через:
`/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard/index.ts`

Основные группы:
1. Типы (`InsightEvent`, `InsightFilters`, `ProductBubblePoint`, `ProductSituationScoreThresholds`, ...).
2. Logic-функции (`buildProductDissatisfactionScoreMetrics`, `buildBubbleMatrixPoints`, `buildDetailedAnalyticsModel`, ...).
3. Hooks (`useInsightEvents`, `useProductSituationModel`, `useProductDetailedModel`).
4. Компоненты (`ProductSituationToolbar`, `ProductSituationBubbleMatrix`, `ProductDetailedAnalyticsView`, ...).
5. Конфиги (`PRODUCT_DISSATISFACTION_SCORE_BREAKPOINTS`, `INSIGHT_HELP_DIALOG_COPY`, ...).

## Документация
1. Архитектура и потоки: `docs/project-architecture.md`.
2. Каталог компонентов/папок: `docs/components-and-folders.md`.
3. Интеграционный гайд: `docs/component-library-integration.md`.
4. Модель расчета метрики: `docs/health-index-model.md`.
5. Интеграция в legacy React (AI runbook): `docs/legacy-react-vite-ai-integration.md`.
