'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/catalogo', label: 'Catálogo' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-background/70 border-b border-border'
          : 'backdrop-blur-md bg-background/40 border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-accent grid place-items-center text-background font-bold">
            M
          </span>
          <span className="font-semibold tracking-tight text-lg group-hover:text-accent transition-colors">
            MangaFlow
          </span>
        </Link>

        <ul className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'text-accent' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <>
              <span className="hidden md:inline text-sm text-muted truncate max-w-[160px]">
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-md text-sm border border-border hover:border-accent hover:text-accent transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-md text-sm bg-accent hover:bg-accent-hover text-background font-medium transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
