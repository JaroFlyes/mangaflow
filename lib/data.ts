import { createAnonSupabase, isSupabaseConfigured } from './supabase';
import { MOCK_CHAPTERS, MOCK_MANGAS } from './mock-data';
import type { Chapter, Manga, MangaWithLastChapter, Page } from '@/types';

export async function fetchMangas(limit = 24): Promise<MangaWithLastChapter[]> {
  if (!isSupabaseConfigured) return mockMangasWithChapters();
  try {
    const supabase = createAnonSupabase();
    const { data, error } = await supabase
      .from('mangas')
      .select('*, chapters(id, manga_id, number, title, created_at)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data || data.length === 0) return mockMangasWithChapters();
    return data.map((m) => {
      const rawChapters = (m as unknown as { chapters?: Chapter[] }).chapters ?? [];
      const last = rawChapters
        .slice()
        .sort((a, b) => b.number - a.number)[0] ?? null;
      const { chapters: _omit, ...manga } = m as unknown as Manga & {
        chapters?: Chapter[];
      };
      return { ...manga, last_chapter: last };
    });
  } catch {
    return mockMangasWithChapters();
  }
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
  try {
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
  } catch {
    return mockMangaBySlug(slug);
  }
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
  if (!manga) {
    return { manga: null, chapter: null, pages: [], prevChapter: null, nextChapter: null };
  }
  const sorted = [...chapters].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex((c) => Number(c.number) === Number(number));
  const chapter = idx >= 0 ? sorted[idx] : null;
  const prevChapter = idx > 0 ? sorted[idx - 1] : null;
  const nextChapter = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  if (!chapter) {
    return { manga, chapter: null, pages: [], prevChapter, nextChapter };
  }

  if (!isSupabaseConfigured || chapter.id.startsWith(manga.id + '-ch-')) {
    return { manga, chapter, pages: mockPages(chapter.id), prevChapter, nextChapter };
  }

  try {
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
  } catch {
    return { manga, chapter, pages: mockPages(chapter.id), prevChapter, nextChapter };
  }
}

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
