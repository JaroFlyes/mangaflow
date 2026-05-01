import ContinueReading from '@/components/ContinueReading';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { fetchFeaturedMangas, fetchMangas } from '@/lib/data';

export const revalidate = 60;

export default async function Home() {
  const [featured, popular] = await Promise.all([
    fetchFeaturedMangas(3),
    fetchMangas(18)
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-12">
      <section className="space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">
            Biblioteca digital
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Leia seus mangás favoritos em um fluxo contínuo, rápido e noturno.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted">
            MangaFlow combina catálogo, histórico, favoritos e leitor responsivo
            em uma experiência feita para maratonar capítulos.
          </p>
        </div>
        <HeroSlider mangas={featured} />
      </section>

      <ContinueReading />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              Populares
            </p>
            <h2 className="mt-1 text-xl font-semibold">Mangás em alta</h2>
          </div>
          <a
            href="/catalogo"
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            Ver catálogo
          </a>
        </div>

        {popular.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center">
            <h3 className="font-semibold">Nenhuma obra publicada ainda</h3>
            <p className="mt-2 text-sm text-muted">
              Adicione registros no Supabase para preencher o hero, catálogo e leitor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popular.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
