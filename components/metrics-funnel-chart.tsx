'use client'

import { Funnel, FunnelChart, LabelList, Tooltip as RechartsTooltip } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { EventStage, FunnelStageData } from '@/lib/metrics-data'

interface MetricsFunnelChartProps {
  data: FunnelStageData[]
  title?: string
  activeStage?: string
  onStageSelect: (stage: EventStage) => void
}

export function MetricsFunnelChart({
  data,
  title = 'Funnel: Intake → Routing → Work → Resolve',
  activeStage,
  onStageSelect,
}: MetricsFunnelChartProps) {
  const chartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--chart-2))',
    },
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных для Funnel</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-[360px] w-full">
          <FunnelChart>
            <RechartsTooltip formatter={(value: number) => `${value} кейсов`} />
            <Funnel
              data={data}
              dataKey="count"
              isAnimationActive={false}
              onClick={((...args: any[]) => {
                const index = args[1] as number | undefined
                const stage = index !== undefined ? data[index]?.stage : undefined
                if (stage) {
                  onStageSelect(stage)
                }
              }) as any}
            >
              <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="stage" />
            </Funnel>
          </FunnelChart>
        </ChartContainer>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => {
            const selected = activeStage === item.stage

            return (
              <Button
                key={item.stage}
                variant={selected ? 'default' : 'outline'}
                className="h-auto justify-between py-2"
                onClick={() => onStageSelect(item.stage)}
              >
                <span className="text-xs">{item.stage}</span>
                <span className="text-xs font-semibold">{item.count}</span>
              </Button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {data.map((item) => (
            <Badge key={`${item.stage}-meta`} variant="outline">
              {item.stage}: conv {item.conversion}% • drop {item.dropOff}%
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
