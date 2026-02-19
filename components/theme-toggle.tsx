'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const THEME_ITEMS = [
  { value: 'system', label: 'Система', icon: Monitor },
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full border-border/70 md:h-7 md:w-7"
        disabled
        aria-label="Тема"
      >
        <Monitor className="h-4 w-4 md:h-3.5 md:w-3.5" />
      </Button>
    )
  }

  const current = THEME_ITEMS.find((item) => item.value === theme) ?? THEME_ITEMS[0]
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-border/70 bg-background/80 md:h-7 md:w-7"
          aria-label="Сменить тему"
        >
          <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {THEME_ITEMS.map((item) => {
          const ItemIcon = item.icon

          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setTheme(item.value)}
              className="flex items-center gap-2"
            >
              <ItemIcon className="h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
