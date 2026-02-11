import Link from 'next/link'
import type { ReactNode } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'

const LINKS = [
  { href: '/showcase', label: 'Overview' },
  { href: '/showcase/line', label: 'Line' },
  { href: '/showcase/overlap', label: 'Overlap' },
  { href: '/showcase/sankey', label: 'Sankey' },
  { href: '/showcase/funnel', label: 'Funnel' },
  { href: '/showcase/heatmap', label: 'Heatmap' },
]

export default function ShowcaseLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card/75 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4">{children}</main>
    </div>
  )
}
