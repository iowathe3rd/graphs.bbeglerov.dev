import { AlertTriangle, CheckCircle2, Clock3, Radar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BiComponentsShowcaseProps {
  activeSelection?: {
    sourceChart?: string
    channel?: string
    process?: string
    status?: string
    stage?: string
    hour?: number
    productGroup?: string
    subProduct?: string
  }
  anomalyCount?: number
}

export function BiComponentsShowcase({
  activeSelection,
  anomalyCount = 0,
}: BiComponentsShowcaseProps) {
  const selectionEntries = Object.entries(activeSelection ?? {}).filter(
    ([key, value]) => key !== 'sourceChart' && value !== undefined
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Статусы</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="default">Resolved</Badge>
          <Badge variant="secondary">In Progress</Badge>
          <Badge variant="destructive">Escalated</Badge>
          <Badge variant="outline">Queued</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Приоритеты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Critical
            </span>
            <span>12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-chart-3" /> Pending
            </span>
            <span>37</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-2" /> Resolved
            </span>
            <span>84</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SLA Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>БММБ</span>
              <span>91%</span>
            </div>
            <Progress value={91} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>КРС</span>
              <span>84%</span>
            </div>
            <Progress value={84} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>КСБ</span>
              <span>79%</span>
            </div>
            <Progress value={79} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Selection State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectionEntries.length === 0 ? (
            <Badge variant="outline">No active selection</Badge>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectionEntries.map(([key, value]) => (
                <Badge key={key} variant="outline">
                  {key}:{String(value)}
                </Badge>
              ))}
            </div>
          )}
          {activeSelection?.sourceChart && (
            <Badge variant="secondary">source:{activeSelection.sourceChart}</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Anomaly State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Radar className="h-4 w-4 text-chart-4" /> Anomaly events
            </span>
            <span>{anomalyCount}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline">threshold: dynamic</Badge>
            <Badge variant="destructive">high risk</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Breakdown Chips</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1">
          <Badge variant="outline">group:Платежи</Badge>
          <Badge variant="outline">group:Карты</Badge>
          <Badge variant="outline">process:Эскалации</Badge>
          <Badge variant="outline">channel:Колл-центр</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
