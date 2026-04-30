import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — busca histórico do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const history = await prisma.readingHistory.findMany({
      where: { userId: session.user.id },
      include: {
        chapter: {
          select: {
            number: true,
            title: true,
            manga: {
              select: {
                title: true,
                slug: true,
                coverUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('[GET /api/historico]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST — salva ou atualiza progresso de leitura
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { chapterId, lastPage } = await req.json()
    if (!chapterId || !lastPage) {
      return NextResponse.json({ error: 'chapterId e lastPage obrigatórios' }, { status: 400 })
    }

    const history = await prisma.readingHistory.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: { lastPage },
      create: {
        userId: session.user.id,
        chapterId,
        lastPage,
      },
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('[POST /api/historico]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
