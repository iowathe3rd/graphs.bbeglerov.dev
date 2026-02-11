import type { Metadata } from 'next'
import { Roboto, Roboto_Condensed } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto-condensed',
})

export const metadata: Metadata = {
  title: 'Bereke BI Sandbox',
  description: 'Sandbox графиков и BI-компонентов для колл-центра и продуктовых блоков',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
