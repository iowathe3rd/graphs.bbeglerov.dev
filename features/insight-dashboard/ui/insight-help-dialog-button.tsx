'use client'

import { CircleHelp } from 'lucide-react'

import type { InsightHelpDialogCopy } from '@/features/insight-dashboard/config/tooltips'
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
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <div className="space-y-3 text-sm leading-6">
            {copy.sections.map((section) => (
              <section key={section.title} className="rounded-md border border-border/70 p-3">
                <h4 className="text-sm font-semibold">{section.title}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
