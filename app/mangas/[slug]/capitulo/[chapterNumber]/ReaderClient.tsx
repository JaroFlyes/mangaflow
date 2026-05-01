'use client'

import { useEffect, useRef, useState } from 'react'

type Page = { id: string; number: number; imageUrl: string }

export default function ReaderClient({
  pages,
  chapterId,
  userId,
}: {
  pages: Page[]
  chapterId: string
  userId: string | null
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Atualiza histórico quando mudar de página
  useEffect(() => {
    if (!userId || !chapterId) return
    const timeout = setTimeout(() => {
      fetch('/api/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, lastPage: currentPage }),
      }).catch(() => {})
    }, 1500) // debounce de 1.5s
    return () => clearTimeout(timeout)
  }, [currentPage, chapterId, userId])

  // Detecta página visível via IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const page = parseInt(entry.target.getAttribute('data-page') ?? '1')
            setCurrentPage(page)
          }
        })
      },
      { threshold: 0.5 }
    )
    document.querySelectorAll('[data-page]').forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [pages])

  if (pages.length === 0) {
    return <div className="text-center py-24 text-muted">Nenhuma página disponível.</div>
  }

  return (
    <div className="reader-container py-4">
      {pages.map((page) => (
        <img
          key={page.id}
          src={page.imageUrl}
          alt={`Página ${page.number}`}
          data-page={page.number}
          className="w-full max-w-[800px] mx-auto block"
          loading="lazy"
        />
      ))}
      {/* Indicador de página */}
      <div className="fixed bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
        {currentPage} / {pages.length}
      </div>
    </div>
  )
}
