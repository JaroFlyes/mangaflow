'use client'

import { useEffect, useState, useCallback } from 'react'
import MangaCard from '@/components/MangaCard'
import Header from '@/components/Header'

const GENRES = ['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Romance', 'Terror', 'Sci-Fi', 'Slice of Life']
const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'ONGOING', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Completo' },
  { value: 'HIATUS', label: 'Hiato' },
]

export default function CatalogPage() {
  const [mangas, setMangas] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
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
    setTotal(data.pagination?.total || 0)
    setLoading(false)
  }, [search, genre, status, page])

  useEffect(() => { fetchMangas() }, [fetchMangas])

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Catálogo</h1>
            {!loading && <p className="text-muted text-sm mt-1">{total} obras encontradas</p>}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por nome..."
              className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition"
            />
          </div>
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1) }}
            className="bg-[#141414] border border-white/10 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/60 transition"
          >
            <option value="">Gênero</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="bg-[#141414] border border-white/10 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/60 transition"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filtros ativos */}
        {(genre || status) && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {genre && (
              <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                {genre}
                <button onClick={() => setGenre('')} className="hover:text-white">×</button>
              </span>
            )}
            {status && (
              <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                {STATUSES.find(s => s.value === status)?.label}
                <button onClick={() => setStatus('')} className="hover:text-white">×</button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl aspect-[3/4] bg-[#141414] animate-pulse" />
            ))}
          </div>
        ) : mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-medium mb-1">Nenhum mangá encontrado</p>
            <p className="text-muted text-sm">Tente mudar os filtros ou a busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard
                key={manga.id}
                title={manga.title}
                slug={manga.slug}
                coverUrl={manga.coverUrl || '/placeholder-cover.jpg'}
                status={manga.status}
                chapterCount={manga._count?.chapters}
              />
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#141414] border border-white/10 rounded-xl text-sm text-muted disabled:opacity-30 hover:text-white hover:border-white/20 transition"
            >
              ← Anterior
            </button>
            <span className="text-muted text-sm">
              <span className="text-white font-medium">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#141414] border border-white/10 rounded-xl text-sm text-muted disabled:opacity-30 hover:text-white hover:border-white/20 transition"
            >
              Próxima →
            </button>
          </div>
        )}
      </main>
    </>
  )
}
