'use client'

import { useState, useEffect } from 'react'

interface Manga {
  id: string
  title: string
  slug: string
}

interface Chapter {
  id: string
  number: number
  title: string | null
  createdAt: string
  _count: { pages: number }
}

export default function AdminCapitulosPage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ number: '', title: '', pages: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/mangas?limit=100')
      .then((r) => r.json())
      .then((data) => setMangas(data.mangas || []))
  }, [])

  useEffect(() => {
    if (!selectedSlug) {
      setChapters([])
      return
    }
    setLoadingChapters(true)
    fetch(`/api/mangas/${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => {
        setChapters(data.chapters || [])
        setLoadingChapters(false)
      })
  }, [selectedSlug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlug) return
    setSubmitting(true)

    const pages = form.pages
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean)

    await fetch(`/api/mangas/${selectedSlug}/capitulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: parseFloat(form.number),
        title: form.title || null,
        pages,
      }),
    })

    setForm({ number: '', title: '', pages: '' })
    setShowForm(false)
    setSubmitting(false)

    fetch(`/api/mangas/${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => setChapters(data.chapters || []))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gerenciar Capítulos</h1>
        {selectedSlug && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Novo Capítulo
          </button>
        )}
      </div>

      <div>
        <label className="text-zinc-400 text-sm mb-1 block">Selecionar Obra</label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full max-w-sm bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
        >
          <option value="">-- Escolha um mangá --</option>
          {mangas.map((m) => (
            <option key={m.id} value={m.slug}>{m.title}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Novo Capítulo</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Número *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="1"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-sm mb-1 block">Título (opcional)</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nome do capítulo"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-sm mb-1 block">
                URLs das páginas (uma por linha)
              </label>
              <textarea
                value={form.pages}
                onChange={(e) => setForm({ ...form, pages: e.target.value })}
                rows={8}
                placeholder="https://storage.exemplo.com/pagina-01.jpg&#10;https://storage.exemplo.com/pagina-02.jpg"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none font-mono text-xs"
              />
              <p className="text-zinc-500 text-xs mt-1">
                {form.pages.split('\n').filter((l) => l.trim()).length} página(s)
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? 'Salvando...' : 'Criar Capítulo'}
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

      {selectedSlug && (
        <div>
          {loadingChapters ? (
            <p className="text-zinc-500 text-sm">Carregando capítulos...</p>
          ) : chapters.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum capítulo cadastrado para esta obra.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 text-left border-b border-zinc-800">
                    <th className="pb-3 pr-4">Número</th>
                    <th className="pb-3 pr-4">Título</th>
                    <th className="pb-3 pr-4">Páginas</th>
                    <th className="pb-3">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {chapters.map((ch) => (
                    <tr key={ch.id} className="text-zinc-300">
                      <td className="py-3 pr-4 font-bold text-white">Cap. {ch.number}</td>
                      <td className="py-3 pr-4 text-zinc-400">{ch.title || '—'}</td>
                      <td className="py-3 pr-4 text-zinc-400">{ch._count.pages} págs.</td>
                      <td className="py-3 text-zinc-500 text-xs">
                        {new Date(ch.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
