'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Chapter, Manga, Page } from '@/types';

type ReaderMode = 'vertical' | 'paged';

interface MangaReaderProps {
  manga: Manga;
  chapter: Chapter;
  pages: Page[];
  prevChapter?: Chapter | null;
  nextChapter?: Chapter | null;
}

export default function MangaReader({
  manga,
  chapter,
  pages,
  prevChapter,
  nextChapter
}: MangaReaderProps) {
  const [mode, setMode] = useState<ReaderMode>('vertical');
  const [pageIdx, setPageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastSavedRef = useRef<number>(0);

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.page_number - b.page_number),
    [pages]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const saveProgress = useCallback(
    async (pct: number, currentPage: number) => {
      if (!isSupabaseConfigured || !userId) return;
      const now = Date.now();
      if (now - lastSavedRef.current < 4000) return;
      lastSavedRef.current = now;
      const supabase = createBrowserSupabase();
      await supabase.from('reading_history').upsert(
        {
          user_id: userId,
          manga_id: manga.id,
          chapter_id: chapter.id,
          page_number: currentPage,
          progress: Math.round(pct)
        },
        { onConflict: 'user_id,manga_id' }
      );
    },
    [userId, manga.id, chapter.id]
  );

  useEffect(() => {
    if (mode !== 'vertical') return;
    const node = containerRef.current;
    if (!node) return;
    const onScroll = () => {
      const rect = node.getBoundingClientRect();
      const total = node.scrollHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(window.scrollY - (window.scrollY + rect.top - rect.height + total), 0),
        total
      );
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
      setProgress(pct);
      const approxPage = Math.min(
        sortedPages.length,
        Math.max(1, Math.round((pct / 100) * sortedPages.length))
      );
      saveProgress(pct, approxPage);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode, sortedPages.length, saveProgress]);

  useEffect(() => {
    if (mode !== 'paged') return;
    const total = sortedPages.length || 1;
    const pct = ((pageIdx + 1) / total) * 100;
    setProgress(pct);
    saveProgress(pct, pageIdx + 1);
  }, [mode, pageIdx, sortedPages.length, saveProgress]);

  useEffect(() => {
    if (mode !== 'paged') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPageIdx((i) => Math.min(i + 1, sortedPages.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPageIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, sortedPages.length]);

  if (sortedPages.length === 0) {
    return (
      <div className="text-center py-20 text-muted">
        <p>Este capítulo ainda não tem páginas publicadas.</p>
        <Link
          href={`/manga/${manga.slug}`}
          className="mt-4 inline-block text-accent hover:underline"
        >
          Voltar para {manga.title}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted uppercase tracking-wider">{manga.title}</p>
            <p className="text-sm font-medium truncate">
              Cap. {chapter.number}
              {chapter.title ? ` — ${chapter.title}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMode('vertical')}
                className={`px-3 py-1.5 text-xs ${
                  mode === 'vertical' ? 'bg-accent text-background' : 'text-white/80'
                }`}
              >
                Vertical
              </button>
              <button
                onClick={() => setMode('paged')}
                className={`px-3 py-1.5 text-xs ${
                  mode === 'paged' ? 'bg-accent text-background' : 'text-white/80'
                }`}
              >
                Página
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 h-1 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        {mode === 'paged' && (
          <p className="mt-1 text-xs text-muted text-right">
            {pageIdx + 1} / {sortedPages.length}
          </p>
        )}
      </div>

      <div ref={containerRef} className="mt-6">
        {mode === 'vertical' ? (
          <div className="flex flex-col items-center gap-2 max-w-3xl mx-auto">
            {sortedPages.map((p) => (
              <div key={p.id} className="relative w-full">
                <Image
                  src={p.image_url}
                  alt={`Página ${p.page_number}`}
                  width={1200}
                  height={1800}
                  className="w-full h-auto"
                  priority={p.page_number <= 2}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Image
                src={sortedPages[pageIdx].image_url}
                alt={`Página ${sortedPages[pageIdx].page_number}`}
                width={1200}
                height={1800}
                className="w-full h-auto"
                priority
              />
              <button
                aria-label="Página anterior"
                onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
                className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize"
              />
              <button
                aria-label="Próxima página"
                onClick={() =>
                  setPageIdx((i) => Math.min(sortedPages.length - 1, i + 1))
                }
                className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
                disabled={pageIdx === 0}
                className="px-4 py-2 rounded-lg border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                ← Anterior
              </button>
              <button
                onClick={() =>
                  setPageIdx((i) => Math.min(sortedPages.length - 1, i + 1))
                }
                disabled={pageIdx === sortedPages.length - 1}
                className="px-4 py-2 rounded-lg border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 max-w-3xl mx-auto flex items-center justify-between gap-3">
        {prevChapter ? (
          <Link
            href={`/manga/${manga.slug}/capitulo/${prevChapter.number}`}
            className="px-4 py-2 rounded-lg border border-border hover:border-accent text-sm"
          >
            ← Cap. {prevChapter.number}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/manga/${manga.slug}`}
          className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white"
        >
          Lista de capítulos
        </Link>
        {nextChapter ? (
          <Link
            href={`/manga/${manga.slug}/capitulo/${nextChapter.number}`}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-background font-medium text-sm"
          >
            Cap. {nextChapter.number} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
