-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Community + Admin Permissions Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ── 1. Add admin_permissions column to users ────────────────
alter table public.users
  add column if not exists admin_permissions jsonb;

-- ── 2. Community posts ──────────────────────────────────────
create table if not exists public.community_posts (
  id             uuid         primary key default uuid_generate_v4(),
  user_id        uuid         not null references public.users(id) on delete cascade,
  category       text         not null default 'general'
                              check (category in ('question','grammar','vocabulary','culture','listening','general')),
  title          text         not null,
  body           text         not null,
  tags           jsonb        not null default '[]',
  is_pinned      boolean      not null default false,
  likes_count    integer      not null default 0,
  replies_count  integer      not null default 0,
  created_at     timestamptz  not null default now()
);

-- ── 3. Community replies ─────────────────────────────────────
create table if not exists public.community_replies (
  id          uuid         primary key default uuid_generate_v4(),
  post_id     uuid         not null references public.community_posts(id) on delete cascade,
  user_id     uuid         not null references public.users(id) on delete cascade,
  body        text         not null,
  likes_count integer      not null default 0,
  created_at  timestamptz  not null default now()
);

-- ── 4. Community likes (one per user per post) ───────────────
create table if not exists public.community_likes (
  user_id   uuid  not null references public.users(id) on delete cascade,
  post_id   uuid  not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ── 5. Row Level Security ────────────────────────────────────
alter table public.community_posts   enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_likes   enable row level security;

-- Posts: any logged-in user can read; author or admin can delete; author can update
drop policy if exists "community_posts_read"   on public.community_posts;
drop policy if exists "community_posts_insert" on public.community_posts;
drop policy if exists "community_posts_update" on public.community_posts;
drop policy if exists "community_posts_delete" on public.community_posts;

create policy "community_posts_read" on public.community_posts
  for select using (auth.uid() is not null);

create policy "community_posts_insert" on public.community_posts
  for insert with check (auth.uid() = user_id);

create policy "community_posts_update" on public.community_posts
  for update using (
    auth.uid() = user_id
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "community_posts_delete" on public.community_posts
  for delete using (
    auth.uid() = user_id
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Replies: any logged-in user can read; author can delete
drop policy if exists "community_replies_read"   on public.community_replies;
drop policy if exists "community_replies_insert" on public.community_replies;
drop policy if exists "community_replies_delete" on public.community_replies;

create policy "community_replies_read" on public.community_replies
  for select using (auth.uid() is not null);

create policy "community_replies_insert" on public.community_replies
  for insert with check (auth.uid() = user_id);

create policy "community_replies_delete" on public.community_replies
  for delete using (auth.uid() = user_id);

-- Likes
drop policy if exists "community_likes_read"   on public.community_likes;
drop policy if exists "community_likes_insert" on public.community_likes;
drop policy if exists "community_likes_delete" on public.community_likes;

create policy "community_likes_read" on public.community_likes
  for select using (auth.uid() is not null);

create policy "community_likes_insert" on public.community_likes
  for insert with check (auth.uid() = user_id);

create policy "community_likes_delete" on public.community_likes
  for delete using (auth.uid() = user_id);

-- ── 6. Indexes for performance ───────────────────────────────
create index if not exists idx_community_posts_created   on public.community_posts (created_at desc);
create index if not exists idx_community_posts_category  on public.community_posts (category);
create index if not exists idx_community_posts_user      on public.community_posts (user_id);
create index if not exists idx_community_replies_post    on public.community_replies (post_id);
create index if not exists idx_community_likes_post      on public.community_likes (post_id);
create index if not exists idx_community_likes_user      on public.community_likes (user_id);
