import MangaCard from '@/components/MangaCard';
import { fetchMangas } from '@/lib/data';

export const revalidate = 60;

export const metadata = {
  title: 'Catálogo',
  description: 'Explore todos os mangás disponíveis no MangaFlow.'
};

export default async function CatalogPage() {
  const mangas = await fetchMangas(60);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="text-sm text-muted">
          {mangas.length} {mangas.length === 1 ? 'obra' : 'obras'} disponíveis.
        </p>
      </header>

      {mangas.length === 0 ? (
        <div className="py-20 text-center text-muted">
          <p>Nenhum mangá foi adicionado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
