import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { ShowcaseHeaderNav } from '@/components/showcase-header-nav'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ShowcaseLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.png" alt="Bereke" width={30} height={30} />
              <span className="font-display text-[18px] font-semibold tracking-tight">
                Bereke BI
              </span>
            </Link>
            <ShowcaseHeaderNav />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-md border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs font-medium text-foreground/90 transition hover:border-primary/45 md:inline-flex"
            >
              Дашборд
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-6">
        {children}
      </main>
    </div>
  )
}
