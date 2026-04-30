export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border p-6">
        <h2 className="text-primary font-bold text-xl mb-8">Admin</h2>
        <nav className="flex flex-col gap-3 text-muted">
          <a href="/admin/mangas" className="hover:text-white transition">Mangás</a>
          <a href="/admin/capitulos" className="hover:text-white transition">Capítulos</a>
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}
