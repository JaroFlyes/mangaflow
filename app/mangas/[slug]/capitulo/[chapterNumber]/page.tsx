import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function ReaderPage({
  params,
}: {
  params: { slug: string; chapterNumber: string }
}) {
  const chapterNumber = parseFloat(params.chapterNumber)

  const manga = await prisma.manga.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, slug: true },
  })

  if (!manga) notFound()

  const chapter = await prisma.chapter.findFirst({
    where: { mangaId: manga.id, number: chapterNumber },
    include: { pages: { orderBy: { number: 'asc' } } },
  })

  if (!chapter) notFound()

  const [prev, next] = await Promise.all([
    prisma.chapter.findFirst({
      where: { mangaId: manga.id, number: { lt: chapterNumber } },
      orderBy: { number: 'desc' },
      select: { number: true },
    }),
    prisma.chapter.findFirst({
      where: { mangaId: manga.id, number: { gt: chapterNumber } },
      orderBy: { number: 'asc' },
      select: { number: true },
    }),
  ])

  const base = `/mangas/${manga.slug}/capitulo`

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Barra do leitor */}
      <div className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between text-sm">
          <Link href={`/mangas/${manga.slug}`} className="text-muted hover:text-white transition truncate max-w-[140px]">
            ← {manga.title}
          </Link>
          <span className="text-white font-medium">Cap. {chapter.number}{chapter.title ? ` — ${chapter.title}` : ''}</span>
          <div className="flex gap-2">
            {prev && (
              <Link href={`${base}/${prev.number}`} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-muted hover:text-white transition text-xs">
                ← Ant.
              </Link>
            )}
            {next && (
              <Link href={`${base}/${next.number}`} className="px-3 py-1.5 bg-primary hover:bg-primary-hover rounded-lg text-white transition text-xs">
                Próx. →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Páginas */}
      <div className="reader-container py-4">
        {chapter.pages.length === 0 ? (
          <div className="text-center py-24 text-muted">Nenhuma página disponível.</div>
        ) : (
          chapter.pages.map((page) => (
            <img
              key={page.id}
              src={page.imageUrl}
              alt={`Página ${page.number}`}
              className="w-full max-w-[800px] mx-auto block"
              loading="lazy"
            />
          ))
        )}
      </div>

      {/* Navegação inferior */}
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-between gap-4">
        {prev ? (
          <Link href={`${base}/${prev.number}`} className="flex-1 py-3 bg-surface border border-border rounded-xl text-center text-muted hover:text-white transition text-sm">
            ← Capítulo {prev.number}
          </Link>
        ) : <div className="flex-1" />}
        <Link href={`/mangas/${manga.slug}`} className="px-6 py-3 bg-surface border border-border rounded-xl text-muted hover:text-white transition text-sm">
          Capítulos
        </Link>
        {next ? (
          <Link href={`${base}/${next.number}`} className="flex-1 py-3 bg-primary hover:bg-primary-hover rounded-xl text-center text-white transition text-sm">
            Capítulo {next.number} →
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </div>
  )
}
