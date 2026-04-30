import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { title, synopsis, coverUrl, status, genres } = body

    const manga = await prisma.manga.update({
      where: { slug: params.slug },
      data: {
        ...(title && { title }),
        ...(synopsis !== undefined && { synopsis }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(status && { status }),
        ...(genres && { genres }),
      },
    })

    return NextResponse.json(manga)
  } catch (error) {
    console.error('[PUT /api/mangas/[slug]]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    await prisma.manga.delete({ where: { slug: params.slug } })

    return NextResponse.json({ message: 'Mangá deletado com sucesso' })
  } catch (error) {
    console.error('[DELETE /api/mangas/[slug]]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
