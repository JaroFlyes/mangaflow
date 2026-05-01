-- MangaFlow — profiles table + admin RLS policies
-- Run after 001_initial_schema.sql

-- =========================================================================
-- Profiles (extends auth.users)
-- =========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read any profile" on public.profiles;
create policy "Users read any profile"
  on public.profiles for select
  using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Admin write policies for content tables
-- =========================================================================

-- helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- mangas
drop policy if exists "Admins insert mangas" on public.mangas;
create policy "Admins insert mangas"
  on public.mangas for insert
  with check (public.is_admin());

drop policy if exists "Admins update mangas" on public.mangas;
create policy "Admins update mangas"
  on public.mangas for update
  using (public.is_admin());

drop policy if exists "Admins delete mangas" on public.mangas;
create policy "Admins delete mangas"
  on public.mangas for delete
  using (public.is_admin());

-- chapters
drop policy if exists "Admins insert chapters" on public.chapters;
create policy "Admins insert chapters"
  on public.chapters for insert
  with check (public.is_admin());

drop policy if exists "Admins update chapters" on public.chapters;
create policy "Admins update chapters"
  on public.chapters for update
  using (public.is_admin());

drop policy if exists "Admins delete chapters" on public.chapters;
create policy "Admins delete chapters"
  on public.chapters for delete
  using (public.is_admin());

-- pages
drop policy if exists "Admins insert pages" on public.pages;
create policy "Admins insert pages"
  on public.pages for insert
  with check (public.is_admin());

drop policy if exists "Admins update pages" on public.pages;
create policy "Admins update pages"
  on public.pages for update
  using (public.is_admin());

drop policy if exists "Admins delete pages" on public.pages;
create policy "Admins delete pages"
  on public.pages for delete
  using (public.is_admin());

-- Storage: only admins can upload to manga-assets
drop policy if exists "Admins upload manga-assets" on storage.objects;
create policy "Admins upload manga-assets"
  on storage.objects for insert
  with check (
    bucket_id = 'manga-assets'
    and public.is_admin()
  );

drop policy if exists "Admins delete manga-assets" on storage.objects;
create policy "Admins delete manga-assets"
  on storage.objects for delete
  using (
    bucket_id = 'manga-assets'
    and public.is_admin()
  );
