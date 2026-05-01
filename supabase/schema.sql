-- MangaFlow — initial schema
-- Run on the Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.mangas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_url text,
  status text not null default 'ongoing'
    check (status in ('ongoing', 'completed', 'hiatus')),
  genres text[] not null default '{}',
  author text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.mangas(id) on delete cascade,
  number numeric not null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manga_id, number)
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  page_number int not null,
  image_url text not null,
  unique (chapter_id, page_number)
);

create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  manga_id uuid not null references public.mangas(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  page_number int not null default 1,
  progress int not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, manga_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  manga_id uuid not null references public.mangas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, manga_id)
);

-- =========================================================================
-- Indexes
-- =========================================================================

create index if not exists mangas_created_at_idx on public.mangas (created_at desc);
create index if not exists mangas_status_idx on public.mangas (status);
create index if not exists chapters_manga_number_idx on public.chapters (manga_id, number);
create index if not exists pages_chapter_page_idx on public.pages (chapter_id, page_number);
create index if not exists reading_history_user_updated_idx on public.reading_history (user_id, updated_at desc);
create index if not exists favorites_user_idx on public.favorites (user_id);

-- =========================================================================
-- updated_at trigger
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_mangas_updated_at on public.mangas;
create trigger trg_mangas_updated_at
  before update on public.mangas
  for each row execute function public.set_updated_at();

drop trigger if exists trg_chapters_updated_at on public.chapters;
create trigger trg_chapters_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reading_history_updated_at on public.reading_history;
create trigger trg_reading_history_updated_at
  before update on public.reading_history
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.mangas         enable row level security;
alter table public.chapters       enable row level security;
alter table public.pages          enable row level security;
alter table public.reading_history enable row level security;
alter table public.favorites      enable row level security;

-- Public read for content tables
drop policy if exists "Public can read mangas" on public.mangas;
create policy "Public can read mangas"
  on public.mangas for select
  using (true);

drop policy if exists "Public can read chapters" on public.chapters;
create policy "Public can read chapters"
  on public.chapters for select
  using (true);

drop policy if exists "Public can read pages" on public.pages;
create policy "Public can read pages"
  on public.pages for select
  using (true);

-- reading_history — user-scoped
drop policy if exists "Users read own reading_history" on public.reading_history;
create policy "Users read own reading_history"
  on public.reading_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own reading_history" on public.reading_history;
create policy "Users insert own reading_history"
  on public.reading_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own reading_history" on public.reading_history;
create policy "Users update own reading_history"
  on public.reading_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own reading_history" on public.reading_history;
create policy "Users delete own reading_history"
  on public.reading_history for delete
  using (auth.uid() = user_id);

-- favorites — user-scoped
drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- Storage bucket for covers and pages (idempotent)
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('manga-assets', 'manga-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public read manga-assets" on storage.objects;
create policy "Public read manga-assets"
  on storage.objects for select
  using (bucket_id = 'manga-assets');
