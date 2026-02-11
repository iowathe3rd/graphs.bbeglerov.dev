'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/showcase', label: 'Обзор' },
  { href: '/showcase/line', label: 'Линии' },
  { href: '/showcase/overlap', label: 'Наслаивания' },
  { href: '/showcase/sankey', label: 'Потоки' },
  { href: '/showcase/funnel', label: 'Воронка' },
  { href: '/showcase/heatmap', label: 'Теплокарта' },
]

export function ShowcaseHeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="w-full overflow-x-auto">
      <div className="inline-flex min-w-max items-center gap-1 rounded-lg border border-border/70 bg-background/60 p-1">
        {LINKS.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                'text-muted-foreground hover:bg-background/80 hover:text-foreground',
                isActive && 'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

