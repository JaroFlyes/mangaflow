export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MangaCard from '@/components/MangaCard'
import Header from '@/components/Header'

export default async function HomePage() {
  let mangas: any[] = []

  try {
    mangas = await prisma.manga.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 12,
      select: {
        id: true, title: true, slug: true,
        coverUrl: true, status: true,
        _count: { select: { chapters: true } },
      },
    })
  } catch {}

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4">
                Plataforma de leitura
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Leia seus mangás
                <span className="block text-primary">favoritos.</span>
              </h1>
              <p className="mt-4 text-muted text-lg leading-relaxed">
                Catálogo completo, histórico de leitura e sua biblioteca pessoal — tudo em um só lugar.
              </p>
              <div className="flex items-center gap-3 mt-8">
                <Link
                  href="/mangas"
                  className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition shadow-lg shadow-primary/20"
                >
                  Ver catálogo
                </Link>
                <Link
                  href="/registro"
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mangás recentes */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          {mangas.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Atualizados recentemente</h2>
                <Link href="/mangas" className="text-sm text-primary hover:underline">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mangas.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    title={manga.title}
                    slug={manga.slug}
                    coverUrl={manga.coverUrl || '/placeholder-cover.jpg'}
                    status={manga.status}
                    chapterCount={manga._count.chapters}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Estado vazio */
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-white text-xl font-bold mb-2">Nenhum mangá ainda</h3>
              <p className="text-muted text-sm mb-6">O catálogo está vazio. Adicione obras pelo painel admin.</p>
              <Link href="/admin" className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition">
                Ir para o admin
              </Link>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📚', title: 'Catálogo completo', desc: 'Obras organizadas por gênero, status e atualização.' },
              { icon: '📍', title: 'Histórico de leitura', desc: 'Continue de onde parou, em qualquer dispositivo.' },
              { icon: '⭐', title: 'Biblioteca pessoal', desc: 'Salve seus favoritos e organize sua leitura.' },
            ].map((f) => (
              <div key={f.title} className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
