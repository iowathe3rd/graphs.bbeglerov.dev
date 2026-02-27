# Каталог папок и компонентов

Документ описывает, что находится в каждой ключевой папке и за что отвечает каждый основной компонент.

## 1. Корневые папки

1. `app/` — страницы Next.js (`/` и `/product-analytics`) и глобальные стили.
2. `features/insight-dashboard/` — вся предметная область дашборда (logic + components + config).
3. `components/` — общие UI-примитивы и cross-feature компоненты (`theme-toggle`, `ui/*`).
4. `hooks/` — общие project-level хуки (`use-mobile`).
5. `lib/` — общие utility (`utils.ts` и вспомогательные хелперы вне feature-домена).
6. `docs/` — документация проекта и интеграции.
7. `public/` — статические ресурсы и source-файлы (`export.xlsx`, `calls.csv`, изображения).

---

## 2. Feature: `features/insight-dashboard`

```text
features/insight-dashboard
├── logic/
│   ├── hooks/
│   └── *.ts
├── components/
│   ├── filters/
│   ├── product-situation-bubble-matrix/
│   └── *.tsx
├── config/
└── index.ts
```

### 2.1 `logic/`

1. `types.ts`
   - каноничные доменные типы: `InsightEvent`, фильтры, bubble points, line/coverage buckets.
2. `metrics-catalog.ts`
   - каталог 4 индикаторов (`sla`, `aht`, `queueLoad`, `abandonment`), цвета и метаданные.
3. `date-bucketing.ts`
   - работа с датами: week/month normalization, labels, bucket helpers.
4. `product-dissatisfaction-score.ts`
   - основная формула метрики, зоны, bubble-модели.
5. `detailed-analytics.ts`
   - агрегирование данных детальной страницы (combined indicators + consultation coverage).
6. `bubble-matrix.ts`
   - подготовка и фильтрация данных под bubble-график.
7. `filter-options.ts`
   - построение/валидация списков фильтров (sector/product).
8. `calls-xlsx.ts`
   - парсинг XLSX в `InsightEvent[]`.
9. `calls-csv.ts`
   - fallback-парсинг CSV в `InsightEvent[]`.
10. `hooks/use-insight-events.ts`
    - data adapter: загрузка `export.xlsx` c fallback на `calls.csv`.
11. `hooks/use-product-situation-model.ts`
    - view-model главной страницы.
12. `hooks/use-product-detailed-model.ts`
    - view-model детальной страницы.

### 2.2 `components/`

#### Карточки/виджеты аналитики
1. `product-situation-bubble-matrix.tsx`
   - bubble-график для главной и детальной;
   - поддержка x-режимов `products`/`periods`;
   - адаптивный размер пузырей и встроенный tooltip.
2. `product-detailed-analytics-page.tsx`
   - компоновка desktop/mobile детальной страницы;
   - связывает фильтры, карточки индикаторов, bubble и coverage.
3. `indicator-combined-card.tsx`
   - комбинированный график индикатора (`шт + %`) с переключением режима отображения.
4. `call-coverage-chart-card.tsx`
   - график консультационных обращений относительно всех обращений.
5. `stacked-portion-bar-chart.tsx`
   - универсальный stacked bar с overlay значением доли.
6. `mobile-combined-indicator-carousel.tsx`
   - мобильная версия списка индикаторов.

#### Фильтры
1. `filters/dashboard-toolbar.tsx`
   - desktop фильтры (поток, продукт, период, гранулярность, reset).
2. `filters/dashboard-mobile-filter-summary.tsx`
   - компактный summary чип с количеством активных фильтров.
3. `filters/dashboard-mobile-filter-sheet.tsx`
   - мобильный full-screen фильтр.

#### Help-dialog система
1. `insight-help-dialog-button.tsx`
   - общий триггер и router контента help-dialog по `variant`.
2. `main-product-dissatisfaction-help-dialog-content.tsx`
   - контент главной температурной карты.
3. `detailed-product-zones-help-dialog-content.tsx`
   - контент зон для детальной bubble-карты.
4. `consultation-coverage-help-dialog-content.tsx`
   - контент help по графику консультаций.
5. `line-indicator-help-dialog-content.tsx`
   - контент help для индикаторных графиков.

#### Bubble subcomponents (`components/product-situation-bubble-matrix/`)
1. `chart-layout.tsx` — обертка layout графика.
2. `zone-legend.tsx` — легенда зон.
3. `tooltip-content.tsx` — контент tooltip пузыря.
4. `axis-title.tsx` — кастомная подпись оси Y.
5. `helpers.ts` — форматтеры, map зон, вычислительные helper-функции.

#### UI tokens
1. `chart-card-tokens.ts`
   - единые классы typographic/spacing токенов для карточек графиков.

### 2.3 `config/`

1. `constants.ts`
   - thresholds, веса, дефолтные фильтры, map тегов и цветов.
2. `tooltips.ts`
   - фабрики конфигов help-dialog.
3. `indicator-tooltip-copy.ts`
   - тексты для индикаторных help-dialog.

### 2.4 `index.ts`

Публичный API модуля:
1. экспорты доменных типов;
2. экспорты logic-функций;
3. экспорты hooks;
4. экспорты feature-компонентов;
5. экспорты config констант.

---

## 3. Общие UI-примитивы (`components/ui`)

Оставлены только реально используемые примитивы:
1. `badge.tsx`
2. `button.tsx`
3. `calendar.tsx`
4. `card.tsx`
5. `carousel.tsx`
6. `date-range-picker.tsx`
7. `dialog.tsx`
8. `dropdown-menu.tsx`
9. `popover.tsx`
10. `select.tsx`
11. `sheet.tsx`
12. `toggle.tsx`
13. `toggle-group.tsx`

---

## 4. Где менять что (быстрый навигатор)

1. Изменение формулы/весов/зон: `logic/product-dissatisfaction-score.ts` + `config/constants.ts`.
2. Изменение текстов и структуры help-dialog: `components/*help-dialog-content.tsx` + `config/tooltips.ts`.
3. Изменение поведения периода/неделя-месяц: `logic/date-bucketing.ts`, `logic/detailed-analytics.ts`, `components/ui/date-range-picker.tsx`.
4. Изменение layout детальной страницы: `components/product-detailed-analytics-page.tsx`.
5. Изменение источника данных: `logic/hooks/use-insight-events.ts`, `logic/calls-xlsx.ts`, `logic/calls-csv.ts`.
