'use client'

import { CircleHelp } from 'lucide-react'

import type { InsightHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
import { ConsultationCoverageHelpDialogContent } from '@/features/insight-dashboard/components/consultation-coverage-help-dialog-content'
import { DetailedProductZonesHelpDialogContent } from '@/features/insight-dashboard/components/detailed-product-zones-help-dialog-content'
import { LineIndicatorHelpDialogContent } from '@/features/insight-dashboard/components/line-indicator-help-dialog-content'
import { MainProductDissatisfactionHelpDialogContent } from '@/features/insight-dashboard/components/main-product-dissatisfaction-help-dialog-content'
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

function renderHelpContent(copy: InsightHelpDialogCopy) {
  switch (copy.variant) {
    case 'product-dissatisfaction-score-main':
      return <MainProductDissatisfactionHelpDialogContent zoneThresholds={copy.zoneThresholds} />
    case 'product-dissatisfaction-score-detailed':
      return <DetailedProductZonesHelpDialogContent />
    case 'consultation-coverage':
      return <ConsultationCoverageHelpDialogContent />
    case 'combined-indicator-line':
      return <LineIndicatorHelpDialogContent metricId={copy.metricId} />
    default: {
      const exhaustiveCheck: never = copy.variant
      return exhaustiveCheck
    }
  }
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
          {renderHelpContent(copy)}
        </div>
      </DialogContent>
    </Dialog>
  )
}
