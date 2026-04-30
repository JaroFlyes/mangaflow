'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-primary font-bold text-xl tracking-tight">
          MangaFlow
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/mangas" className="text-muted hover:text-white transition">
            Catálogo
          </Link>

          {session ? (
            <>
              <Link href="/biblioteca" className="text-muted hover:text-white transition">
                Biblioteca
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-muted hover:text-white transition"
                >
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() ?? session.user?.email?.[0]?.toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-white text-sm font-medium truncate">{session.user?.name ?? 'Usuário'}</p>
                      <p className="text-muted text-xs truncate">{session.user?.email}</p>
                    </div>
                    {session.user?.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-border transition"
                      >
                        Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="w-full text-left px-4 py-2 text-sm text-muted hover:text-white hover:bg-border transition"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
