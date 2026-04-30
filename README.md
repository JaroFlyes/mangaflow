# 🔖 MangaFlow

Plataforma web moderna para leitura de mangás. Catálogo, leitor fluido, favoritos, histórico e painel admin.

## 🚀 Stack (MVP)

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
- **Estilização:** Tailwind CSS
- **Autenticação:** NextAuth.js (e-mail/senha)
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Armazenamento de imagens:** S3 compatível (AWS S3 / Supabase Storage / Wasabi)
- **Deploy:** Vercel (front + API) + Railway ou Supabase (banco)

## 📦 Funcionalidades do MVP

- [ ] Catálogo de mangás com busca por nome
- [ ] Página de detalhes da obra
- [ ] Lista de capítulos por obra
- [ ] Leitor de páginas (vertical scroll / horizontal clique)
- [ ] Cadastro e login de usuários
- [ ] Favoritos / Biblioteca pessoal
- [ ] Histórico de leitura (último capítulo/página)
- [ ] Painel admin (CRUD obras, capítulos, upload de páginas)
- [ ] SEO básico (URLs amigáveis, meta tags)

## 🗂️ Estrutura de Pastas

```
mangaflow/
├── app/
│   ├── page.tsx                  # Home / catálogo
│   ├── mangas/
│   │   ├── page.tsx              # Lista de mangás
│   │   └── [slug]/
│   │       ├── page.tsx          # Detalhes da obra
│   │       └── capitulo/
│   │           └── [chapterNumber]/
│   │               └── page.tsx  # Leitor
│   ├── login/
│   │   └── page.tsx
│   ├── registro/
│   │   └── page.tsx
│   ├── biblioteca/
│   │   └── page.tsx              # Favoritos do usuário
│   └── admin/
│       ├── layout.tsx
│       ├── mangas/
│       │   └── page.tsx
│       └── capitulos/
│           └── page.tsx
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MangaCard.tsx
│   │   ├── ChapterList.tsx
│   │   └── ReaderControls.tsx
│   └── lib/
│       ├── prisma.ts
│       └── auth.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🛣️ Próximos Passos

1. Inicializar projeto Next.js + TypeScript localmente
2. Configurar Prisma + PostgreSQL e modelar o banco
3. Implementar rotas públicas do catálogo
4. Adicionar autenticação e favoritos
5. Implementar painel admin e upload de imagens

## 🧑‍💻 Como rodar localmente

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Rodar migrações do banco
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)
