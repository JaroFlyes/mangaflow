import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  ONGOING: 'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-blue-500/20 text-blue-400',
  HIATUS: 'bg-yellow-500/20 text-yellow-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  ONGOING: 'Em andamento',
  COMPLETED: 'Completo',
  HIATUS: 'Hiato',
  CANCELLED: 'Cancelado',
}

interface Props {
  title: string
  slug: string
  coverUrl: string
  status: string
  chapterCount?: number
}

export default function MangaCard({ title, slug, coverUrl, status, chapterCount }: Props) {
  return (
    <Link href={`/mangas/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-surface">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-cover.jpg' }}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge de status */}
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-surface text-muted'}`}>
          {STATUS_LABEL[status] ?? status}
        </span>

        {/* Título no hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{title}</p>
          {chapterCount !== undefined && (
            <p className="text-muted text-[10px] mt-1">{chapterCount} capítulos</p>
          )}
        </div>
      </div>

      {/* Título abaixo */}
      <p className="mt-2 text-sm text-muted group-hover:text-white transition-colors duration-200 line-clamp-2 leading-tight">
        {title}
      </p>
    </Link>
  )
}
