import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: 'MangaFlow — Leia mangás online',
    template: '%s · MangaFlow'
  },
  description:
    'MangaFlow é uma plataforma para leitura de mangás online: catálogo curado, leitor responsivo e histórico de progresso.',
  metadataBase: new URL('https://mangaflow.vercel.app'),
  openGraph: {
    title: 'MangaFlow',
    description: 'Leia mangás online em qualidade.',
    siteName: 'MangaFlow',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#0d0d0f'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-background text-white antialiased font-sans">
        <Navbar />
        <main className="pt-16">{children}</main>
        <footer className="mt-24 border-t border-border py-8 text-center text-xs text-muted">
          <p>© {new Date().getFullYear()} MangaFlow. Feito com Next.js + Supabase.</p>
        </footer>
      </body>
    </html>
  );
}
