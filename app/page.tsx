import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MangaCard from '@/components/MangaCard'

export default async function HomePage() {
  const mangas = await prisma.manga.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 12,
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      status: true,
    },
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Bem-vindo ao{' '}
            <span className="text-primary">MangaFlow</span>
          </h1>
          <p className="mt-3 text-muted text-lg">
            Leia seus mangás favoritos com a melhor experiência.
          </p>
          <Link
            href="/mangas"
            className="inline-block mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition"
          >
            Ver catálogo →
          </Link>
        </div>

        {/* Recentes */}
        {mangas.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Atualizados recentemente</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mangas.map((manga) => (
                <MangaCard
                  key={manga.id}
                  title={manga.title}
                  slug={manga.slug}
                  coverUrl={manga.coverUrl || '/placeholder-cover.jpg'}
                  status={manga.status}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
