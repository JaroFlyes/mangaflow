import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = {
  title: 'Catálogo de Mangás | MangaFlow',
  description: 'Explore o catálogo completo de mangás no MangaFlow. Leitura gratuita, organizada por gênero e status.',
}

export default async function MangasPage() {
  const mangas = await prisma.manga.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { chapters: true } } },
  })

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Catálogo</h1>
        {mangas.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-muted">Nenhuma obra no catálogo ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mangas.map((manga) => (
              <Link key={manga.id} href={`/mangas/${manga.slug}`} className="group">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border mb-2">
                  <img
                    src={manga.coverUrl || '/placeholder-cover.jpg'}
                    alt={manga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-white text-sm font-medium truncate group-hover:text-primary transition">{manga.title}</p>
                <p className="text-muted text-xs">{manga._count.chapters} capítulos</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
