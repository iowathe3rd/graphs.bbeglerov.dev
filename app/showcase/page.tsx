import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PAGES = [
  {
    href: '/showcase/line',
    title: 'Линейные графики',
    description: '4 KPI линии на разношерстных данных',
  },
  {
    href: '/showcase/overlap',
    title: 'Наслаивания',
    description: 'зоны наслаиваний + динамика',
  },
  {
    href: '/showcase/product-situation',
    title: 'Ситуация продукта',
    description: 'комбинированный обзор риска, тегов и объема звонков',
  },
  {
    href: '/showcase/sankey',
    title: 'Потоки (Sankey)',
    description: 'потоки Channel → Process → Status',
  },
  {
    href: '/showcase/funnel',
    title: 'Воронка',
    description: 'Intake → Routing → Work → Resolve',
  },
  {
    href: '/showcase/heatmap',
    title: 'Теплокарта',
    description: 'матрица Hour × Channel',
  },
]

export default function ShowcasePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl tracking-tight">Витрина компонентов</h1>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PAGES.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full border-border/70 transition hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
