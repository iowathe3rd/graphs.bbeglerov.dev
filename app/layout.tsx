import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter'
})
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
  title: 'Аналитическая Панель Банка',
  description: 'Интерактивные визуализации метрик и индикаторов работы банка',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
