import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            status: true,
            genres: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(favorites.map((f) => f.manga))
  } catch (error) {
    console.error('[GET /api/favoritos]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { mangaId } = await req.json()
    if (!mangaId) {
      return NextResponse.json({ error: 'mangaId obrigatório' }, { status: 400 })
    }

    const favorite = await prisma.favorite.create({
      data: { userId: session.user.id, mangaId },
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Já está nos favoritos' }, { status: 409 })
    }
    console.error('[POST /api/favoritos]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { mangaId } = await req.json()

    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, mangaId },
    })

    return NextResponse.json({ message: 'Removido dos favoritos' })
  } catch (error) {
    console.error('[DELETE /api/favoritos]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
