import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const manga = await prisma.manga.findUnique({ where: { slug: params.slug } })
    if (!manga) {
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const { number, title, pages } = body

    if (!number) {
      return NextResponse.json({ error: 'Número do capítulo é obrigatório' }, { status: 400 })
    }

    const chapter = await prisma.chapter.create({
      data: {
        mangaId: manga.id,
        number: parseFloat(number),
        title: title || null,
        pages: pages?.length
          ? {
              createMany: {
                data: pages.map((imageUrl: string, index: number) => ({
                  number: index + 1,
                  imageUrl,
                })),
              },
            }
          : undefined,
      },
      include: { pages: true },
    })

    return NextResponse.json(chapter, { status: 201 })
  } catch (error) {
    console.error('[POST /api/mangas/[slug]/capitulos]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
