'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ContinueReadingItem } from '@/types';

export default function ContinueReading() {
  const [items, setItems] = useState<ContinueReadingItem[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setAuthed(false);
        setItems([]);
        return;
      }
      const supabase = createBrowserSupabase();
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        if (!cancelled) {
          setAuthed(false);
          setItems([]);
        }
        return;
      }
      if (!cancelled) setAuthed(true);

      const { data, error } = await supabase
        .from('reading_history')
        .select(
          'id, user_id, manga_id, chapter_id, page_number, progress, updated_at, manga:mangas(*), chapter:chapters(*)'
        )
        .eq('user_id', userRes.user.id)
        .order('updated_at', { ascending: false })
        .limit(8);

      if (!cancelled) {
        if (error || !data) {
          setItems([]);
        } else {
          setItems(data as unknown as ContinueReadingItem[]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authed === false) return null;
  if (items === null) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Continuar lendo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-surface border border-border animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Continuar lendo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/manga/${item.manga.slug}/capitulo/${item.chapter.number}`}
            className="flex gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent transition-colors"
          >
            <div className="relative w-16 h-24 shrink-0 rounded-md overflow-hidden bg-elevated">
              {item.manga.cover_url && (
                <Image
                  src={item.manga.cover_url}
                  alt={item.manga.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex flex-col justify-between flex-1">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.manga.title}</p>
                <p className="text-xs text-muted truncate">
                  Cap. {item.chapter.number} · pág. {item.page_number}
                </p>
              </div>
              <div className="h-1 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.min(100, item.progress ?? 0)}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
