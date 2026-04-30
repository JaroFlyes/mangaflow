import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const manga = await prisma.manga.findUnique({
      where: { slug: params.slug },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            title: true,
            createdAt: true,
            _count: { select: { pages: true } },
          },
        },
      },
    })

    if (!manga) {
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 })
    }

    return NextResponse.json(manga)
  } catch (error) {
    console.error('[GET /api/mangas/[slug]]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
