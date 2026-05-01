import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import ContinueReading from '@/components/ContinueReading';
import { fetchMangas, fetchFeaturedMangas } from '@/lib/data';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, mangas] = await Promise.all([
    fetchFeaturedMangas(3),
    fetchMangas(18)
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-12">
      <HeroSlider mangas={featured} />

      <ContinueReading />

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Lançamentos recentes</h2>
          <a href="/catalogo" className="text-sm text-accent hover:underline">
            ver todos
          </a>
        </div>
        {mangas.length === 0 ? (
          <p className="text-sm text-muted">Nenhum mangá disponível ainda.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
