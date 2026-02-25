'use client'

import { CircleHelp } from 'lucide-react'

import type { InsightHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import { InsightHelpDialogContent } from '@/features/insight-dashboard/ui/insight-help-dialog-content'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface InsightHelpDialogButtonProps {
  copy: InsightHelpDialogCopy
  ariaLabel: string
  triggerClassName?: string
  contentClassName?: string
}

export function InsightHelpDialogButton({
  copy,
  ariaLabel,
  triggerClassName,
  contentClassName,
}: InsightHelpDialogButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:text-foreground',
            triggerClassName
          )}
          aria-label={ariaLabel}
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-2xl', contentClassName)}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          {copy.description ? <DialogDescription>{copy.description}</DialogDescription> : null}
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <InsightHelpDialogContent zoneThresholds={copy.zoneThresholds} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
