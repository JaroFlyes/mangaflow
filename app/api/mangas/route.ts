import { NextRequest, NextResponse } from 'next/server'
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
