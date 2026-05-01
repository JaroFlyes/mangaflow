'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserSupabase } from '@/lib/supabase';
import { fetchUserFavorites, fetchUserHistory } from '@/lib/data';
import type { Manga } from '@/types';

type Tab = 'favoritos' | 'historico';

type HistoryItem = {
  manga: Manga;
  chapter_id: string;
  page_number: number;
  progress: number;
  updated_at: string;
};

export default function BibliotecaPage() {
  const [tab, setTab] = useState<Tab>('favoritos');
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<(Manga & { favorited_at: string })[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetchUserFavorites(userId),
      fetchUserHistory(userId)
    ]).then(([favs, hist]) => {
      setFavorites(favs);
      setHistory(hist);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Minha Biblioteca</h1>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-white/10">
        {(['favoritos', 'historico'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-accent text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'favoritos' ? 'Favoritos' : 'Histórico'}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-zinc-400">Carregando...</p>
      )}

      {/* Favoritos */}
      {!loading && tab === 'favoritos' && (
        <>
          {favorites.length === 0 ? (
            <p className="text-zinc-400">Você ainda não favoritou nenhum mangá.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {favorites.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.slug}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
                    {manga.cover_url ? (
                      <Image
                        src={manga.cover_url}
                        alt={manga.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-800" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-2">{manga.title}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Histórico */}
      {!loading && tab === 'historico' && (
        <>
          {history.length === 0 ? (
            <p className="text-zinc-400">Nenhum mangá lido ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <Link
                  key={item.manga.id}
                  href={`/manga/${item.manga.slug}`}
                  className="flex items-center gap-4 rounded-xl bg-zinc-900 p-3 hover:bg-zinc-800 transition-colors"
                >
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md">
                    {item.manga.cover_url ? (
                      <Image
                        src={item.manga.cover_url}
                        alt={item.manga.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.manga.title}</p>
                    <p className="text-xs text-zinc-400">Progresso: {item.progress}%</p>
                    <div className="mt-1 h-1 w-full rounded-full bg-zinc-700">
                      <div
                        className="h-1 rounded-full bg-accent"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
