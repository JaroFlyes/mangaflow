import Link from 'next/link';

export const metadata = { title: 'Admin' };

const sections = [
  { href: '/admin/mangas', label: 'Mangás', description: 'Cadastrar e editar obras', icon: '📚' },
  { href: '/admin/capitulos', label: 'Capítulos', description: 'Adicionar capítulos às obras', icon: '📄' },
  { href: '/admin/paginas', label: 'Páginas', description: 'Upload de imagens por capítulo', icon: '🖼️' },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-white">Painel Admin</h1>
      <p className="mb-8 text-sm text-zinc-400">Gerencie o conteúdo do MangaFlow.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-zinc-900 p-5 hover:border-accent hover:bg-zinc-800 transition-all"
          >
            <span className="text-3xl">{s.icon}</span>
            <p className="font-semibold text-white">{s.label}</p>
            <p className="text-xs text-zinc-400">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
