'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const navLink = (href: string) =>
    `text-sm transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-white font-medium'
        : 'text-[#666] hover:text-white'
    }`

  const initials =
    session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase() ??
    '?'

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center shadow-[0_0_12px_rgba(233,69,96,0.5)]">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Manga<span className="text-[#e94560]">Flow</span>
          </span>
        </Link>

        {/* Nav central */}
        <nav className="hidden sm:flex items-center gap-7">
          <Link href="/mangas" className={navLink('/mangas')}>Catálogo</Link>
          {session && <Link href="/biblioteca" className={navLink('/biblioteca')}>Biblioteca</Link>}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-[#e94560]/15 border border-[#e94560]/30 flex items-center justify-center text-[#e94560] text-sm font-bold hover:bg-[#e94560]/25 transition"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="animate-fade-in absolute right-0 mt-2 w-54 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-white/8">
                    <p className="text-white text-sm font-semibold truncate">{session.user?.name ?? 'Usuário'}</p>
                    <p className="text-[#555] text-xs truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <div className="py-1.5">
                    <Link href="/biblioteca" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#aaa] hover:text-white hover:bg-white/5 transition">
                      <span className="text-base">📚</span> Biblioteca
                    </Link>
                    {session.user?.isAdmin && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#aaa] hover:text-white hover:bg-white/5 transition">
                        <span className="text-base">⚙️</span> Painel Admin
                      </Link>
                    )}
                    <div className="my-1 border-t border-white/5" />
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition"
                    >
                      <span className="text-base">🚪</span> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-[#666] hover:text-white transition px-3 py-2">
                Entrar
              </Link>
              <Link
                href="/registro"
                className="text-sm px-4 py-2 bg-[#e94560] hover:bg-[#c73652] text-white rounded-xl font-semibold transition shadow-[0_0_16px_rgba(233,69,96,0.3)]"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
