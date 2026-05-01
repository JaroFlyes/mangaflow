# MangaFlow

Plataforma web para leitura de mangás online — Next.js 14 (App Router) + Tailwind CSS + TypeScript + Supabase (Auth, DB, Storage). Pronta para deploy na Vercel.

## Stack

- **Next.js 14** — App Router, Server Components, Image Optimization
- **TypeScript** — strict mode
- **Tailwind CSS** — dark mode first, paleta `#0d0d0f` + accent `#e05c2a`
- **Supabase** — Postgres + Row Level Security + Auth + Storage
- **Vercel** — deploy

## Estrutura

```
app/
  layout.tsx
  page.tsx                 # home com hero + continuar lendo + grid
  catalogo/page.tsx        # catálogo completo
  manga/[slug]/page.tsx    # detalhes + lista de capítulos
  manga/[slug]/capitulo/[number]/page.tsx  # leitor
  auth/page.tsx            # login / cadastro
components/
  Navbar.tsx               # glassmorphism, fixa
  HeroSlider.tsx           # autoplay 5s, dots, swipe
  MangaCard.tsx            # card reutilizável
  MangaReader.tsx          # vertical / página a página + progresso
  ContinueReading.tsx      # carrossel "continuar lendo"
lib/
  supabase.ts              # clientes browser/server tipados
  data.ts                  # leitura tipada com fallback mock
  mock-data.ts             # dados de fallback quando o DB está vazio
types/index.ts             # Manga, Chapter, Page, ReadingHistory, Favorite, Database
supabase/
  schema.sql
  migrations/001_initial_schema.sql
```

## Setup local

1. Instale dependências:
   ```bash
   npm install
   ```
2. Copie `.env.local.example` para `.env.local` e preencha as variáveis do Supabase.
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```

> Sem variáveis configuradas, o app exibe dados mock para que você possa navegar a UI imediatamente.

## Banco de dados

Aplique o schema em `supabase/migrations/001_initial_schema.sql`:

- pelo SQL Editor do Supabase, ou
- via CLI: `supabase db push`

O schema cobre:

- Tabelas: `mangas`, `chapters`, `pages`, `reading_history`, `favorites`
- Índices úteis e trigger `updated_at`
- RLS: leitura pública para conteúdo; `reading_history` e `favorites` restritos ao próprio usuário
- Bucket público `manga-assets` no Storage para capas e páginas

## Variáveis de ambiente

Veja `.env.local.example`.

| Var | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública |

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em *Environment Variables*.
3. Deploy.
