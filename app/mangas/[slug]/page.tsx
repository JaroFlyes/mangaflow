import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ChapterList from '@/components/ChapterList'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const manga = await prisma.manga.findUnique({ where: { slug: params.slug } })
  if (!manga) return {}
  return {
    title: `${manga.title} — MangaFlow`,
    description: manga.synopsis || `Leia ${manga.title} no MangaFlow.`,
  }
}

export default async function MangaDetailPage({ params }: { params: { slug: string } }) {
  const manga = await prisma.manga.findUnique({
    where: { slug: params.slug },
    include: {
      chapters: {
        orderBy: { number: 'desc' },
        select: { number: true, title: true, createdAt: true },
      },
    },
  })

  if (!manga) notFound()

  const statusLabel: Record<string, string> = {
    ONGOING: 'Em andamento',
    COMPLETED: 'Completo',
    HIATUS: 'Hiato',
    CANCELLED: 'Cancelado',
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Capa */}
          <div className="w-full sm:w-48 flex-shrink-0">
            <div className="relative aspect-[2/3] w-full sm:w-48 rounded-lg overflow-hidden">
              <Image
                src={manga.coverUrl || '/placeholder-cover.jpg'}
                alt={manga.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Detalhes */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{manga.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-primary text-white">
                {statusLabel[manga.status] || manga.status}
              </span>
              {manga.genres.map((genre) => (
                <span key={genre} className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-muted">
                  {genre}
                </span>
              ))}
            </div>
            {manga.synopsis && (
              <p className="mt-4 text-muted leading-relaxed">{manga.synopsis}</p>
            )}
            <p className="mt-3 text-muted text-sm">{manga.chapters.length} capítulos</p>
          </div>
        </div>

        {/* Lista de capítulos */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">Capítulos</h2>
          <ChapterList
            mangaSlug={manga.slug}
            chapters={manga.chapters.map((c) => ({
              number: c.number,
              title: c.title || undefined,
              createdAt: new Date(c.createdAt).toLocaleDateString('pt-BR'),
            }))}
          />
        </div>
      </div>
    </main>
  )
}
