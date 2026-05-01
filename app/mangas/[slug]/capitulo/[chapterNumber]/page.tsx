import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReaderClient from './ReaderClient'

export async function generateMetadata({ params }: { params: { slug: string; chapterNumber: string } }) {
  const manga = await prisma.manga.findUnique({ where: { slug: params.slug }, select: { title: true } })
  if (!manga) return {}
  return {
    title: `${manga.title} — Cap. ${params.chapterNumber} | MangaFlow`,
    description: `Leia ${manga.title} cap\u00edtulo ${params.chapterNumber} gr\u00e1tis no MangaFlow.`,
  }
}

export default async function ReaderPage({
  params,
}: {
  params: { slug: string; chapterNumber: string }
}) {
  const chapterNumber = parseFloat(params.chapterNumber)
  const session = await getServerSession(authOptions)

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

  // Salvar histórico de leitura se usuário logado
  if (session?.user?.id) {
    await prisma.readingHistory.upsert({
      where: { userId_chapterId: { userId: session.user.id, chapterId: chapter.id } },
      update: { lastPage: 1, updatedAt: new Date() },
      create: { userId: session.user.id, chapterId: chapter.id, lastPage: 1 },
    }).catch(() => {}) // silencia erros para não quebrar o leitor
  }

  const base = `/mangas/${manga.slug}/capitulo`

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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

      <ReaderClient
        pages={chapter.pages}
        chapterId={chapter.id}
        userId={session?.user?.id ?? null}
      />

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
