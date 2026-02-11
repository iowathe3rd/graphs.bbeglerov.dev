'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricsFiltersComponent, type MetricsFilters } from '@/components/metrics-filters'
import { MetricsLineChart } from '@/components/metrics-line-chart'
import { MetricsCombinedChart } from '@/components/metrics-combined-chart'
import { MetricsStackedChart } from '@/components/metrics-stacked-chart'
import { MetricsDataTable } from '@/components/metrics-data-table'
import { 
  generateAllMetricsData, 
  generateDetailedRecords, 
  METRICS 
} from '@/lib/metrics-data'
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react'

export default function DashboardPage() {
  const [filters, setFilters] = useState<MetricsFilters>({
    dateRange: { from: undefined, to: undefined },
    metrics: [],
    channels: [],
    tags: [],
  })

  // Генерируем данные
  const metricsData = useMemo(() => generateAllMetricsData(30), [])
  const detailedRecords = useMemo(() => generateDetailedRecords(50), [])

  // Получаем массив метрик
  const metricsArray = Object.values(METRICS)

  // Вычисляем сводную статистику
  const summaryStats = useMemo(() => {
    const latestData = Object.entries(metricsData).map(([key, data]) => ({
      metric: METRICS[key],
      value: data[data.length - 1]?.value || 0,
      previous: data[data.length - 2]?.value || 0,
    }))

    const totalIssues = latestData.reduce((sum, { value }) => sum + value, 0)
    const criticalCount = latestData.filter(
      ({ metric, value }) => value > metric.thresholds.medium
    ).length
    const resolvedCount = detailedRecords.filter(r => r.status === 'resolved').length
    const avgValue = totalIssues / latestData.length

    return {
      totalIssues: totalIssues.toFixed(1),
      criticalCount,
      resolvedCount,
      avgValue: avgValue.toFixed(1),
    }
  }, [metricsData, detailedRecords])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Аналитическая Панель Банка
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            Интерактивные визуализации метрик и индикаторов работы банка
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Суммарный показатель</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.totalIssues}%</div>
              <p className="text-xs text-muted-foreground">
                Среднее: {summaryStats.avgValue}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Критические метрики</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.criticalCount}</div>
              <p className="text-xs text-muted-foreground">
                из {metricsArray.length} индикаторов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Решенные обращения</CardTitle>
              <CheckCircle className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.resolvedCount}</div>
              <p className="text-xs text-muted-foreground">
                из {detailedRecords.length} всего
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Динамика</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">30 дней</div>
              <p className="text-xs text-muted-foreground">
                период анализа
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MetricsFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Visualizations */}
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="individual">Отдельные графики</TabsTrigger>
            <TabsTrigger value="combined">Комбинированный</TabsTrigger>
            <TabsTrigger value="stacked">Накопительный</TabsTrigger>
            <TabsTrigger value="table">Таблица данных</TabsTrigger>
            <TabsTrigger value="concept">Концепция</TabsTrigger>
          </TabsList>

          {/* Individual Charts */}
          <TabsContent value="individual" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {metricsArray.map((metric) => (
                <MetricsLineChart
                  key={metric.id}
                  data={metricsData[metric.id]}
                  metric={metric}
                />
              ))}
            </div>
          </TabsContent>

          {/* Combined Chart */}
          <TabsContent value="combined" className="space-y-6">
            <MetricsCombinedChart
              data={metricsData}
              metrics={metricsArray}
              showThresholds
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <MetricsCombinedChart
                data={metricsData}
                metrics={[METRICS.unresolvedRequests, METRICS.refusalThreat, METRICS.productMisunderstanding]}
                title="Анализ клиентского опыта"
                description="Сравнение метрик, связанных с качеством обслуживания"
              />
              <MetricsCombinedChart
                data={metricsData}
                metrics={[METRICS.techErrors, METRICS.unresolvedRequests]}
                title="Технические проблемы"
                description="Корреляция технических ошибок и нерешенных запросов"
              />
            </div>
          </TabsContent>

          {/* Stacked Chart */}
          <TabsContent value="stacked" className="space-y-6">
            <MetricsStackedChart
              data={metricsData}
              metrics={metricsArray}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Обоснование использования накопительной визуализации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Накопительная (stacked) визуализация эффективна для понимания общего объёма проблем 
                  и относительного вклада каждой метрики в общую картину.
                </p>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Показывает пропорции между различными индикаторами</li>
                  <li>Позволяет увидеть общий тренд всех метрик одновременно</li>
                  <li>Эффективна для идентификации доминирующих проблем</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Table */}
          <TabsContent value="table" className="space-y-6">
            <MetricsDataTable data={detailedRecords} />
          </TabsContent>

          {/* Concept Documentation */}
          <TabsContent value="concept" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Концепция интерактивных визуализаций для банковских метрик</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 leading-relaxed">
                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">1. Типы визуализаций и их обоснование</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <h4 className="mb-2 font-semibold text-foreground">Отдельные линейные графики</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Назначение:</strong> Детальный анализ каждого индикатора в отдельности
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Преимущества:</strong> Четкое отображение трендов, минимальная когнитивная нагрузка, 
                        легкость интерпретации. Идеально для мониторинга отдельных KPI.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Использование:</strong> Ежедневный мониторинг, быстрая оценка состояния каждого индикатора
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <h4 className="mb-2 font-semibold text-foreground">Комбинированные графики</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Назначение:</strong> Сравнительный анализ нескольких метрик одновременно
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Преимущества:</strong> Выявление корреляций, сравнение динамики, обнаружение аномалий. 
                        Позволяет увидеть взаимосвязи между различными показателями.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Использование:</strong> Стратегический анализ, поиск причинно-следственных связей
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <h4 className="mb-2 font-semibold text-foreground">Накопительные (Stacked) графики</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Назначение:</strong> Визуализация общего объёма проблем и вклада каждой метрики
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Преимущества:</strong> Показывает пропорциональное распределение, общий тренд, 
                        композицию проблем. Эффективно для презентаций руководству.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Использование:</strong> Отчеты для руководства, презентации, стратегическое планирование
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <h4 className="mb-2 font-semibold text-foreground">Интерактивные таблицы данных</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Назначение:</strong> Детализированный анализ на уровне отдельных обращений
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Преимущества:</strong> Максимальная детализация, возможность сортировки и фильтрации, 
                        доступ к метаданным (теги, каналы, статусы).
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Использование:</strong> Операционный анализ, расследование инцидентов, аудит
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">2. Интерактивные возможности</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Фильтрация по датам:</strong> Выбор произвольного временного диапазона для анализа</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Фильтрация по каналам:</strong> Анализ проблем в разрезе каналов обращения (онлайн-банк, мобильное приложение, колл-центр)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Фильтрация по тегам:</strong> Категоризация по типам продуктов/услуг</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Сортировка в таблицах:</strong> Быстрая организация данных по любому полю</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Всплывающие подсказки:</strong> Детальная информация при наведении на точки графика</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span><strong>Экспорт данных:</strong> Возможность выгрузки для дальнейшего анализа</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">3. Структура интерфейса</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Уровень 1 - Обзорная панель:</strong> Карточки с ключевыми показателями (KPI) для быстрой оценки текущего состояния
                    </p>
                    <p>
                      <strong>Уровень 2 - Панель фильтров:</strong> Централизованная система фильтрации, влияющая на все визуализации
                    </p>
                    <p>
                      <strong>Уровень 3 - Вкладки визуализаций:</strong> Организация различных типов графиков по вкладкам для удобной навигации
                    </p>
                    <p>
                      <strong>Уровень 4 - Детальные данные:</strong> Таблицы с возможностью drill-down в конкретные записи
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">4. Цветовая схема и доступность</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Используется профессиональная тёмная тема с высоким контрастом для снижения усталости глаз 
                      при длительной работе с данными. Цвета метрик различимы и семантически значимы:
                    </p>
                    <ul className="space-y-1 pl-4">
                      <li>• Синий (primary) - нейтральные метрики</li>
                      <li>• Бирюзовый - позитивные показатели</li>
                      <li>• Жёлтый - предупреждения</li>
                      <li>• Фиолетовый - специфические индикаторы</li>
                      <li>• Красный - критические проблемы</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">5. Рекомендации по использованию</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Для операционных менеджеров:</strong> Используйте отдельные графики и таблицы для ежедневного мониторинга 
                      и быстрого реагирования на проблемы
                    </p>
                    <p>
                      <strong>Для аналитиков:</strong> Комбинированные графики помогут выявить взаимосвязи и паттерны, 
                      таблицы - для детального анализа
                    </p>
                    <p>
                      <strong>Для руководства:</strong> Накопительные визуализации и обзорные карточки дают быстрое понимание 
                      общей ситуации и трендов
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">6. Технологический стек</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Next.js 16</strong> - современный React-фреймворк с серверными компонентами</p>
                    <p>• <strong>Recharts</strong> - библиотека для создания интерактивных графиков</p>
                    <p>• <strong>shadcn/ui</strong> - компоненты с высокой доступностью</p>
                    <p>• <strong>Tailwind CSS</strong> - утилитарный CSS-фреймворк для быстрой стилизации</p>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-16 border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Аналитическая панель банка • Разработано с использованием современных технологий визуализации данных
        </div>
      </footer>
    </div>
  )
}
