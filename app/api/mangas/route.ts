import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where: search
          ? { title: { contains: search, mode: 'insensitive' } }
          : {},
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
          _count: { select: { chapters: true } },
        },
      }),
      prisma.manga.count({
        where: search
          ? { title: { contains: search, mode: 'insensitive' } }
          : {},
      }),
    ])

    return NextResponse.json({
      mangas,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar mangás' }, { status: 500 })
  }
}
