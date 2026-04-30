'use client'

import { useState, useEffect } from 'react'

type MangaStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED'

interface Manga {
  id: string
  title: string
  slug: string
  status: MangaStatus
  genres: string[]
  coverUrl: string | null
  _count: { chapters: number }
  updatedAt: string
}

const STATUS_LABELS: Record<MangaStatus, string> = {
  ONGOING: 'Em andamento',
  COMPLETED: 'Completo',
  HIATUS: 'Hiato',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<MangaStatus, string> = {
  ONGOING: 'text-green-400 bg-green-400/10',
  COMPLETED: 'text-blue-400 bg-blue-400/10',
  HIATUS: 'text-yellow-400 bg-yellow-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
}

export default function AdminMangasPage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Manga | null>(null)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    synopsis: '',
    coverUrl: '',
    status: 'ONGOING' as MangaStatus,
    genres: '',
  })

  async function fetchMangas() {
    setLoading(true)
    const res = await fetch(`/api/mangas?q=${search}&limit=50`)
    const data = await res.json()
    setMangas(data.mangas || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMangas()
  }, [search])

  function openNew() {
    setEditTarget(null)
    setForm({ title: '', slug: '', synopsis: '', coverUrl: '', status: 'ONGOING', genres: '' })
    setShowForm(true)
  }

  function openEdit(manga: Manga) {
    setEditTarget(manga)
    setForm({
      title: manga.title,
      slug: manga.slug,
      synopsis: '',
      coverUrl: manga.coverUrl || '',
      status: manga.status,
      genres: manga.genres.join(', '),
    })
    setShowForm(true)
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: form.title,
      slug: form.slug,
      synopsis: form.synopsis || null,
      coverUrl: form.coverUrl || null,
      status: form.status,
      genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean),
    }

    if (editTarget) {
      await fetch(`/api/mangas/${editTarget.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/mangas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setShowForm(false)
    fetchMangas()
  }

  async function handleDelete(slug: string) {
    if (!confirm('Tem certeza que deseja deletar este mangá e todos os seus capítulos?')) return
    await fetch(`/api/mangas/${slug}`, { method: 'DELETE' })
    fetchMangas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gerenciar Mangás</h1>
        <button
          onClick={openNew}
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Mangá
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por título..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-lg font-bold text-white">
              {editTarget ? 'Editar Mangá' : 'Novo Mangá'}
            </h2>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Título *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editTarget ? form.slug : autoSlug(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Sinopse</label>
              <textarea
                value={form.synopsis}
                onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">URL da Capa</label>
              <input
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as MangaStatus })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Gêneros (vírgula)</label>
                <input
                  value={form.genres}
                  onChange={(e) => setForm({ ...form, genres: e.target.value })}
                  placeholder="Ação, Aventura"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {editTarget ? 'Salvar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Carregando...</p>
      ) : mangas.length === 0 ? (
        <p className="text-zinc-500 text-sm">Nenhum mangá cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-left border-b border-zinc-800">
                <th className="pb-3 pr-4">Capa</th>
                <th className="pb-3 pr-4">Título</th>
                <th className="pb-3 pr-4">Slug</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Capítulos</th>
                <th className="pb-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {mangas.map((manga) => (
                <tr key={manga.id} className="text-zinc-300">
                  <td className="py-3 pr-4">
                    {manga.coverUrl ? (
                      <img src={manga.coverUrl} alt={manga.title} className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-zinc-700 rounded flex items-center justify-center text-zinc-500 text-xs">?</div>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium text-white max-w-[200px] truncate">{manga.title}</td>
                  <td className="py-3 pr-4 font-mono text-zinc-400 text-xs">{manga.slug}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[manga.status]}`}>
                      {STATUS_LABELS[manga.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">{manga._count.chapters}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(manga)}
                        className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(manga.slug)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
