import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; number: string } }
) {
  try {
    const chapterNumber = parseFloat(params.number)

    const manga = await prisma.manga.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true, slug: true },
    })

    if (!manga) {
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 })
    }

    const chapter = await prisma.chapter.findFirst({
      where: { mangaId: manga.id, number: chapterNumber },
      include: {
        pages: {
          orderBy: { number: 'asc' },
          select: { id: true, number: true, imageUrl: true },
        },
      },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 })
    }

    // Capítulos anterior e próximo para navegação
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

    return NextResponse.json({
      manga,
      chapter,
      navigation: {
        prev: prev?.number ?? null,
        next: next?.number ?? null,
      },
    })
  } catch (error) {
    console.error('[GET /api/mangas/[slug]/capitulos/[number]]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
