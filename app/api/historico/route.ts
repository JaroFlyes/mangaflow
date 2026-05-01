import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { chapterId, lastPage } = await req.json()
  if (!chapterId) return NextResponse.json({ error: 'chapterId obrigatório' }, { status: 400 })

  await prisma.readingHistory.upsert({
    where: { userId_chapterId: { userId: session.user.id, chapterId } },
    update: { lastPage, updatedAt: new Date() },
    create: { userId: session.user.id, chapterId, lastPage },
  })

  return NextResponse.json({ ok: true })
}
