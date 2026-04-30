'use client'

import { useEffect, useState, useCallback } from 'react'
import MangaCard from '@/components/MangaCard'
import Header from '@/components/Header'

const GENRES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Romance', 'Terror', 'Sci-Fi', 'Slice of Life']
const STATUSES = [{ value: '', label: 'Todos' }, { value: 'ONGOING', label: 'Em andamento' }, { value: 'COMPLETED', label: 'Completo' }, { value: 'HIATUS', label: 'Hiato' }]

export default function CatalogPage() {
  const [mangas, setMangas] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchMangas = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (genre) params.set('genre', genre)
    if (status) params.set('status', status)
    params.set('page', String(page))
    const res = await fetch(`/api/mangas?${params}`)
    const data = await res.json()
    setMangas(data.mangas || [])
    setTotalPages(data.pagination?.totalPages || 1)
    setLoading(false)
  }, [search, genre, status, page])

  useEffect(() => { fetchMangas() }, [fetchMangas])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    fetchMangas()
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Catálogo</h1>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary transition"
            />
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition">
              Buscar
            </button>
          </form>
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1) }}
            className="bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="">Gênero</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : mangas.length === 0 ? (
          <div className="text-center py-24 text-muted">Nenhum mangá encontrado.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} title={manga.title} slug={manga.slug} coverUrl={manga.coverUrl || '/placeholder-cover.jpg'} status={manga.status} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted disabled:opacity-40 hover:text-white transition">
              Anterior
            </button>
            <span className="text-muted text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted disabled:opacity-40 hover:text-white transition">
              Próxima
            </button>
          </div>
        )}
      </main>
    </>
  )
}
