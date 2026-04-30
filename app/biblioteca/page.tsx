'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import MangaCard from '@/components/MangaCard'

export default function BibliotecaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/favoritos').then(r => r.json()),
        fetch('/api/historico').then(r => r.json()),
      ]).then(([favs, hist]) => {
        setFavorites(Array.isArray(favs) ? favs : [])
        setHistory(Array.isArray(hist) ? hist : [])
        setLoading(false)
      })
    }
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64 text-muted">Carregando...</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Continuar lendo */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-5">Continuar lendo</h2>
          {history.length === 0 ? (
            <p className="text-muted text-sm">Você ainda não leu nenhum capítulo.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice(0, 5).map((item: any) => (
                <a
                  key={item.id}
                  href={`/mangas/${item.chapter.manga.slug}/capitulo/${item.chapter.number}`}
                  className="flex items-center gap-4 p-3 bg-surface border border-border rounded-xl hover:border-primary/50 transition"
                >
                  <img
                    src={item.chapter.manga.coverUrl || '/placeholder-cover.jpg'}
                    alt={item.chapter.manga.title}
                    className="w-12 h-16 rounded-lg object-cover bg-border"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{item.chapter.manga.title}</p>
                    <p className="text-muted text-xs mt-0.5">Cap. {item.chapter.number} — pág. {item.lastPage}</p>
                  </div>
                  <span className="ml-auto text-primary text-sm">→</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Favoritos */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">Favoritos</h2>
          {favorites.length === 0 ? (
            <p className="text-muted text-sm">Você ainda não tem favoritos.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map((manga: any) => (
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
        </section>
      </main>
    </>
  )
}
