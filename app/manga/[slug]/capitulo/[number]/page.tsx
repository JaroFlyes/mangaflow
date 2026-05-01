import { notFound } from 'next/navigation';
import MangaReader from '@/components/MangaReader';
import { fetchChapterByNumber } from '@/lib/data';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string; number: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const num = Number(params.number);
  const { manga, chapter } = await fetchChapterByNumber(params.slug, num);
  if (!manga || !chapter) return { title: 'Capítulo não encontrado' };
  return {
    title: `${manga.title} — Cap. ${chapter.number}`,
    description: `Leia ${manga.title} capítulo ${chapter.number} no MangaFlow.`
  };
}

export default async function ReaderPage({ params }: PageProps) {
  const num = Number(params.number);
  if (Number.isNaN(num)) notFound();

  const { manga, chapter, pages, prevChapter, nextChapter } =
    await fetchChapterByNumber(params.slug, num);

  if (!manga || !chapter) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
      <MangaReader
        manga={manga}
        chapter={chapter}
        pages={pages}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />
    </div>
  );
}
