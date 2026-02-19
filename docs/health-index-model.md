# Модель индекса здоровья продукта

## Цель
Модель должна корректно различать ситуации:
1. `20%` проблемных от `1 000` обращений.
2. `20%` проблемных от `10 000` обращений.

Процент одинаковый, но бизнес-эффект разный, поэтому в модели есть поправки на объем и статистическую уверенность.

## Базовые сущности
1. `totalCalls` — число уникальных обращений (`caseId`) за период.
2. `problemCallsUnique` — число уникальных обращений, где есть хотя бы один из 4 негативных тегов.
3. `tagCount_i` — число уникальных обращений с тегом `i`.

## Веса тегов
| Тег | Вес |
|---|---:|
| Технические проблемы/сбои | 0.20 |
| Запрос не решен | 0.30 |
| Отрицательный продуктовый фидбэк | 0.20 |
| Угроза ухода/отказа от продуктов банка | 0.30 |

Сумма весов: `1.0`.

## Формулы

### 1) Доли
`tagRate_i = (tagCount_i / totalCalls) * 100`

`problemRate = (problemCallsUnique / totalCalls) * 100`

### 2) Взвешенная тяжесть
`severityRate = Σ(tagRate_i * tagWeight_i)`

### 3) Консультационная поправка
`consultationCleanRate = consultations_without_negative / consultation_calls * 100`

### 4) Базовый риск
`riskCore = 0.65 * severityRate + 0.35 * problemRate + 0.15 * (100 - consultationCleanRate)`

### 5) Поправка на объем
`baselineCalls = median(totalCalls_t)` по текущему окну (игнорируя нули)

`volumeWeight = clamp(sqrt(totalCalls / baselineCalls), 0.6, 1.8)`

### 6) Поправка на уверенность
`confidence = clamp(sqrt(totalCalls) / sqrt(400), 0.35, 1.0)`

### 7) Итоговые индексы
`riskIndex = clamp(riskCore * volumeWeight * confidence, 0, 100)`

`healthIndex = 100 - riskIndex`

## Зоны
### Зоны здоровья по `healthIndex`
1. `>= 85` — Норма
2. `70..84` — Внимание
3. `< 70` — Критично

### Зоны bubble-matrix по доле проблемных обращений (`problemRate`)
1. Зеленая: `0–5%`
2. Желтая: `5–30%`
3. Красная: `30–100%`

Это визуальные границы по оси X главной страницы `/`. Они не заменяют расчет `healthIndex`.

## Где в коде (source of truth)
1. `/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard/domain/health-index.ts`
2. `/Users/bbeglerov/Developer/Playground/graphs.bbeglerov.dev/features/insight-dashboard/config/constants.ts`
