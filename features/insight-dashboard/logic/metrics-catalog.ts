export type MetricCategory = 'service' | 'operations' | 'risk'
export type MetricDirection = 'higher-better' | 'lower-better'
export type MetricFormat = 'percent' | 'seconds' | 'count'

export type PeriodGranularity = 'week' | 'month'

export interface MetricDataPoint {
  date: string
  value: number
}

export interface MetricInfo {
  id: string
  name: string
  description: string
  unit: string
  category: MetricCategory
  direction: MetricDirection
  format: MetricFormat
  thresholds: {
    low: number
    medium: number
    high: number
  }
  color: string
}

export const METRICS: Record<string, MetricInfo> = {
  sla: {
    id: 'sla',
    name: 'Технические проблемы/сбои',
    description: 'Доля обращений с техническими сбоями',
    unit: '%',
    category: 'operations',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 28, medium: 18, high: 10 },
    color: '#2563eb',
  },
  aht: {
    id: 'aht',
    name: 'Запрос не решен',
    description: 'Доля нерешенных запросов',
    unit: '%',
    category: 'service',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 24, medium: 14, high: 8 },
    color: '#f97316',
  },
  queueLoad: {
    id: 'queueLoad',
    name: 'Отрицательный продуктовый фидбэк',
    description: 'Доля негативной обратной связи по продуктам',
    unit: '%',
    category: 'risk',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 20, medium: 12, high: 6 },
    color: '#0f766e',
  },
  abandonment: {
    id: 'abandonment',
    name: 'Угроза ухода/отказа от продуктов банка',
    description: 'Доля обращений с риском ухода клиента',
    unit: '%',
    category: 'risk',
    direction: 'lower-better',
    format: 'percent',
    thresholds: { low: 16, medium: 9, high: 4 },
    color: '#64748b',
  },
}
