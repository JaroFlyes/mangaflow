import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <p className="text-accent text-sm uppercase tracking-widest">404</p>
        <h1 className="mt-2 text-3xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-muted">
          O link que você seguiu pode estar quebrado ou o conteúdo foi removido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-background font-medium"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
