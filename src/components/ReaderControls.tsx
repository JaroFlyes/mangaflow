type Props = {
  mangaSlug: string
  currentChapter: number
  prevChapter?: number
  nextChapter?: number
}

export default function ReaderControls({
  mangaSlug,
  currentChapter,
  prevChapter,
  nextChapter,
}: Props) {
  return (
    <div className="flex items-center justify-between py-4 px-6 bg-surface border-t border-border sticky bottom-0">
      <a
        href={prevChapter ? `/mangas/${mangaSlug}/capitulo/${prevChapter}` : '#'}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          prevChapter ? 'bg-primary hover:bg-primary-hover text-white' : 'bg-border text-muted cursor-not-allowed'
        }`}
      >
        ← Anterior
      </a>
      <span className="text-muted text-sm">Capítulo {currentChapter}</span>
      <a
        href={nextChapter ? `/mangas/${mangaSlug}/capitulo/${nextChapter}` : '#'}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          nextChapter ? 'bg-primary hover:bg-primary-hover text-white' : 'bg-border text-muted cursor-not-allowed'
        }`}
      >
        Próximo →
      </a>
    </div>
  )
}
