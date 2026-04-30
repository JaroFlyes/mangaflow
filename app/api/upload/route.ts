import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: process.env.STORAGE_REGION || 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { filename, contentType } = body

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename e contentType são obrigatórios' }, { status: 400 })
    }

    const ext = filename.split('.').pop()
    const key = `pages/${randomUUID()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${key}`

    return NextResponse.json({ uploadUrl: signedUrl, publicUrl })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
