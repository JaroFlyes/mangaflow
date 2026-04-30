export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-muted text-sm">
        © {new Date().getFullYear()} MangaFlow. Todos os direitos reservados.
      </div>
    </footer>
  )
}
