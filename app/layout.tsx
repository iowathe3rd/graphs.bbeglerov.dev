import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
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
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
