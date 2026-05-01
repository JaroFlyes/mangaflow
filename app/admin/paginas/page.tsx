'use client';

import { useEffect, useState, useTransition } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
import type { Chapter, Manga, Page } from '@/types';

export default function AdminPaginasPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserSupabase();

  useEffect(() => {
    supabase.from('mangas').select('id, title, slug').order('title').then(({ data }) => setMangas(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedManga) return;
    setSelectedChapter('');
    setPages([]);
    supabase.from('chapters').select('*').eq('manga_id', selectedManga).order('number').then(({ data }) => setChapters(data ?? []));
  }, [selectedManga]);

  useEffect(() => {
    if (!selectedChapter) return;
    supabase.from('pages').select('*').eq('chapter_id', selectedChapter).order('page_number').then(({ data }) => setPages(data ?? []));
  }, [selectedChapter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!selectedChapter || !imageUrl || !pageNumber) return setError('Preencha todos os campos.');
    startTransition(async () => {
      const { error: err } = await supabase.from('pages').insert({
        chapter_id: selectedChapter,
        page_number: parseInt(pageNumber),
        image_url: imageUrl
      });
      if (err) return setError(err.message);
      setImageUrl('');
      setPageNumber('');
      const { data } = await supabase.from('pages').select('*').eq('chapter_id', selectedChapter).order('page_number');
      setPages(data ?? []);
    });
  }

  async function handleDelete(id: string) {
    await supabase.from('pages').delete().eq('id', id);
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Páginas</h1>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Mangá *</label>
            <select value={selectedManga} onChange={(e) => setSelectedManga(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent">
              <option value="">Selecione...</option>
              {mangas.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Capítulo *</label>
            <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent">
              <option value="">Selecione...</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>Cap. {c.number}{c.title ? ` — ${c.title}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Nº da Página *</label>
            <input type="number" min="1" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">URL da Imagem *</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..."
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-max rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
          {isPending ? 'Adicionando...' : 'Adicionar Página'}
        </button>
      </form>

      {pages.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Páginas cadastradas ({pages.length})</h2>
          {pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
              <div>
                <p className="text-sm text-white">Página {p.page_number}</p>
                <p className="max-w-xs truncate text-xs text-zinc-500">{p.image_url}</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900">Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
