import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchMangaBySlug } from '@/lib/data';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { manga } = await fetchMangaBySlug(params.slug);
  if (!manga) return { title: 'Mangá não encontrado' };
  return {
    title: manga.title,
    description: manga.description ?? `Leia ${manga.title} no MangaFlow.`,
    openGraph: {
      title: manga.title,
      description: manga.description ?? undefined,
      images: manga.cover_url ? [manga.cover_url] : undefined
    }
  };
}

export default async function MangaDetailPage({ params }: PageProps) {
  const { manga, chapters } = await fetchMangaBySlug(params.slug);
  if (!manga) notFound();

  const sorted = [...chapters].sort((a, b) => b.number - a.number);
  const firstChapter = chapters.length > 0 ? [...chapters].sort((a, b) => a.number - b.number)[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-elevated border border-border">
          {manga.cover_url && (
            <Image
              src={manga.cover_url}
              alt={manga.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 260px"
              className="object-cover"
            />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">{manga.status}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold">{manga.title}</h1>
            {manga.author && (
              <p className="mt-1 text-sm text-muted">por {manga.author}</p>
            )}
          </div>

          {manga.genres?.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {manga.genres.map((g) => (
                <li
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full border border-border bg-surface text-white/80"
                >
                  {g}
                </li>
              ))}
            </ul>
          )}

          {manga.description && (
            <p className="text-sm leading-relaxed text-white/85">{manga.description}</p>
          )}

          {firstChapter && (
            <div className="pt-2 flex items-center gap-3">
              <Link
                href={`/manga/${manga.slug}/capitulo/${firstChapter.number}`}
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-background font-medium"
              >
                Começar do capítulo {firstChapter.number}
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold">Capítulos</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">Sem capítulos ainda.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
            {sorted.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/manga/${manga.slug}/capitulo/${c.number}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-elevated transition-colors"
                >
                  <span className="text-sm">
                    Cap. {c.number}
                    {c.title ? ` — ${c.title}` : ''}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
