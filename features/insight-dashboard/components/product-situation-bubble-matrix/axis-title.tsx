import { cn } from '@/lib/utils'

interface BubbleYAxisTitleProps {
  isMainProductsView: boolean
}

export function BubbleYAxisTitle({ isMainProductsView }: BubbleYAxisTitleProps) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          '-rotate-90 whitespace-nowrap text-[10px] text-muted-foreground md:text-[11px]',
          isMainProductsView ? 'text-[12px] font-bold md:text-sm' : null
        )}
      >
        Оценка неудовлетворенности продуктом (чем выше, тем хуже)
      </span>
    </div>
  )
}
