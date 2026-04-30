import Link from 'next/link'

type Chapter = {
  number: number
  title?: string
  createdAt: string
}

type Props = {
  mangaSlug: string
  chapters: Chapter[]
}

export default function ChapterList({ mangaSlug, chapters }: Props) {
  return (
    <div className="flex flex-col gap-1 mt-4">
      {chapters.map((chapter) => (
        <Link
          key={chapter.number}
          href={`/mangas/${mangaSlug}/capitulo/${chapter.number}`}
          className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg hover:border-primary transition"
        >
          <span className="text-white text-sm">
            Capítulo {chapter.number}{chapter.title ? ` — ${chapter.title}` : ''}
          </span>
          <span className="text-muted text-xs">{chapter.createdAt}</span>
        </Link>
      ))}
    </div>
  )
}
