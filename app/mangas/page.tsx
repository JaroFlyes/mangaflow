'use client'

import { useEffect, useState } from 'react'
import MangaCard from '@/components/MangaCard'

type Manga = {
  id: string
  title: string
  slug: string
  coverUrl: string | null
  status: string
  genres: string[]
  _count: { chapters: number }
}

export default function MangasPage() {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => fetchMangas(), 300)
    return () => clearTimeout(timer)
  }, [search])

  async function fetchMangas() {
    setLoading(true)
    const res = await fetch(`/api/mangas?search=${search}`)
    const data = await res.json()
    setMangas(data.mangas || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Catálogo</h1>
          <input
            type="text"
            placeholder="Buscar mangá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border border-border text-white rounded-lg px-4 py-2 w-full sm:w-72 focus:outline-none focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="text-muted text-center py-20">Carregando...</div>
        ) : mangas.length === 0 ? (
          <div className="text-muted text-center py-20">
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum mangá cadastrado ainda.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard
                key={manga.id}
                title={manga.title}
                slug={manga.slug}
                coverUrl={manga.coverUrl || '/placeholder-cover.jpg'}
                status={manga.status}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
