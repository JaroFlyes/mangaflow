'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) setError('Email ou senha incorretos.')
    else { router.push('/'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e94560]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e94560] flex items-center justify-center shadow-[0_0_20px_rgba(233,69,96,0.4)]">
              <span className="text-white font-black">M</span>
            </div>
            <span className="font-bold text-white text-xl">Manga<span className="text-[#e94560]">Flow</span></span>
          </Link>
          <p className="text-[#555] text-sm mt-3">Bem-vindo de volta</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-7 shadow-2xl">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="seu@email.com"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-2 focus:ring-[#e94560]/10 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666] uppercase tracking-wider mb-2">Senha</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#e94560]/50 focus:ring-2 focus:ring-[#e94560]/10 transition"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#e94560] hover:bg-[#c73652] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_24px_rgba(233,69,96,0.3)] hover:shadow-[0_4px_32px_rgba(233,69,96,0.45)] mt-1"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#555] text-sm mt-6">
          Não tem conta?{' '}
          <Link href="/registro" className="text-[#e94560] hover:text-[#ff6b84] font-semibold transition">Cadastre-se grátis</Link>
        </p>
      </div>
    </div>
  )
}
