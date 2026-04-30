import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Helper para pegar a sessão no servidor (Server Components e Route Handlers)
 * Uso: const session = await getSession()
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Retorna o usuário logado ou null
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Verifica se o usuário logado é admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) {
    return null
  }
  return user
}
