'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        active ? 'text-white font-medium' : 'text-muted hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = session?.user?.name?.[0]?.toUpperCase()
    ?? session?.user?.email?.[0]?.toUpperCase()
    ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black">
            M
          </span>
          <span className="font-bold text-white text-lg tracking-tight">
            Manga<span className="text-primary">Flow</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-7">
          <NavLink href="/mangas">Catálogo</NavLink>
          {session && <NavLink href="/biblioteca">Biblioteca</NavLink>}
        </nav>

        {/* Direita */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-sm font-bold hover:bg-primary/30 transition"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="px-4 py-3.5 border-b border-white/5">
                    <p className="text-white text-sm font-medium truncate">{session.user?.name ?? 'Usuário'}</p>
                    <p className="text-muted text-xs truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/biblioteca" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition">
                      📚 Biblioteca
                    </Link>
                    {session.user?.isAdmin && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition">
                        ⚙️ Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition"
                    >
                      🚪 Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-muted hover:text-white transition">
                Entrar
              </Link>
              <Link href="/registro" className="text-sm px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
