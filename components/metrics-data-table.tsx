'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Download } from 'lucide-react'
import type { DetailedRecord } from '@/lib/metrics-data'
import { METRICS } from '@/lib/metrics-data'
import { useState } from 'react'

interface MetricsDataTableProps {
  data: DetailedRecord[]
  maxRows?: number
}

type SortField = 'date' | 'value' | 'status'
type SortDirection = 'asc' | 'desc'

export function MetricsDataTable({ data, maxRows = 20 }: MetricsDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'date':
        return multiplier * a.date.localeCompare(b.date)
      case 'value':
        return multiplier * (a.value - b.value)
      case 'status':
        return multiplier * a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const displayData = sortedData.slice(0, maxRows)

  const getStatusVariant = (status: DetailedRecord['status']) => {
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

  const getStatusLabel = (status: DetailedRecord['status']) => {
    switch (status) {
      case 'resolved':
        return 'Решено'
      case 'pending':
        return 'В работе'
      case 'escalated':
        return 'Эскалировано'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Детализированные данные</CardTitle>
            <CardDescription>
              Показано {displayData.length} из {data.length} записей
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
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
                <TableHead>Клиент</TableHead>
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
                <TableHead>Канал</TableHead>
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
                <TableHead>Теги</TableHead>
                <TableHead className="min-w-[200px]">Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">{record.id}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(record.date).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{record.clientId}</TableCell>
                  <TableCell className="text-sm">
                    {METRICS[record.metric]?.name || record.metric}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {record.value}%
                  </TableCell>
                  <TableCell className="text-sm">{record.channel}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(record.status)}>
                      {getStatusLabel(record.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {record.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.description}
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
