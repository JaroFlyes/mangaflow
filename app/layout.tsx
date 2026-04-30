import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MangaFlow — Leia seus mangás favoritos',
  description: 'Plataforma moderna de leitura de mangás com catálogo, histórico e favoritos.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-background text-white`}>
        {children}
      </body>
    </html>
  )
}
