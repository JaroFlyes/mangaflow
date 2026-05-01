'use client';

import { useMemo, useState } from 'react';
import MangaCard from '@/components/MangaCard';
import type { MangaWithLastChapter } from '@/types';

interface CatalogFiltersProps {
  mangas: MangaWithLastChapter[];
}

export default function CatalogFilters({ mangas }: CatalogFiltersProps) {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [status, setStatus] = useState('all');

  const genres = useMemo(() => {
    const all = mangas.flatMap((manga) => manga.genres ?? []);
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [mangas]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return mangas.filter((manga) => {
      const matchesQuery =
        !term ||
        manga.title.toLowerCase().includes(term) ||
        manga.author?.toLowerCase().includes(term) ||
        manga.description?.toLowerCase().includes(term);
      const matchesGenre = genre === 'all' || manga.genres?.includes(genre);
      const matchesStatus = status === 'all' || manga.status === status;
      return matchesQuery && matchesGenre && matchesStatus;
    });
  }, [genre, mangas, query, status]);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[1fr_180px_180px]">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted">Busca</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Título, autor ou descrição"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted">Gênero</span>
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="all">Todos</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="all">Todos</option>
            <option value="ongoing">Em curso</option>
            <option value="completed">Completo</option>
            <option value="hiatus">Hiato</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? 'obra encontrada' : 'obras encontradas'}.
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-14 text-center">
          <h2 className="font-semibold">Nada encontrado</h2>
          <p className="mt-2 text-sm text-muted">
            Ajuste a busca ou remova filtros para ver mais obras.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </section>
  );
}
