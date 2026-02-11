'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      <Button variant="outline" size="sm" className="w-[124px] justify-start" disabled>
        <Monitor className="mr-2 h-4 w-4" />
        Тема
      </Button>
    )
  }

  const current = THEME_ITEMS.find((item) => item.value === theme) ?? THEME_ITEMS[0]
  const Icon = current.icon

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="h-9 w-[124px]">
        <div className="flex items-center gap-2">
          <SelectValue placeholder="Тема" />
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {THEME_ITEMS.map((item) => {
          const ItemIcon = item.icon

          return (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                <ItemIcon className="h-4 w-4" />
                {item.label}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
