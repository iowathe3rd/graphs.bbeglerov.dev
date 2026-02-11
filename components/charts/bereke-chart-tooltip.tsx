'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface BerekeTooltipRow {
  id?: string
  label: ReactNode
  value?: ReactNode
  color?: string
  strong?: boolean
}

interface BerekeChartTooltipProps {
  title?: ReactNode
  subtitle?: ReactNode
  rows?: BerekeTooltipRow[]
  className?: string
}

export function BerekeChartTooltip({
  title,
  subtitle,
  rows = [],
  className,
}: BerekeChartTooltipProps) {
  if (!title && !subtitle && rows.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'min-w-[180px] rounded-lg border border-border/75 bg-background/95 px-3 py-2 shadow-md backdrop-blur-sm',
        className
      )}
    >
      {title ? (
        <p className="mb-1 text-[12px] font-semibold leading-none text-foreground">{title}</p>
      ) : null}
      {subtitle ? (
        <p className="mb-1.5 text-[11px] leading-none text-muted-foreground">{subtitle}</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="space-y-1.5">
          {rows.map((row, index) => (
            <div
              key={row.id ?? `${String(row.label)}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground">
                {row.color ? (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                ) : null}
                <span className={row.strong ? 'font-semibold' : undefined}>{row.label}</span>
              </span>
              {row.value !== undefined ? (
                <span className={cn('text-[12px] font-medium text-foreground', row.strong && 'font-semibold')}>
                  {row.value}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

