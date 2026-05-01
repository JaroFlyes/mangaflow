'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

/* ─── Tipos ─────────────────────────────────────────────── */
export interface CatalogManga {
  id: string
  title: string
  slug: string
  coverUrl: string | null
  status: string
  genres: string[]
  synopsis?: string | null
  chapterCount: number
}

interface Props {
  mangas: CatalogManga[]
  /** Exibe o cabeçalho de seção (título + subtítulo). Default: true */
  showHeader?: boolean
}

/* ─── Constantes ─────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  ONGOING: 'Em andamento',
  COMPLETED: 'Completo',
  HIATUS: 'Hiato',
  CANCELLED: 'Cancelado',
}

const STATUS_CLASS: Record<string, string> = {
  ONGOING:   'bg-emerald-500/20 text-emerald-400',
  COMPLETED: 'bg-blue-500/20 text-blue-400',
  HIATUS:    'bg-yellow-500/20 text-yellow-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const GENRES = ['Action', 'Shounen', 'Shoujo', 'Romance', 'Fantasy', 'Horror', 'Sci-Fi', 'Adventure', 'Comedy', 'Drama']

const LS_FAV     = 'mf_favorites'
const LS_RATINGS = 'mf_ratings'

/* ─── Helpers localStorage ───────────────────────────────── */
function loadFavs(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_FAV) || '[]') } catch { return [] }
}
function loadRatings(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LS_RATINGS) || '{}') } catch { return {} }
}

/* ─── Sub-componente: Stars ──────────────────────────────── */
function StarRating({
  mangaId,
  ratings,
  onRate,
}: {
  mangaId: string
  ratings: Record<string, number>
  onRate: (id: string, val: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const current = ratings[mangaId] ?? 0

  return (
    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          aria-label={`Avaliar ${v} estrelas`}
          onMouseEnter={() => setHovered(v)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(mangaId, v)}
          className="text-[13px] leading-none transition-transform hover:scale-125"
          style={{ color: v <= (hovered || current) ? '#fbbf24' : '#333' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

/* ─── Sub-componente: Modal ──────────────────────────────── */
function MangaModal({
  manga,
  isFav,
  ratings,
  onClose,
  onToggleFav,
  onRate,
}: {
  manga: CatalogManga
  isFav: boolean
  ratings: Record<string, number>
  onClose: () => void
  onToggleFav: () => void
  onRate: (id: string, val: number) => void
}) {
  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto bg-[#111] border border-white/8 rounded-2xl animate-[fadeIn_0.2s_ease-out]">

        {/* Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white/6 border border-white/8 text-[#666] hover:text-white hover:bg-white/12 transition flex items-center justify-center text-base"
        >
          ✕
        </button>

        {/* Header */}
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[100px_1fr] gap-5 p-6 border-b border-white/8">
          <div className="rounded-xl overflow-hidden aspect-[3/4] bg-[#1a1a1a]">
            <img
              src={manga.coverUrl || `https://picsum.photos/200/300?random=${manga.id}`}
              alt={manga.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-cover.jpg' }}
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <h2 id="modal-title" className="text-xl font-black text-white leading-tight">{manga.title}</h2>
            <p className="text-xs text-[#666]">{manga.chapterCount} capítulos</p>
            <div className="flex flex-wrap gap-1.5">
              {manga.genres.map((g) => (
                <span key={g} className="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-md bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20">
                  {g}
                </span>
              ))}
            </div>
            <StarRating mangaId={manga.id} ratings={ratings} onRate={onRate} />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Sinopse */}
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#555] mb-2">Sinopse</p>
            <p className="text-sm text-[#999] leading-relaxed">
              {manga.synopsis || 'Sinopse não disponível para esta obra.'}
            </p>
          </div>

          {/* Trailer placeholder */}
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#555] mb-2">Trailer</p>
            <div
              className="relative w-full rounded-xl border border-white/8 bg-[#0a0a0a] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#e94560]/30 transition-colors overflow-hidden"
              style={{ aspectRatio: '16/9' }}
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(manga.title + ' manga trailer')}`, '_blank', 'noopener,noreferrer')}
              title="Buscar trailer no YouTube"
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(233,69,96,0.06) 0%, transparent 70%)' }}
              />
              <div className="relative w-14 h-14 rounded-full bg-[#e94560]/15 border-2 border-[#e94560]/40 flex items-center justify-center text-xl text-[#e94560] hover:scale-110 transition-transform">
                ▶
              </div>
              <span className="relative text-xs text-[#666]">Clique para buscar o trailer no YouTube</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onToggleFav}
              className={`flex-1 py-2.5 px-5 rounded-xl text-sm font-bold border transition-all ${
                isFav
                  ? 'bg-[#e94560] text-white border-[#e94560]'
                  : 'bg-[#e94560]/8 text-[#e94560] border-[#e94560]/30 hover:bg-[#e94560]/15 hover:border-[#e94560]'
              }`}
            >
              {isFav ? '❤️ Nos Favoritos' : '⭐ Adicionar aos Favoritos'}
            </button>
            <Link
              href={`/mangas/${manga.slug}`}
              className="flex-1 py-2.5 px-5 rounded-xl text-sm font-bold bg-[#e94560] hover:bg-[#c73652] text-white text-center transition-all shadow-[0_0_20px_rgba(233,69,96,0.3)] hover:shadow-[0_0_30px_rgba(233,69,96,0.5)]"
            >
              📖 Ler Agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-componente: Toast ──────────────────────────────── */
function Toast({ message, icon }: { message: string; icon: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-3 text-sm text-white shadow-2xl animate-[fadeInUp_0.3s_ease-out]">
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────── */
export default function MangaCatalog({ mangas, showHeader = true }: Props) {
  const [query, setQuery]           = useState('')
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [showFavsOnly, setShowFavsOnly] = useState(false)
  const [favs, setFavs]             = useState<string[]>([])
  const [ratings, setRatings]       = useState<Record<string, number>>({})
  const [modalManga, setModalManga] = useState<CatalogManga | null>(null)
  const [toast, setToast]           = useState<{ msg: string; icon: string } | null>(null)
  const [genreOpen, setGenreOpen]   = useState(false)
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genreRef                    = useRef<HTMLDivElement>(null)

  // Carregar localStorage no cliente
  useEffect(() => {
    setFavs(loadFavs())
    setRatings(loadRatings())
  }, [])

  // Fechar dropdown de gênero ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showToast = useCallback((msg: string, icon: string) => {
    setToast({ msg, icon })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  /* Filtros */
  const filtered = mangas.filter((m) => {
    const q = query.trim().toLowerCase()
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
    const matchGenre  = !activeGenre || m.genres.includes(activeGenre)
    const matchFav    = !showFavsOnly || favs.includes(m.id)
    return matchSearch && matchGenre && matchFav
  })

  const hasFilter = !!query || !!activeGenre || showFavsOnly

  const clearFilters = () => {
    setQuery('')
    setActiveGenre(null)
    setShowFavsOnly(false)
  }

  /* Favoritos */
  const isFav = (id: string) => favs.includes(id)

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      localStorage.setItem(LS_FAV, JSON.stringify(next))
      return next
    })
    const adding = !favs.includes(id)
    showToast(adding ? 'Adicionado aos favoritos!' : 'Removido dos favoritos', adding ? '❤️' : '💔')
  }, [favs, showToast])

  /* Rating */
  const handleRate = useCallback((id: string, val: number) => {
    setRatings((prev) => {
      const next = { ...prev, [id]: val }
      localStorage.setItem(LS_RATINGS, JSON.stringify(next))
      return next
    })
    showToast(`Avaliação salva: ${val}/5 estrelas`, '⭐')
  }, [showToast])

  const favCount = favs.length

  return (
    <>
      {/* ── Cabeçalho da seção ── */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Catálogo</h2>
            <p className="text-[#555] text-sm mt-1">
              {hasFilter
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : `${mangas.length} obras disponíveis`}
            </p>
          </div>

          {/* Controles de filtro */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm pointer-events-none">🔍</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                aria-label="Buscar mangás"
                className="pl-8 pr-3 py-2 text-sm bg-white/5 border border-white/8 rounded-lg text-white placeholder:text-[#555] outline-none focus:border-[#e94560]/50 focus:bg-white/7 transition w-44"
              />
            </div>

            {/* Dropdown gêneros */}
            <div className="relative" ref={genreRef}>
              <button
                onClick={() => setGenreOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition ${
                  activeGenre
                    ? 'bg-[#e94560]/15 border-[#e94560]/40 text-[#e94560]'
                    : 'bg-white/5 border-white/8 text-[#aaa] hover:text-white hover:border-white/15'
                }`}
              >
                {activeGenre ?? 'Gênero'} <span className="text-[10px]">▾</span>
              </button>
              {genreOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-20 bg-[#161616] border border-white/8 rounded-xl p-1.5 min-w-[150px] shadow-2xl animate-[fadeIn_0.15s_ease-out]">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => { setActiveGenre(activeGenre === g ? null : g); setGenreOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                        activeGenre === g
                          ? 'text-white bg-white/8'
                          : 'text-[#aaa] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favoritos toggle */}
            <button
              onClick={() => setShowFavsOnly((v) => !v)}
              title="Ver favoritos"
              className={`relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition ${
                showFavsOnly
                  ? 'bg-[#e94560]/15 border-[#e94560]/40 text-[#e94560]'
                  : 'bg-white/5 border-white/8 text-[#aaa] hover:text-white hover:border-white/15'
              }`}
            >
              ⭐
              {favCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#e94560] text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#0d0d0d]">
                  {favCount}
                </span>
              )}
            </button>

            {/* Limpar filtros */}
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-[#666] hover:text-white transition"
              >
                ✕ Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#555] text-sm">Nenhum mangá encontrado. Tente outro termo.</p>
          {hasFilter && (
            <button onClick={clearFilters} className="mt-4 text-sm text-[#e94560] hover:text-[#ff6b84] transition">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-5">
          {filtered.map((manga, i) => (
            <article
              key={manga.id}
              className="group bg-[#1a1a2e] border border-white/8 rounded-[14px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00d4ff]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(0,212,255,0.1)]"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => setModalManga(manga)}
              aria-label={`Ver detalhes de ${manga.title}`}
            >
              {/* Capa */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
                <img
                  src={manga.coverUrl || `https://picsum.photos/200/300?random=${i + 1}`}
                  alt={manga.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/200/300?random=${i + 20}`
                  }}
                />
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status badge */}
                <span className={`absolute top-2 left-2 text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_CLASS[manga.status] ?? 'bg-white/10 text-white/60'}`}>
                  {STATUS_LABEL[manga.status] ?? manga.status}
                </span>

                {/* Botão favoritar */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(manga.id) }}
                  aria-label={isFav(manga.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-sm backdrop-blur-sm border transition-all duration-200 ${
                    isFav(manga.id)
                      ? 'opacity-100 bg-[#e94560]/25 border-[#e94560]'
                      : 'opacity-0 group-hover:opacity-100 bg-black/60 border-white/10 hover:bg-[#e94560]/30 hover:border-[#e94560]'
                  }`}
                >
                  {isFav(manga.id) ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-white leading-snug mb-1 line-clamp-2">
                  {manga.title}
                </h3>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[0.7rem] text-[#555] bg-white/5 px-2 py-0.5 rounded-md">
                    📖 {manga.chapterCount} caps.
                  </span>
                  <StarRating mangaId={manga.id} ratings={ratings} onRate={handleRate} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setModalManga(manga) }}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-[#00d4ff]/8 border border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all"
                >
                  Ver Detalhes
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modalManga && (
        <MangaModal
          manga={modalManga}
          isFav={isFav(modalManga.id)}
          ratings={ratings}
          onClose={() => setModalManga(null)}
          onToggleFav={() => toggleFav(modalManga.id)}
          onRate={handleRate}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.msg} icon={toast.icon} />}
    </>
  )
}
