'use client'

import { useEffect, useState, useRef } from 'react'

type Manga = { id: string; title: string; slug: string }
type Chapter = { id: string; number: number; title: string | null; createdAt: string }

export default function AdminCapitulosPage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [selectedManga, setSelectedManga] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ number: '', title: '' })
  const [files, setFiles] = useState<FileList | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/mangas').then(r => r.json()).then(d => setMangas(d.mangas ?? []))
  }, [])

  useEffect(() => {
    if (!selectedManga) return
    const manga = mangas.find(m => m.id === selectedManga)
    if (manga) fetch(`/api/mangas/${manga.slug}/capitulos`).then(r => r.json()).then(d => setChapters(d.chapters ?? []))
  }, [selectedManga, mangas])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedManga) return
    setUploading(true)

    let pageUrls: string[] = []

    // Upload das imagens se houver arquivos selecionados
    if (files && files.length > 0) {
      const uploadPromises = Array.from(files).map(async (file, i) => {
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&folder=capitulos`)
        const { uploadUrl, publicUrl } = await res.json()
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
        return { index: i, url: publicUrl }
      })
      const results = await Promise.all(uploadPromises)
      results.sort((a, b) => a.index - b.index)
      pageUrls = results.map(r => r.url)
    }

    const manga = mangas.find(m => m.id === selectedManga)
    if (!manga) return

    const res = await fetch(`/api/mangas/${manga.slug}/capitulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: parseFloat(form.number),
        title: form.title || null,
        pages: pageUrls.map((url, i) => ({ number: i + 1, imageUrl: url })),
      }),
    })

    if (res.ok) {
      setShowModal(false)
      setForm({ number: '', title: '' })
      setFiles(null)
      if (fileRef.current) fileRef.current.value = ''
      const data = await fetch(`/api/mangas/${manga.slug}/capitulos`).then(r => r.json())
      setChapters(data.chapters ?? [])
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gerenciar Capítulos</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedManga}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Novo Capítulo
        </button>
      </div>

      <select
        value={selectedManga}
        onChange={e => setSelectedManga(e.target.value)}
        className="w-full sm:w-72 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Selecione uma obra...</option>
        {mangas.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
      </select>

      {chapters.length > 0 ? (
        <div className="border border-zinc-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left">Capítulo</th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map(ch => (
                <tr key={ch.id} className="border-t border-zinc-700 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-white font-medium">{ch.number}</td>
                  <td className="px-4 py-3 text-zinc-400">{ch.title || '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(ch.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedManga ? (
        <p className="text-zinc-500 text-sm">Nenhum capítulo ainda.</p>
      ) : null}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">Novo Capítulo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">Número *</label>
                <input
                  type="number" step="0.1" required
                  value={form.number}
                  onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: 1, 1.5, 2"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">Título (opcional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: O Início"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">Páginas (imagens) *</label>
                <input
                  ref={fileRef}
                  type="file" multiple accept="image/*"
                  onChange={e => setFiles(e.target.files)}
                  className="w-full text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white file:text-xs"
                />
                {files && <p className="text-zinc-500 text-xs mt-1">{files.length} arquivo(s) selecionado(s)</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
                  {uploading ? 'Enviando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
