'use client'

import { Sankey, Tooltip as RechartsTooltip } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { SankeyData, SankeyNodeType } from '@/lib/metrics-data'

interface MetricsSankeyChartProps {
  data: SankeyData
  title?: string
  activeSelection?: {
    channel?: string
    process?: string
    status?: string
  }
  onNodeSelect: (selection: { nodeType: SankeyNodeType; value: string }) => void
}

function readableNodeType(nodeType: SankeyNodeType) {
  switch (nodeType) {
    case 'channel':
      return 'Channel'
    case 'process':
      return 'Process'
    case 'status':
      return 'Status'
    default:
      return nodeType
  }
}

export function MetricsSankeyChart({
  data,
  title = 'Sankey: Channel → Process → Status',
  activeSelection,
  onNodeSelect,
}: MetricsSankeyChartProps) {
  const chartConfig = {
    flow: {
      label: 'Flow',
      color: 'hsl(var(--chart-1))',
    },
  }

  if (!data.nodes.length || !data.links.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Нет данных для Sankey</CardContent>
      </Card>
    )
  }

  const customNode = (props: any) => {
    const index = props?.index
    const node = data.nodes[index]

    if (!node) {
      return <g />
    }

    const selected =
      (node.nodeType === 'channel' && activeSelection?.channel === node.name) ||
      (node.nodeType === 'process' && activeSelection?.process === node.name) ||
      (node.nodeType === 'status' && activeSelection?.status === node.name)

    return (
      <g
        onClick={() => onNodeSelect({ nodeType: node.nodeType, value: node.name })}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          rx={3}
          fill={selected ? 'hsl(var(--primary))' : 'hsl(var(--chart-3))'}
          opacity={selected ? 1 : 0.82}
        />
        <text
          x={props.x + props.width + 6}
          y={props.y + props.height / 2}
          dominantBaseline="middle"
          fill="hsl(var(--foreground))"
          fontSize={11}
        >
          {node.name}
        </text>
      </g>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[440px] w-full">
          <Sankey
            data={data as any}
            node={customNode as any}
            nodePadding={18}
            nodeWidth={14}
            margin={{ left: 20, right: 160, top: 16, bottom: 16 }}
            link={{ stroke: 'hsl(var(--chart-1))', strokeOpacity: 0.35 }}
          >
            <RechartsTooltip
              formatter={(value: number) => `${value} событий`}
              labelFormatter={(entry: any) => {
                if (entry?.payload?.name && entry?.payload?.nodeType) {
                  return `${readableNodeType(entry.payload.nodeType)}: ${entry.payload.name}`
                }

                return 'Flow'
              }}
            />
          </Sankey>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
