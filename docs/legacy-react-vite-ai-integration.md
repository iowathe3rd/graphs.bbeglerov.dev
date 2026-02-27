# Интеграция в Legacy React (Vite) для AI-агентов

Документ для ClaudeCode / OpenAI Codex.

## 0. Цель и ограничения
Цель: встроить текущий дашборд в legacy-проект на React + Vite **без переработки логики и UI**.

Жесткие ограничения:
1. Не менять формулы, расчеты, зоны, тексты, визуальное поведение карточек.
2. Не переписывать feature на другой дизайн-системе.
3. Допустимы только инфраструктурные адаптации под Vite/React Router.
4. Все изменения должны быть обратимы и локализованы в модуле `insight-dashboard`.

---

## 1. Что переносим 1:1
Из текущего репозитория переносится как есть:

1. `features/insight-dashboard/**`
2. `components/ui/{badge,button,calendar,card,carousel,date-range-picker,dialog,dropdown-menu,popover,select,sheet,toggle,toggle-group}.tsx`
3. `components/charts/bereke-chart-tooltip.tsx`
4. `components/theme-toggle.tsx` (если нужен переключатель темы)
5. `components/theme-provider.tsx` (если нужен `next-themes`)
6. `hooks/use-mobile.tsx`
7. `lib/utils.ts`
8. `app/globals.css` (переименовать в `src/styles/insight-globals.css`)
9. `public/export.xlsx`, `public/calls.csv`, `public/logo.png`

Не переносить как runtime-страницы:
1. `app/layout.tsx`
2. `app/page.tsx`
3. `app/product-analytics/page.tsx`

Их роль будет заменена route-компонентами в legacy shell.

---

## 2. Зависимости в legacy-проекте
Установить (добавить недостающие):

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-toggle @radix-ui/react-toggle-group class-variance-authority clsx date-fns embla-carousel-react lucide-react next-themes react-day-picker recharts tailwind-merge tailwindcss-animate xlsx
```

Если в legacy нет TS-пайплайна для `.ts/.tsx`, включить TypeScript поддержку в Vite (без миграции всего кода).

---

## 3. Vite конфигурация

### 3.1 Alias `@`
В `vite.config.*` добавить alias на `src`:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}
```

### 3.2 Tailwind
Нужен Tailwind, потому что весь UI-модуль на utility-классах.

Минимально:
1. Подключить Tailwind + PostCSS.
2. Добавить в `content` пути `src/features/**/*`, `src/components/**/*`, `src/hooks/**/*`, `src/lib/**/*`.
3. Перенести тему/переменные из `src/styles/insight-globals.css`.
4. Импортировать `src/styles/insight-globals.css` в корневую точку приложения (обычно `main.jsx/tsx`).

Примечание для MUI-проектов:
1. Если есть конфликт глобальных reset, сначала интегрировать “как есть”.
2. При конфликте изолировать модуль через отдельный layout/root контейнер, но без изменения бизнес-компонентов.

---

## 4. Обязательные адаптации Next.js -> Vite
Это единственная допустимая адаптация.

### 4.1 Навигация и ссылки
Заменить в shell-компонентах:
1. `next/link` -> `react-router-dom` `Link`
2. `next/navigation` `useRouter` -> `useNavigate`

### 4.2 Изображения
`next/image` -> обычный `<img />`.

### 4.3 Шрифты
`next/font/google` недоступен в Vite.
Сделать один из вариантов:
1. Подключить Roboto через `<link>` в `index.html`.
2. Или через npm-пакет шрифтов.

Важно: сохранить CSS-переменную `--font-roboto` или заменить `font-family` в `insight-globals.css` на прямой `Roboto, sans-serif`.

---

## 5. Роуты в legacy приложении
Создать два route-entry компонента (пример):
1. `src/modules/insight/pages/InsightHomePage.tsx`
2. `src/modules/insight/pages/InsightProductAnalyticsPage.tsx`

Логика этих страниц повторяет текущие:
1. Главная: `useInsightEvents` + `useProductSituationModel` + `ProductSituationToolbar` + `ProductSituationBubbleMatrix`.
2. Детальная: `useInsightEvents` + `ProductDetailedAnalyticsView`.

Рекомендуемые маршруты:
1. `/insight`
2. `/insight/product-analytics`

Если нужен полный паритет URL с текущим проектом:
1. `/`
2. `/product-analytics`

---

## 6. Контракт данных (не менять)
`InsightEvent` должен приходить в текущем формате:
1. `id`
2. `caseId`
3. `date` (`YYYY-MM-DD`)
4. `sector`
5. `productGroup`
6. `channel`
7. `dialogueType` (`Консультация` | `Претензия`)
8. `metric` (`sla`, `aht`, `queueLoad`, `abandonment`)
9. `tag`

Если подключается API вместо файлов:
1. Маппинг делать в adapter-слое.
2. Внутренние hooks/logic не менять.

---

## 7. Порядок работ для AI-агента
1. Создать feature-модуль `src/features/insight-dashboard` и скопировать файлы 1:1.
2. Перенести базовые UI-примитивы и shared utilities.
3. Настроить alias `@`, Tailwind и global CSS.
4. Добавить статические файлы в `public`.
5. Создать Vite-совместимые route-entry страницы (замены `next/*` на router/img).
6. Подключить маршруты в legacy router.
7. Проверить интерактивность фильтров, week/month, bubble click->drilldown.
8. Запустить линт/сборку legacy-проекта.

---

## 8. Smoke-check (критерии приемки)
1. `/insight` открывается без runtime-ошибок.
2. Температурная карта показывает пузыри и tooltips.
3. Переход по клику на пузырь ведет на детальную страницу с query-параметрами.
4. На детальной работают фильтры, week/month, комбинированные индикаторы и график консультаций.
5. Help-dialog открываются и отображают корректный контент.
6. Нет визуальных регрессий в карточках/типографике относительно текущего макета.

---

## 9. Типичные проблемы и быстрые фиксы
1. `Module not found: @/...`
   - проверить alias `@` и физический путь `src`.
2. “Стили не применяются”
   - проверить импорт `insight-globals.css` и tailwind `content` paths.
3. Ошибки `next/image`, `next/link`, `next/navigation`
   - убедиться, что эти импорты остались только в старых Next-страницах и не используются в legacy runtime.
4. Пустой график
   - проверить наличие `public/export.xlsx` или `public/calls.csv`.
5. Неправильные даты/подписи недель
   - проверить локаль и week-mode в `date-range-picker`/`date-bucketing`.

---

## 10. Шаблон задачи для AI-агента
Скопируйте этот блок в ClaudeCode/Codex:

```text
Интегрируй модуль insight-dashboard в текущий legacy React+Vite проект без изменения бизнес-логики и UI.

Ограничения:
1) Не менять формулы/зоны/тексты/визуальное поведение.
2) Допустима только инфраструктурная адаптация Next->Vite (Link/router/image/font).
3) Скопировать модуль и зависимости 1:1 по runbook docs/legacy-react-vite-ai-integration.md.

Сделай:
1) Перенос файлов и зависимостей.
2) Настройку alias @ и tailwind.
3) Создание route-entry компонентов для /insight и /insight/product-analytics.
4) Подключение роутов в существующий router.
5) Smoke-check и отчет по результатам.

Отчет в конце:
- какие файлы добавлены/изменены,
- какие Next-адаптации сделаны,
- что проверено вручную,
- что осталось как риск.
```
