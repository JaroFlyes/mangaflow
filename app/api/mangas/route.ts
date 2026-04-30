import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q') || ''
    const genre = searchParams.get('genre') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }
    if (genre) {
      where.genres = { has: genre }
    }
    if (status) {
      where.status = status
    }

    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          coverUrl: true,
          status: true,
          genres: true,
          updatedAt: true,
          _count: { select: { chapters: true } },
        },
      }),
      prisma.manga.count({ where }),
    ])

    return NextResponse.json({
      mangas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/mangas]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { title, slug, synopsis, coverUrl, status, genres } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Título e slug são obrigatórios' }, { status: 400 })
    }

    const existing = await prisma.manga.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 409 })
    }

    const manga = await prisma.manga.create({
      data: {
        title,
        slug,
        synopsis: synopsis || null,
        coverUrl: coverUrl || null,
        status: status || 'ONGOING',
        genres: genres || [],
      },
    })

    return NextResponse.json(manga, { status: 201 })
  } catch (error) {
    console.error('[POST /api/mangas]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
