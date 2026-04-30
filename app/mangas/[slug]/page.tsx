import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const manga = await prisma.manga.findUnique({ where: { slug: params.slug }, select: { title: true, synopsis: true } })
  if (!manga) return {}
  return { title: `${manga.title} — MangaFlow`, description: manga.synopsis ?? '' }
}

const STATUS_LABEL: Record<string, string> = {
  ONGOING: 'Em andamento',
  COMPLETED: 'Completo',
  HIATUS: 'Hiato',
  CANCELLED: 'Cancelado',
}

export default async function MangaDetailPage({ params }: { params: { slug: string } }) {
  const manga = await prisma.manga.findUnique({
    where: { slug: params.slug },
    include: {
      chapters: {
        orderBy: { number: 'desc' },
        select: { id: true, number: true, title: true, createdAt: true },
      },
    },
  })

  if (!manga) notFound()

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Detalhes da obra */}
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          <div className="w-full sm:w-48 flex-shrink-0">
            <img
              src={manga.coverUrl || '/placeholder-cover.jpg'}
              alt={manga.title}
              className="w-full rounded-xl object-cover aspect-[3/4] bg-surface"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{manga.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                {STATUS_LABEL[manga.status] ?? manga.status}
              </span>
              {manga.genres.map((g) => (
                <span key={g} className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-muted">{g}</span>
              ))}
            </div>
            {manga.synopsis && (
              <p className="text-muted text-sm leading-relaxed mb-4">{manga.synopsis}</p>
            )}
            <p className="text-muted text-sm">{manga.chapters.length} capítulos</p>

            {manga.chapters.length > 0 && (
              <Link
                href={`/mangas/${manga.slug}/capitulo/${manga.chapters[manga.chapters.length - 1].number}`}
                className="inline-block mt-4 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition"
              >
                Ler do capítulo 1
              </Link>
            )}
          </div>
        </div>

        {/* Lista de capítulos */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Capítulos</h2>
          {manga.chapters.length === 0 ? (
            <p className="text-muted text-sm">Nenhum capítulo disponível ainda.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {manga.chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/mangas/${manga.slug}/capitulo/${ch.number}`}
                  className="flex items-center justify-between px-4 py-3 bg-surface hover:bg-border rounded-lg transition group"
                >
                  <span className="text-white text-sm group-hover:text-primary transition">
                    Capítulo {ch.number}{ch.title ? ` — ${ch.title}` : ''}
                  </span>
                  <span className="text-muted text-xs">
                    {new Date(ch.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
