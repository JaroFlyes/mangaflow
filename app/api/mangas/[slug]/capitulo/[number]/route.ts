import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; number: string } }
) {
  try {
    const manga = await prisma.manga.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true, slug: true },
    })

    if (!manga) {
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 })
    }

    const chapterNumber = parseFloat(params.number)

    const chapter = await prisma.chapter.findFirst({
      where: { mangaId: manga.id, number: chapterNumber },
      include: { pages: { orderBy: { number: 'asc' } } },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }

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

    return NextResponse.json({
      manga,
      chapter,
      prevChapter: prevChapter?.number ?? null,
      nextChapter: nextChapter?.number ?? null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar capítulo' }, { status: 500 })
  }
}
