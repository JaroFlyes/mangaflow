import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-primary font-bold text-xl">
          MangaFlow
        </Link>
        <nav className="flex items-center gap-6 text-muted text-sm">
          <Link href="/mangas" className="hover:text-white transition">Catálogo</Link>
          <Link href="/biblioteca" className="hover:text-white transition">Biblioteca</Link>
          <Link href="/login" className="hover:text-white transition">Entrar</Link>
        </nav>
      </div>
    </header>
  )
}
