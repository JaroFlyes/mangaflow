'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Slide {
  title: string
  titleHighlight: string
  genres: string[]
  chapters: string
  synopsis: string
  slug: string
  img: string
}

const SLIDES: Slide[] = [
  {
    title: 'One',
    titleHighlight: 'Piece',
    genres: ['Shounen', 'Adventure'],
    chapters: '1.110+ capítulos',
    synopsis:
      'Monkey D. Luffy parte em busca do lendário tesouro "One Piece" para se tornar o Rei dos Piratas. Uma jornada épica de amizade, batalhas e sonhos que atravessa os mares do Grand Line.',
    slug: 'one-piece',
    img: 'https://picsum.photos/220/293?random=101',
  },
  {
    title: 'Jujutsu',
    titleHighlight: 'Kaisen',
    genres: ['Action', 'Supernatural'],
    chapters: '260+ capítulos',
    synopsis:
      'Yuji Itadori engole um dedo amaldiçoado e se torna hospedeiro do poderoso demônio Ryomen Sukuna. Agora ele deve lutar ao lado de exorcistas para proteger a humanidade das maldições.',
    slug: 'jujutsu-kaisen',
    img: 'https://picsum.photos/220/293?random=102',
  },
  {
    title: 'Attack on',
    titleHighlight: 'Titan',
    genres: ['Action', 'Dark Fantasy'],
    chapters: '139 capítulos',
    synopsis:
      'Em um mundo onde a humanidade vive atrás de muros gigantescos para se proteger dos Titãs, Eren Yeager jura destruir todos eles após sua cidade ser atacada. Uma obra-prima do mangá moderno.',
    slug: 'attack-on-titan',
    img: 'https://picsum.photos/220/293?random=103',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length)
  }, [])

  const startAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 4000)
  }, [])

  useEffect(() => {
    startAuto()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startAuto])

  const handlePrev = () => { goTo(current - 1); startAuto() }
  const handleNext = () => { goTo(current + 1); startAuto() }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? handleNext() : handlePrev() }
  }

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Mangás em destaque"
    >
      {/* Glow de fundo */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(233,69,96,0.22) 0%, transparent 70%)',
        }}
      />
      {/* Grade decorativa */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Track */}
      <div
        ref={trackRef}
        className="relative z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div key={i} className="min-w-full px-5 pt-20 pb-16">
              <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-12">

                {/* Conteúdo */}
                <div className="max-w-xl">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-[#e94560] bg-[#e94560]/10 border border-[#e94560]/25 px-3 py-1.5 rounded-full mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e94560] animate-pulse" />
                    Em destaque
                  </span>

                  {/* Título */}
                  <h1 className="font-black text-white leading-none tracking-tight mb-4"
                    style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontFamily: 'Inter, sans-serif' }}>
                    {slide.title}{' '}
                    <span className="text-[#e94560]">{slide.titleHighlight}</span>
                  </h1>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {slide.genres.map((g) => (
                      <span
                        key={g}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                      >
                        {g}
                      </span>
                    ))}
                    <span className="text-xs text-[#666]">{slide.chapters}</span>
                  </div>

                  {/* Sinopse */}
                  <p className="text-[#888] text-[0.9375rem] leading-relaxed mb-8 max-w-lg">
                    {slide.synopsis}
                  </p>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/mangas/${slide.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#e94560] hover:bg-[#c73652] text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_30px_rgba(233,69,96,0.35)] hover:shadow-[0_0_45px_rgba(233,69,96,0.55)] hover:-translate-y-px"
                    >
                      ▶ Ler Agora
                    </Link>
                    <Link
                      href="/mangas"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold text-sm rounded-xl transition-all hover:bg-white/5 hover:-translate-y-px"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </div>

                {/* Capa — oculta em mobile */}
                <div className="hidden sm:block w-[220px] flex-shrink-0">
                  <img
                    src={slide.img}
                    alt={`${slide.title} ${slide.titleHighlight}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="w-full rounded-2xl object-cover"
                    style={{
                      aspectRatio: '3/4',
                      boxShadow:
                        '0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,212,255,0.35)',
                    }}
                  />
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-10">
        <button
          onClick={handlePrev}
          aria-label="Slide anterior"
          className="w-10 h-10 rounded-full bg-white/6 border border-white/8 text-white text-lg flex items-center justify-center hover:bg-white/12 hover:border-white/20 transition-all"
        >
          ‹
        </button>

        <div className="flex gap-2" role="tablist">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-label={`Slide ${i + 1}`}
              aria-selected={i === current}
              onClick={() => { goTo(i); startAuto() }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                background: i === current ? '#e94560' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Próximo slide"
          className="w-10 h-10 rounded-full bg-white/6 border border-white/8 text-white text-lg flex items-center justify-center hover:bg-white/12 hover:border-white/20 transition-all"
        >
          ›
        </button>
      </div>
    </section>
  )
}
