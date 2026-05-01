'use client';

import { useEffect, useState, useTransition } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
import type { Manga, MangaStatus } from '@/types';

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Cyberpunk'];

const empty = {
  title: '',
  slug: '',
  description: '',
  cover_url: '',
  author: '',
  status: 'ongoing' as MangaStatus,
  genres: [] as string[]
};

export default function AdminMangasPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const supabase = createBrowserSupabase();

  async function load() {
    const { data } = await supabase.from('mangas').select('*').order('created_at', { ascending: false });
    setMangas(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function slugify(text: string) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function handleTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: editId ? f.slug : slugify(title) }));
  }

  function toggleGenre(g: string) {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title || !form.slug) return setError('Título e slug são obrigatórios.');
    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        cover_url: form.cover_url || null,
        author: form.author || null,
        status: form.status,
        genres: form.genres
      };
      const { error: err } = editId
        ? await supabase.from('mangas').update(payload).eq('id', editId)
        : await supabase.from('mangas').insert(payload);
      if (err) return setError(err.message);
      setForm(empty);
      setEditId(null);
      load();
    });
  }

  function startEdit(m: Manga) {
    setEditId(m.id);
    setForm({ title: m.title, slug: m.slug, description: m.description ?? '', cover_url: m.cover_url ?? '', author: m.author ?? '', status: m.status, genres: m.genres });
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este mangá e todos os seus capítulos?')) return;
    await supabase.from('mangas').delete().eq('id', id);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">{editId ? 'Editar Mangá' : 'Novo Mangá'}</h1>

      <form onSubmit={handleSubmit} className="mb-10 grid gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Título *</label>
            <input value={form.title} onChange={(e) => handleTitle(e.target.value)} className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Slug *</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Autor</label>
            <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MangaStatus }))} className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent">
              <option value="ongoing">Em andamento</option>
              <option value="completed">Completo</option>
              <option value="hiatus">Hiato</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-zinc-400">URL da Capa</label>
            <input value={form.cover_url} onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-zinc-400">Descrição</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-400">Gêneros</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  form.genres.includes(g) ? 'bg-accent text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
            {isPending ? 'Salvando...' : editId ? 'Atualizar' : 'Criar Mangá'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setForm(empty); setEditId(null); }}
              className="rounded-lg bg-zinc-700 px-5 py-2 text-sm text-white">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2 className="mb-4 text-lg font-semibold text-white">Obras cadastradas</h2>
      <div className="flex flex-col gap-2">
        {mangas.length === 0 && <p className="text-sm text-zinc-400">Nenhum mangá cadastrado ainda.</p>}
        {mangas.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{m.title}</p>
              <p className="text-xs text-zinc-500">{m.slug} · {m.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(m)} className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-white hover:bg-zinc-600">Editar</button>
              <button onClick={() => handleDelete(m.id)} className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900">Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
