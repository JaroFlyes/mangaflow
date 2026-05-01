# MangaFlow

MangaFlow é uma plataforma de leitura de mangás construída com Next.js 14,
Tailwind CSS e Supabase. O projeto inclui catálogo com filtros, hero slider,
histórico de leitura, autenticação por e-mail/senha e leitor de capítulos com
modo vertical ou página a página.

## Stack

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth e Storage
- Vercel para deploy

## Desenvolvimento

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Configure as variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Banco de dados

O schema completo com RLS está em `supabase/schema.sql`. Ele cria:

- `mangas`
- `chapters`
- `pages`
- `reading_history`
- `favorites`
- bucket público `manga-assets`

As tabelas de conteúdo têm leitura pública. Histórico e favoritos são isolados
por `auth.uid()`.

## Deploy

O projeto está pronto para deploy na Vercel. Defina as mesmas variáveis de
ambiente no painel/projeto Vercel antes de publicar.
