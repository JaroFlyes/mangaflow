'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Conta criada. Verifique seu e-mail se a confirmação estiver ativada.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
          >
            <span className="w-9 h-9 rounded-lg bg-accent grid place-items-center text-background">
              M
            </span>
            MangaFlow
          </Link>
          <p className="mt-2 text-sm text-muted">
            {mode === 'signin' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-elevated">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-1.5 text-sm rounded-md transition-colors ${
                mode === 'signin' ? 'bg-accent text-background' : 'text-white/80'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-1.5 text-sm rounded-md transition-colors ${
                mode === 'signup' ? 'bg-accent text-background' : 'text-white/80'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-muted mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent focus:outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-accent focus:outline-none text-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-background font-medium text-sm transition-colors"
            >
              {loading
                ? 'Carregando...'
                : mode === 'signin'
                ? 'Entrar'
                : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Ao continuar você concorda com os termos do MangaFlow.
        </p>
      </div>
    </div>
  );
}
