import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReaderControls from '@/components/ReaderControls'
import Image from 'next/image'

export async function generateMetadata({
  params,
}: {
  params: { slug: string; chapterNumber: string }
}) {
  const manga = await prisma.manga.findUnique({ where: { slug: params.slug } })
  if (!manga) return {}
  return {
    title: `${manga.title} — Capítulo ${params.chapterNumber} | MangaFlow`,
  }
}

export default async function ReaderPage({
  params,
}: {
  params: { slug: string; chapterNumber: string }
}) {
  const manga = await prisma.manga.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, slug: true },
  })

  if (!manga) notFound()

  const chapterNumber = parseFloat(params.chapterNumber)

  const chapter = await prisma.chapter.findFirst({
    where: { mangaId: manga.id, number: chapterNumber },
    include: { pages: { orderBy: { number: 'asc' } } },
  })

  if (!chapter) notFound()

  const [prevChapter, nextChapter] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-black">
      {/* Header do leitor */}
      <div className="sticky top-0 z-50 bg-black/90 border-b border-border px-4 py-3 flex items-center justify-between">
        <a href={`/mangas/${manga.slug}`} className="text-muted hover:text-white text-sm transition">
          ← {manga.title}
        </a>
        <span className="text-white text-sm font-medium">
          Capítulo {chapter.number}{chapter.title ? ` — ${chapter.title}` : ''}
        </span>
        <span className="text-muted text-sm">{chapter.pages.length} páginas</span>
      </div>

      {/* Páginas */}
      <div className="reader-container max-w-3xl mx-auto py-4 px-2">
        {chapter.pages.map((page) => (
          <div key={page.id} className="mb-1">
            <Image
              src={page.imageUrl}
              alt={`Página ${page.number}`}
              width={800}
              height={1200}
              className="w-full h-auto"
              priority={page.number <= 3}
            />
          </div>
        ))}
      </div>

      {/* Controles */}
      <ReaderControls
        mangaSlug={manga.slug}
        currentChapter={chapter.number}
        prevChapter={prevChapter?.number}
        nextChapter={nextChapter?.number}
      />
    </main>
  )
}
