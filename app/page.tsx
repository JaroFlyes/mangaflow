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
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        {/* Grade decorativa */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#e94560] bg-[#e94560]/10 border border-[#e94560]/25 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e94560] animate-pulse" />
              Plataforma de leitura gratuita
            </span>

            <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Leia seus mangás
              <br />
              <span className="text-[#e94560]">favoritos.</span>
            </h1>

            <p className="mt-5 text-lg text-[#888] leading-relaxed max-w-lg">
              Catálogo completo, histórico de leitura e sua biblioteca pessoal — tudo em um só lugar.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-9">
              <Link
                href="/mangas"
                className="px-6 py-3 bg-[#e94560] hover:bg-[#c73652] text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(233,69,96,0.35)] hover:shadow-[0_0_40px_rgba(233,69,96,0.5)]"
              >
                Ver catálogo
              </Link>
              <Link
                href="/registro"
                className="px-6 py-3 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium rounded-xl transition-all hover:bg-white/5"
              >
                Criar conta gratis
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              {[
                { label: 'Obras', value: '—' },
                { label: 'Capítulos', value: '—' },
                { label: 'Leitores', value: '—' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-[#555] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MANGÁS RECENTES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {mangas.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Atualizados recentemente</h2>
                <p className="text-[#555] text-sm mt-1">Continue lendo ou descubra algo novo</p>
              </div>
              <Link href="/mangas" className="text-sm text-[#e94560] hover:text-[#ff6b84] transition font-medium">
                Ver todos →
              </Link>
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
          /* Estado vazio estilizado */
          <div className="relative rounded-2xl border border-dashed border-white/10 p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e94560]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#e94560]/10 border border-[#e94560]/20 flex items-center justify-center text-3xl mx-auto mb-5">
                📚
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Catálogo vazio</h3>
              <p className="text-[#555] text-sm mb-7 max-w-xs mx-auto">
                Adicione obras pelo painel admin para aparecerem aqui.
              </p>
              <Link
                href="/admin"
                className="inline-block px-6 py-2.5 bg-[#e94560] hover:bg-[#c73652] text-white text-sm font-semibold rounded-xl transition shadow-[0_0_20px_rgba(233,69,96,0.3)]"
              >
                Abrir painel admin
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '📚',
              title: 'Catálogo completo',
              desc: 'Obras organizadas por gênero, status e atualização.',
              color: 'from-blue-500/10',
            },
            {
              icon: '📍',
              title: 'Histórico de leitura',
              desc: 'Continue de onde parou automaticamente.',
              color: 'from-[#e94560]/10',
            },
            {
              icon: '⭐',
              title: 'Biblioteca pessoal',
              desc: 'Salve favoritos e organize sua leitura.',
              color: 'from-yellow-500/10',
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`relative rounded-2xl border border-white/8 p-7 overflow-hidden bg-gradient-to-br ${f.color} to-transparent`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
