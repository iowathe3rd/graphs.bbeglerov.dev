'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { METRICS, type DetailedRecord } from '@/lib/metrics-data'

interface ActiveSelection {
  sourceChart?: 'sankey' | 'funnel' | 'heatmap'
  channel?: string
  process?: string
  status?: string
  stage?: string
  hour?: number
  productGroup?: string
  subProduct?: string
}

interface MetricsDataTableProps {
  data: DetailedRecord[]
  maxRows?: number
  activeSelection?: ActiveSelection
}

type SortField = 'date' | 'value' | 'status' | 'hour'
type SortDirection = 'asc' | 'desc'

function statusVariant(status: DetailedRecord['status']) {
  switch (status) {
    case 'resolved':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'escalated':
      return 'destructive'
    default:
      return 'outline'
  }
}

function statusLabel(status: DetailedRecord['status']) {
  switch (status) {
    case 'resolved':
      return 'Решено'
    case 'pending':
      return 'В работе'
    case 'escalated':
      return 'Эскалация'
    default:
      return status
  }
}

function buildSelectionChips(activeSelection?: ActiveSelection) {
  if (!activeSelection) {
    return []
  }

  const chips: string[] = []

  if (activeSelection.channel) chips.push(`channel:${activeSelection.channel}`)
  if (activeSelection.process) chips.push(`process:${activeSelection.process}`)
  if (activeSelection.status) chips.push(`status:${activeSelection.status}`)
  if (activeSelection.stage) chips.push(`stage:${activeSelection.stage}`)
  if (activeSelection.hour !== undefined) chips.push(`hour:${activeSelection.hour}`)
  if (activeSelection.productGroup) chips.push(`group:${activeSelection.productGroup}`)
  if (activeSelection.subProduct) chips.push(`sub:${activeSelection.subProduct}`)

  return chips
}

export function MetricsDataTable({
  data,
  maxRows = 20,
  activeSelection,
}: MetricsDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const displayData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1

      switch (sortField) {
        case 'date':
          return multiplier * a.date.localeCompare(b.date)
        case 'value':
          return multiplier * (a.value - b.value)
        case 'status':
          return multiplier * a.status.localeCompare(b.status)
        case 'hour':
          return multiplier * (a.hour - b.hour)
        default:
          return 0
      }
    })

    return sortedData.slice(0, maxRows)
  }, [data, maxRows, sortDirection, sortField])

  const selectionChips = buildSelectionChips(activeSelection)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection('desc')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Реестр обращений</CardTitle>
        {selectionChips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectionChips.map((chip) => (
              <Badge key={chip} variant="outline">
                {chip}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort('date')}
                  >
                    Дата
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Сектор</TableHead>
                <TableHead>Product Group</TableHead>
                <TableHead>Sub Product</TableHead>
                <TableHead>Процесс</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort('hour')}
                  >
                    Час
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Метрика</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort('value')}
                  >
                    Значение
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleSort('status')}
                  >
                    Статус
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">{record.id}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(record.date).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>{record.sector}</TableCell>
                  <TableCell>{record.productGroup}</TableCell>
                  <TableCell>{record.subProduct}</TableCell>
                  <TableCell>{record.process}</TableCell>
                  <TableCell>{record.channel}</TableCell>
                  <TableCell>{record.stage}</TableCell>
                  <TableCell>{String(record.hour).padStart(2, '0')}:00</TableCell>
                  <TableCell>{METRICS[record.metric]?.name ?? record.metric}</TableCell>
                  <TableCell className="text-right font-semibold">{record.value}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(record.status)}>
                      {statusLabel(record.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
