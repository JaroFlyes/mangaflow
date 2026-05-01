'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { MangaWithLastChapter } from '@/types';

interface MangaCardProps {
  manga: MangaWithLastChapter;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [errored, setErrored] = useState(false);
  const cover = !errored && manga.cover_url ? manga.cover_url : null;

  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="group block rounded-xl overflow-hidden bg-surface border border-border hover:border-accent transition-all duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] bg-elevated">
        {cover ? (
          <Image
            src={cover}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted text-xs">
            sem capa
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent h-20 pointer-events-none" />
        {manga.status && (
          <span
            className={`absolute top-2 right-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md ${
              manga.status === 'ongoing'
                ? 'bg-accent/90 text-background'
                : manga.status === 'completed'
                ? 'bg-emerald-500/80 text-background'
                : 'bg-yellow-500/80 text-background'
            }`}
          >
            {manga.status === 'ongoing'
              ? 'em curso'
              : manga.status === 'completed'
              ? 'completo'
              : 'hiato'}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-accent transition-colors">
          {manga.title}
        </h3>
        {manga.last_chapter ? (
          <p className="mt-1 text-xs text-muted">
            Cap. {manga.last_chapter.number}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted">Sem capítulos</p>
        )}
      </div>
    </Link>
  );
}
