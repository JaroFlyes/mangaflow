import Link from 'next/link'
import Image from 'next/image'

type Props = {
  title: string
  slug: string
  coverUrl: string
  status: string
}

export default function MangaCard({ title, slug, coverUrl, status }: Props) {
  return (
    <Link href={`/mangas/${slug}`} className="group block">
      <div className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary transition">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover group-hover:opacity-90 transition"
          />
        </div>
        <div className="p-3">
          <h3 className="text-white font-medium text-sm line-clamp-2">{title}</h3>
          <span className="text-muted text-xs mt-1 block">{status}</span>
        </div>
      </div>
    </Link>
  )
}
