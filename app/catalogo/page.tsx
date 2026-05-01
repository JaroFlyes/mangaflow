import CatalogFilters from '@/components/CatalogFilters';
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

      <CatalogFilters mangas={mangas} />
    </div>
  );
}
