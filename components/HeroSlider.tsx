'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Manga } from '@/types';

interface HeroSliderProps {
  mangas: Manga[];
}

const AUTOPLAY_MS = 5000;

export default function HeroSlider({ mangas }: HeroSliderProps) {
  const slides = mangas.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      const wrapped = (next + slides.length) % slides.length;
      setIndex(wrapped);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(index + (dx < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Obras em destaque"
    >
      <div className="relative h-[420px] sm:h-[460px] md:h-[520px]">
        {slides.map((m, i) => {
          const active = i === index;
          return (
            <div
              key={m.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden={!active}
            >
              {m.cover_url ? (
                <Image
                  src={m.cover_url}
                  alt={m.title}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-elevated" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

              <div className="relative h-full flex items-end sm:items-center">
                <div className="px-6 sm:px-10 md:px-14 max-w-2xl pb-10 sm:pb-0 animate-slide-up">
                  <span className="inline-block text-xs uppercase tracking-widest text-accent mb-3">
                    Em destaque
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">
                    {m.title}
                  </h2>
                  {m.description && (
                    <p className="text-sm sm:text-base text-white/80 line-clamp-3 mb-5">
                      {m.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/manga/${m.slug}`}
                      className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-background font-medium transition-colors"
                    >
                      Ler agora
                    </Link>
                    <Link
                      href={`/manga/${m.slug}`}
                      className="px-5 py-2.5 rounded-lg border border-border hover:border-accent text-white transition-colors"
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
