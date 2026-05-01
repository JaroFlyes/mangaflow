import { createAnonSupabase, isSupabaseConfigured } from './supabase';
import { MOCK_CHAPTERS, MOCK_MANGAS } from './mock-data';
import type { Chapter, Manga, MangaWithLastChapter, Page } from '@/types';

export async function fetchMangas(limit = 24): Promise<MangaWithLastChapter[]> {
  if (!isSupabaseConfigured) return mockMangasWithChapters();
  const supabase = createAnonSupabase();
  const { data, error } = await supabase
    .from('mangas')
    .select('*, chapters(id, manga_id, number, title, created_at)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data || data.length === 0) return mockMangasWithChapters();
  return data.map((m) => {
    const rawChapters = (m as unknown as { chapters?: Chapter[] }).chapters ?? [];
    const last = rawChapters.slice().sort((a, b) => b.number - a.number)[0] ?? null;
    const manga = m as unknown as Manga & { chapters?: Chapter[] };
    return {
      id: manga.id,
      slug: manga.slug,
      title: manga.title,
      description: manga.description,
      cover_url: manga.cover_url,
      status: manga.status,
      genres: manga.genres ?? [],
      author: manga.author,
      created_at: manga.created_at,
      last_chapter: last
    };
  });
}

export async function fetchFeaturedMangas(limit = 3): Promise<Manga[]> {
  const all = await fetchMangas(limit * 2);
  return all.slice(0, limit);
}

export async function fetchMangaBySlug(slug: string): Promise<{
  manga: Manga | null;
  chapters: Chapter[];
}> {
  if (!isSupabaseConfigured) return mockMangaBySlug(slug);
  const supabase = createAnonSupabase();
  const { data: manga, error } = await supabase
    .from('mangas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !manga) return mockMangaBySlug(slug);
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('manga_id', manga.id)
    .order('number', { ascending: true });
  return { manga, chapters: chapters ?? [] };
}

export async function fetchChapterByNumber(
  slug: string,
  number: number
): Promise<{
  manga: Manga | null;
  chapter: Chapter | null;
  pages: Page[];
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}> {
  const { manga, chapters } = await fetchMangaBySlug(slug);
  if (!manga) return { manga: null, chapter: null, pages: [], prevChapter: null, nextChapter: null };
  const sorted = [...chapters].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex((c) => Number(c.number) === Number(number));
  const chapter = idx >= 0 ? sorted[idx] : null;
  const prevChapter = idx > 0 ? sorted[idx - 1] : null;
  const nextChapter = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
  if (!chapter) return { manga, chapter: null, pages: [], prevChapter, nextChapter };
  if (!isSupabaseConfigured || chapter.id.startsWith(manga.id + '-ch-')) {
    return { manga, chapter, pages: mockPages(chapter.id), prevChapter, nextChapter };
  }
  const supabase = createAnonSupabase();
  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('chapter_id', chapter.id)
    .order('page_number', { ascending: true });
  return {
    manga,
    chapter,
    pages: pages && pages.length > 0 ? pages : mockPages(chapter.id),
    prevChapter,
    nextChapter
  };
}

// ── User data functions ────────────────────────────────────────────────────

export async function fetchUserFavorites(userId: string): Promise<(Manga & { favorited_at: string })[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAnonSupabase();
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, mangas(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data
    .filter((row) => row.mangas)
    .map((row) => ({
      ...(row.mangas as unknown as Manga),
      favorited_at: row.created_at
    }));
}

export async function fetchUserHistory(userId: string): Promise<{
  manga: Manga;
  chapter_id: string;
  page_number: number;
  progress: number;
  updated_at: string;
}[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAnonSupabase();
  const { data, error } = await supabase
    .from('reading_history')
    .select('chapter_id, page_number, progress, updated_at, mangas(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data
    .filter((row) => row.mangas)
    .map((row) => ({
      manga: row.mangas as unknown as Manga,
      chapter_id: row.chapter_id,
      page_number: row.page_number,
      progress: row.progress,
      updated_at: row.updated_at
    }));
}

export async function upsertReadingProgress(
  userId: string,
  mangaId: string,
  chapterId: string,
  pageNumber: number,
  progress: number
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = createAnonSupabase();
  await supabase.from('reading_history').upsert(
    { user_id: userId, manga_id: mangaId, chapter_id: chapterId, page_number: pageNumber, progress },
    { onConflict: 'user_id,manga_id' }
  );
}

export async function toggleFavorite(userId: string, mangaId: string): Promise<'added' | 'removed'> {
  if (!isSupabaseConfigured) return 'added';
  const supabase = createAnonSupabase();
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('manga_id', mangaId)
    .maybeSingle();
  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return 'removed';
  }
  await supabase.from('favorites').insert({ user_id: userId, manga_id: mangaId });
  return 'added';
}

// ── Mock helpers ──────────────────────────────────────────────────────────

function mockMangasWithChapters(): MangaWithLastChapter[] {
  return MOCK_MANGAS.map((m) => {
    const chapters = MOCK_CHAPTERS[m.slug] ?? [];
    const last = chapters[chapters.length - 1] ?? null;
    return { ...m, last_chapter: last };
  });
}

function mockMangaBySlug(slug: string) {
  const manga = MOCK_MANGAS.find((m) => m.slug === slug) ?? null;
  const chapters = manga ? MOCK_CHAPTERS[slug] ?? [] : [];
  return { manga, chapters };
}

function mockPages(chapterId: string): Page[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `${chapterId}-p${i + 1}`,
    chapter_id: chapterId,
    page_number: i + 1,
    image_url: `https://picsum.photos/seed/${chapterId}-${i + 1}/900/1300`
  }));
}
