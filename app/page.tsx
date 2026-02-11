'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Activity, Clock3, PhoneCall, ShieldAlert, X } from 'lucide-react'

import { BiComponentsShowcase } from '@/components/bi-components-showcase'
import { MetricsBarChart } from '@/components/metrics-bar-chart'
import { MetricsCombinedChart } from '@/components/metrics-combined-chart'
import { MetricsDataTable } from '@/components/metrics-data-table'
import {
  DEFAULT_FILTERS,
  MetricsFiltersComponent,
  type MetricsFilters,
} from '@/components/metrics-filters'
import { MetricsLineChart } from '@/components/metrics-line-chart'
import { MetricsStackedChart } from '@/components/metrics-stacked-chart'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FUNNEL_STAGES,
  METRICS,
  PROCESSES,
  generateDetailedRecords,
  generateEventStream,
  generateFunnelData,
  generateHeatmapData,
  generateMetricsDataFromEvents,
  generateOverlapAnalytics,
  generateSankeyData,
  type EventRecord,
  type OverlapDimension,
  type OverlapGranularity,
  type EventStage,
} from '@/lib/metrics-data'

const MetricsSankeyChart = dynamic(
  () =>
    import('@/components/metrics-sankey-chart').then(
      (module) => module.MetricsSankeyChart
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading Sankey...
        </CardContent>
      </Card>
    ),
  }
)

const MetricsFunnelChart = dynamic(
  () =>
    import('@/components/metrics-funnel-chart').then(
      (module) => module.MetricsFunnelChart
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading Funnel...
        </CardContent>
      </Card>
    ),
  }
)

const MetricsHeatmapChart = dynamic(
  () =>
    import('@/components/metrics-heatmap-chart').then(
      (module) => module.MetricsHeatmapChart
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading Heatmap...
        </CardContent>
      </Card>
    ),
  }
)

const MetricsOverlapZonesChart = dynamic(
  () =>
    import('@/components/metrics-overlap-zones-chart').then(
      (module) => module.MetricsOverlapZonesChart
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Загрузка пересечений...
        </CardContent>
      </Card>
    ),
  }
)

const METRIC_IDS = [
  'sla',
  'aht',
  'fcr',
  'csat',
  'queueLoad',
  'abandonment',
] as const

type ActiveSelection = {
  sourceChart?: 'sankey' | 'funnel' | 'heatmap' | 'overlap'
  channel?: string
  process?: string
  status?: string
  stage?: string
  hour?: number
  productGroup?: string
  subProduct?: string
}

function isDateInRange(date: string, from?: Date, to?: Date) {
  const current = new Date(date)

  if (from && current < from) {
    return false
  }

  if (to && current > to) {
    return false
  }

  return true
}

function applyActiveSelection(event: EventRecord, selection: ActiveSelection) {
  if (selection.channel && event.channel !== selection.channel) {
    return false
  }

  if (selection.process && event.process !== selection.process) {
    return false
  }

  if (selection.status && event.status !== selection.status) {
    return false
  }

  if (selection.stage && event.stage !== selection.stage) {
    return false
  }

  if (selection.hour !== undefined && event.hour !== selection.hour) {
    return false
  }

  if (selection.productGroup && event.productGroup !== selection.productGroup) {
    return false
  }

  if (selection.subProduct && event.subProduct !== selection.subProduct) {
    return false
  }

  return true
}

function selectionChips(selection: ActiveSelection) {
  const chips: string[] = []

  if (selection.channel) chips.push(`channel:${selection.channel}`)
  if (selection.process) chips.push(`process:${selection.process}`)
  if (selection.status) chips.push(`status:${selection.status}`)
  if (selection.stage) chips.push(`stage:${selection.stage}`)
  if (selection.hour !== undefined) chips.push(`hour:${selection.hour}`)
  if (selection.productGroup) chips.push(`group:${selection.productGroup}`)
  if (selection.subProduct) chips.push(`sub:${selection.subProduct}`)

  return chips
}

export default function Page() {
  const [filters, setFilters] = useState<MetricsFilters>(() => DEFAULT_FILTERS)
  const [activeSelection, setActiveSelection] = useState<ActiveSelection>(() => ({}))
  const [overlapDimension, setOverlapDimension] = useState<OverlapDimension>(
    () => 'domain'
  )
  const [overlapGranularity, setOverlapGranularity] =
    useState<OverlapGranularity>(() => 'week')

  const selectedSector = filters.sectors[0] ?? DEFAULT_FILTERS.sectors[0]

  const events = useMemo(
    () => generateEventStream(20000, 180, 42, selectedSector),
    [selectedSector]
  )

  const filteredByBase = useMemo(() => {
    const byChannels = filters.channels
    const byProcesses = filters.processes

    return events.filter((event) => {
      if (!isDateInRange(event.date, filters.dateRange.from, filters.dateRange.to)) {
        return false
      }

      if (byChannels.length > 0 && !byChannels.includes(event.channel)) {
        return false
      }

      if (byProcesses.length > 0 && !byProcesses.includes(event.process)) {
        return false
      }

      if (filters.productGroup !== 'all' && event.productGroup !== filters.productGroup) {
        return false
      }

      if (filters.subProduct !== 'all' && event.subProduct !== filters.subProduct) {
        return false
      }

      return true
    })
  }, [
    events,
    filters.channels,
    filters.dateRange.from,
    filters.dateRange.to,
    filters.processes,
    filters.productGroup,
    filters.subProduct,
  ])

  const linkedEvents = useMemo(
    () => filteredByBase.filter((event) => applyActiveSelection(event, activeSelection)),
    [activeSelection, filteredByBase]
  )

  const metricsData = useMemo(
    () => generateMetricsDataFromEvents(linkedEvents, 180),
    [linkedEvents]
  )

  const records = useMemo(
    () => generateDetailedRecords(500, 42, selectedSector, linkedEvents),
    [linkedEvents, selectedSector]
  )

  const metricsArray = useMemo(() => METRIC_IDS.map((id) => METRICS[id]), [])

  const summary = useMemo(() => {
    let resolved = 0
    let escalated = 0
    let anomalies = 0

    for (const event of linkedEvents) {
      if (event.status === 'resolved') {
        resolved += 1
      } else if (event.status === 'escalated') {
        escalated += 1
      }

      if (event.anomaly) {
        anomalies += 1
      }
    }

    return {
      currentSla: metricsData.sla.at(-1)?.value ?? 0,
      currentAht: metricsData.aht.at(-1)?.value ?? 0,
      currentQueue: metricsData.queueLoad.at(-1)?.value ?? 0,
      resolved,
      escalated,
      anomalies,
      total: linkedEvents.length,
    }
  }, [linkedEvents, metricsData.aht, metricsData.queueLoad, metricsData.sla])

  const processAverages = useMemo(() => {
    const sums = new Map<string, { total: number; count: number }>()

    for (const process of PROCESSES) {
      sums.set(process, { total: 0, count: 0 })
    }

    for (const event of linkedEvents) {
      const current = sums.get(event.process)

      if (!current) {
        continue
      }

      current.total += event.value
      current.count += 1
    }

    return Array.from(sums.entries()).map(([name, item]) => ({
      name,
      value: item.count === 0 ? 0 : Number((item.total / item.count).toFixed(1)),
    }))
  }, [linkedEvents])

  const sankeyData = useMemo(
    () => generateSankeyData(linkedEvents, { flow: 'channel-process-status' }),
    [linkedEvents]
  )

  const funnelData = useMemo(
    () => generateFunnelData(linkedEvents, { stages: FUNNEL_STAGES }),
    [linkedEvents]
  )

  const heatmapData = useMemo(
    () => generateHeatmapData(linkedEvents, { axisX: 'hour', axisY: 'channel' }),
    [linkedEvents]
  )

  const overlapData = useMemo(
    () =>
      generateOverlapAnalytics(linkedEvents, {
        dimension: overlapDimension,
        granularity: overlapGranularity,
        topN: 7,
      }),
    [linkedEvents, overlapDimension, overlapGranularity]
  )

  const currentSelectionChips = selectionChips(activeSelection)
  const hasSelection = currentSelectionChips.length > 0
  const activeOverlapLabel =
    overlapDimension === 'domain'
      ? activeSelection.productGroup
      : activeSelection.process

  const handleResetAll = () => {
    setFilters(DEFAULT_FILTERS)
    setActiveSelection({})
  }

  const handleSankeyNodeSelect = (selection: {
    nodeType: 'channel' | 'process' | 'status'
    value: string
  }) => {
    if (selection.nodeType === 'channel') {
      setActiveSelection({ sourceChart: 'sankey', channel: selection.value })
      return
    }

    if (selection.nodeType === 'process') {
      setActiveSelection({ sourceChart: 'sankey', process: selection.value })
      return
    }

    setActiveSelection({ sourceChart: 'sankey', status: selection.value })
  }

  const handleFunnelStageSelect = (stage: EventStage) => {
    setActiveSelection({ sourceChart: 'funnel', stage })
  }

  const handleHeatmapSelect = (selection: { channel: string; hour: number }) => {
    setActiveSelection({
      sourceChart: 'heatmap',
      channel: selection.channel,
      hour: selection.hour,
    })
  }

  const handleOverlapSelect = (selection: {
    dimension: OverlapDimension
    value: string
  }) => {
    if (selection.dimension === 'domain') {
      setActiveSelection({
        sourceChart: 'overlap',
        productGroup: selection.value,
      })
      return
    }

    setActiveSelection({
      sourceChart: 'overlap',
      process: selection.value,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Bereke BI Sandbox</h1>
            <p className="mt-1 text-xs text-muted-foreground">Сектор: {selectedSector}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 md:px-6">
        <MetricsFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetAll}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                SLA
                <Activity className="h-4 w-4 text-chart-1" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.currentSla.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                AHT
                <Clock3 className="h-4 w-4 text-chart-2" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{Math.round(summary.currentAht)}с</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                Queue Load
                <PhoneCall className="h-4 w-4 text-chart-3" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.currentQueue.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                Эскалации
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.escalated}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">Resolved: {summary.resolved}</Badge>
                <Badge variant="outline">Anomaly: {summary.anomalies}</Badge>
                <span>Total: {summary.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 lg:grid-cols-10">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="trends">Тренды</TabsTrigger>
            <TabsTrigger value="comparison">Сравнение</TabsTrigger>
            <TabsTrigger value="stack">Стек</TabsTrigger>
            <TabsTrigger value="sankey">Sankey</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="overlap">Пересечения</TabsTrigger>
            <TabsTrigger value="registry">Реестр</TabsTrigger>
            <TabsTrigger value="components">Компоненты</TabsTrigger>
          </TabsList>

          {hasSelection && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              {currentSelectionChips.map((chip) => (
                <Badge key={chip} variant="secondary">
                  {chip}
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setActiveSelection({})}
              >
                <X className="mr-1 h-3 w-3" />
                Clear selection
              </Button>
            </div>
          )}

          <TabsContent value="overview" className="space-y-4">
            <MetricsCombinedChart
              data={metricsData}
              metrics={[METRICS.sla, METRICS.fcr, METRICS.csat, METRICS.abandonment]}
              title="Общий тренд"
            />
            <MetricsBarChart
              data={processAverages}
              title="Процессы: среднее значение"
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {metricsArray.map((metric) => (
                <MetricsLineChart
                  key={metric.id}
                  data={metricsData[metric.id]}
                  metric={metric}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <MetricsCombinedChart
              data={metricsData}
              metrics={[METRICS.sla, METRICS.aht, METRICS.queueLoad, METRICS.abandonment]}
              title="Сравнение KPI"
            />
            <MetricsBarChart data={processAverages} />
          </TabsContent>

          <TabsContent value="stack" className="space-y-4">
            <MetricsStackedChart
              data={metricsData}
              metrics={[METRICS.sla, METRICS.fcr, METRICS.csat, METRICS.queueLoad]}
              title="Композиция по KPI"
            />
          </TabsContent>

          <TabsContent value="sankey" className="space-y-4">
            <MetricsSankeyChart
              data={sankeyData}
              activeSelection={activeSelection}
              onNodeSelect={handleSankeyNodeSelect}
            />
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <MetricsFunnelChart
              data={funnelData}
              activeStage={activeSelection.stage}
              onStageSelect={handleFunnelStageSelect}
            />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <MetricsHeatmapChart
              data={heatmapData}
              activeSelection={{
                channel: activeSelection.channel,
                hour: activeSelection.hour,
              }}
              onCellSelect={handleHeatmapSelect}
            />
          </TabsContent>

          <TabsContent value="overlap" className="space-y-4">
            <MetricsOverlapZonesChart
              data={overlapData}
              dimension={overlapDimension}
              granularity={overlapGranularity}
              activeLabel={activeOverlapLabel}
              onDimensionChange={setOverlapDimension}
              onGranularityChange={setOverlapGranularity}
              onEntitySelect={handleOverlapSelect}
            />
          </TabsContent>

          <TabsContent value="registry" className="space-y-4">
            <MetricsDataTable
              data={records}
              maxRows={80}
              activeSelection={activeSelection}
            />
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <BiComponentsShowcase
              activeSelection={activeSelection}
              anomalyCount={summary.anomalies}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
