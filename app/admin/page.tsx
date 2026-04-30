import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = {
  title: 'Admin — MangaFlow',
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
        <p className="text-zinc-400 text-sm mt-1">Bem-vindo, {session.user.name || session.user.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/admin/mangas"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-6 transition-colors group"
        >
          <div className="text-3xl mb-3">📚</div>
          <h2 className="text-white font-semibold text-lg group-hover:text-violet-400 transition-colors">Gerenciar Mangás</h2>
          <p className="text-zinc-400 text-sm mt-1">Cadastrar, editar e remover obras do catálogo.</p>
        </a>

        <a
          href="/admin/capitulos"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-6 transition-colors group"
        >
          <div className="text-3xl mb-3">📄</div>
          <h2 className="text-white font-semibold text-lg group-hover:text-violet-400 transition-colors">Gerenciar Capítulos</h2>
          <p className="text-zinc-400 text-sm mt-1">Adicionar capítulos e páginas às obras.</p>
        </a>
      </div>
    </div>
  )
}
