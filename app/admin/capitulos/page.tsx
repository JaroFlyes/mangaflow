'use client';

import { useEffect, useState, useTransition } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
import type { Chapter, Manga } from '@/types';

export default function AdminCapitulosPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserSupabase();

  useEffect(() => {
    supabase.from('mangas').select('id, title, slug').order('title').then(({ data }) => setMangas(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedManga) return;
    supabase
      .from('chapters')
      .select('*')
      .eq('manga_id', selectedManga)
      .order('number')
      .then(({ data }) => setChapters(data ?? []));
  }, [selectedManga]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!selectedManga || !number) return setError('Selecione um mangá e informe o número.');
    startTransition(async () => {
      const { error: err } = await supabase.from('chapters').insert({
        manga_id: selectedManga,
        number: parseFloat(number),
        title: title || null
      });
      if (err) return setError(err.message);
      setNumber('');
      setTitle('');
      const { data } = await supabase.from('chapters').select('*').eq('manga_id', selectedManga).order('number');
      setChapters(data ?? []);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este capítulo e todas as suas páginas?')) return;
    await supabase.from('chapters').delete().eq('id', id);
    setChapters((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Capítulos</h1>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Mangá *</label>
          <select value={selectedManga} onChange={(e) => setSelectedManga(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent">
            <option value="">Selecione...</option>
            {mangas.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Número *</label>
            <input type="number" step="0.1" value={number} onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Título (opcional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-max rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
          {isPending ? 'Adicionando...' : 'Adicionar Capítulo'}
        </button>
      </form>

      {chapters.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Capítulos cadastrados</h2>
          {chapters.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
              <p className="text-sm text-white">Cap. {c.number}{c.title ? ` — ${c.title}` : ''}</p>
              <button onClick={() => handleDelete(c.id)} className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900">Deletar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
