// Данные метрик банка
export interface MetricDataPoint {
  date: string
  value: number
  dayOfWeek?: number
  tags?: string[]
}

export interface MetricInfo {
  id: string
  name: string
  description: string
  unit: string
  thresholds: {
    low: number
    medium: number
    high: number
  }
  color: string
}

export const METRICS: Record<string, MetricInfo> = {
  techErrors: {
    id: 'techErrors',
    name: 'Технические ошибки',
    description: 'Количество технических ошибок в системе',
    unit: '%',
    thresholds: { low: 5, medium: 10, high: 15 },
    color: 'hsl(var(--chart-1))',
  },
  unresolvedRequests: {
    id: 'unresolvedRequests',
    name: 'Запрос не решен',
    description: 'Процент нерешенных запросов клиентов',
    unit: '%',
    thresholds: { low: 10, medium: 30, high: 50 },
    color: 'hsl(var(--chart-2))',
  },
  refusalThreat: {
    id: 'refusalThreat',
    name: 'Угроза отказа',
    description: 'Риск отказа клиента от услуг',
    unit: '%',
    thresholds: { low: 10, medium: 20, high: 30 },
    color: 'hsl(var(--chart-3))',
  },
  productMisunderstanding: {
    id: 'productMisunderstanding',
    name: 'Не понятен продукт',
    description: 'Процент клиентов, не понимающих продукт',
    unit: '%',
    thresholds: { low: 15, medium: 25, high: 35 },
    color: 'hsl(var(--chart-4))',
  },
}

// Генерация тестовых данных
export function generateMetricData(
  metricId: string,
  days: number = 30
): MetricDataPoint[] {
  const data: MetricDataPoint[] = []
  const metric = METRICS[metricId]
  const baseValue = (metric.thresholds.low + metric.thresholds.medium) / 2

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    // Добавляем случайные вариации
    const variance = (Math.random() - 0.5) * 10
    const trend = Math.sin(i / 5) * 5
    const value = Math.max(0, baseValue + variance + trend)

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 10) / 10,
      dayOfWeek: date.getDay(),
      tags: generateRandomTags(),
    })
  }

  return data
}

function generateRandomTags(): string[] {
  const allTags = [
    'онлайн-банк',
    'мобильное приложение',
    'колл-центр',
    'отделение',
    'кредиты',
    'вклады',
    'переводы',
    'карты',
  ]
  const numTags = Math.floor(Math.random() * 3)
  return Array.from(
    { length: numTags },
    () => allTags[Math.floor(Math.random() * allTags.length)]
  )
}

// Генерация данных для всех метрик
export function generateAllMetricsData(days: number = 30) {
  return Object.keys(METRICS).reduce(
    (acc, metricId) => {
      acc[metricId] = generateMetricData(metricId, days)
      return acc
    },
    {} as Record<string, MetricDataPoint[]>
  )
}

// Данные для таблицы с деталями
export interface DetailedRecord {
  id: string
  date: string
  clientId: string
  metric: string
  value: number
  channel: string
  tags: string[]
  status: 'resolved' | 'pending' | 'escalated'
  description: string
}

export function generateDetailedRecords(count: number = 50): DetailedRecord[] {
  const channels = ['онлайн-банк', 'мобильное приложение', 'колл-центр', 'отделение']
  const statuses: DetailedRecord['status'][] = ['resolved', 'pending', 'escalated']
  const descriptions = [
    'Ошибка при входе в систему',
    'Проблема с переводом средств',
    'Не работает функция пополнения',
    'Запрос на консультацию по кредиту',
    'Вопрос по тарифам обслуживания',
    'Техническая неисправность приложения',
  ]

  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    
    return {
      id: `REC-${String(i + 1).padStart(5, '0')}`,
      date: date.toISOString().split('T')[0],
      clientId: `CLI-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      metric: Object.keys(METRICS)[Math.floor(Math.random() * 4)],
      value: Math.round(Math.random() * 100),
      channel: channels[Math.floor(Math.random() * channels.length)],
      tags: generateRandomTags(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
    }
  }).sort((a, b) => b.date.localeCompare(a.date))
}
