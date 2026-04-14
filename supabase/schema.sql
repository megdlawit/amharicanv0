-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Supabase Schema v2
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── Drop existing tables (safe re-run) ────────────────────
drop table if exists public.user_streaks  cascade;
drop table if exists public.user_progress cascade;
drop table if exists public.vocabulary    cascade;
drop table if exists public.exercises     cascade;
drop table if exists public.lessons       cascade;
drop table if exists public.units         cascade;
drop table if exists public.users         cascade;

-- ─── USERS ──────────────────────────────────────────────────
create table public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  name             text,
  avatar_url       text,
  xp               integer      not null default 0,
  streak_count     integer      not null default 0,
  last_active_at   timestamptz,
  level            text         not null default 'A1',
  goal_minutes     integer      not null default 10,
  learning_reason  text,
  role             text         not null default 'user',
  created_at       timestamptz  not null default now()
);

-- ─── UNITS ──────────────────────────────────────────────────
create table public.units (
  id           uuid         primary key default uuid_generate_v4(),
  title_en     text         not null,
  title_am     text,
  description  text,
  order_index  integer      not null default 1,
  is_published boolean      not null default true,
  created_at   timestamptz  not null default now()
);

-- ─── LESSONS ────────────────────────────────────────────────
create table public.lessons (
  id           uuid         primary key default uuid_generate_v4(),
  unit_id      uuid         not null references public.units(id) on delete cascade,
  title_en     text         not null,
  title_am     text,
  order_index  integer      not null default 1,
  xp_reward    integer      not null default 10,
  is_published boolean      not null default true,
  created_at   timestamptz  not null default now()
);

-- ─── EXERCISES ──────────────────────────────────────────────
create table public.exercises (
  id             uuid         primary key default uuid_generate_v4(),
  lesson_id      uuid         not null references public.lessons(id) on delete cascade,
  type           text         not null check (type in ('multiple_choice','word_match','listen_select')),
  prompt_am      text         not null,
  prompt_en      text,
  romanization   text,
  options        jsonb        not null default '[]',
  correct_answer text         not null,
  audio_url      text,
  created_at     timestamptz  not null default now()
);

-- ─── VOCABULARY ─────────────────────────────────────────────
create table public.vocabulary (
  id            uuid         primary key default uuid_generate_v4(),
  word_am       text         not null,
  word_en       text         not null,
  romanization  text,
  audio_url     text,
  image_url     text,
  topic_tag     text,
  created_at    timestamptz  not null default now()
);

-- ─── USER PROGRESS ──────────────────────────────────────────
create table public.user_progress (
  id           uuid         primary key default uuid_generate_v4(),
  user_id      uuid         not null references public.users(id)   on delete cascade,
  lesson_id    uuid         not null references public.lessons(id)  on delete cascade,
  completed_at timestamptz  not null default now(),
  xp_earned    integer      not null default 0,
  errors_count integer      not null default 0,
  unique (user_id, lesson_id)
);

-- ─── USER STREAKS ───────────────────────────────────────────
create table public.user_streaks (
  id         uuid         primary key default uuid_generate_v4(),
  user_id    uuid         not null references public.users(id) on delete cascade,
  date       date         not null,
  xp_earned  integer      not null default 0,
  unique (user_id, date)
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.users          enable row level security;
alter table public.units          enable row level security;
alter table public.lessons        enable row level security;
alter table public.exercises      enable row level security;
alter table public.vocabulary     enable row level security;
alter table public.user_progress  enable row level security;
alter table public.user_streaks   enable row level security;

-- ── users ────────────────────────────────────────────────────
-- Users read/write their own row; admins read all
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Admin read-all (needed for admin panel user list)
create policy "users_admin_select" on public.users
  for select using (
    exists (
      select 1 from public.users u2
      where u2.id = auth.uid() and u2.role = 'admin'
    )
  );

create policy "users_admin_update" on public.users
  for update using (
    exists (
      select 1 from public.users u2
      where u2.id = auth.uid() and u2.role = 'admin'
    )
  );

-- ── units ─────────────────────────────────────────────────────
-- Any authenticated user can read published units
create policy "units_read_published" on public.units
  for select using (
    is_published = true and auth.uid() is not null
  );

-- Admin full access
create policy "units_admin_all" on public.units
  for all using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ── lessons ───────────────────────────────────────────────────
create policy "lessons_read_published" on public.lessons
  for select using (
    is_published = true and auth.uid() is not null
  );

create policy "lessons_admin_all" on public.lessons
  for all using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ── exercises ─────────────────────────────────────────────────
create policy "exercises_read" on public.exercises
  for select using (auth.uid() is not null);

create policy "exercises_admin_all" on public.exercises
  for all using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ── vocabulary ────────────────────────────────────────────────
create policy "vocab_read" on public.vocabulary
  for select using (auth.uid() is not null);

create policy "vocab_admin_all" on public.vocabulary
  for all using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ── user_progress ─────────────────────────────────────────────
create policy "progress_select_own" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "progress_insert_own" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "progress_update_own" on public.user_progress
  for update using (auth.uid() = user_id);

-- Admin read all progress (for dashboard stats)
create policy "progress_admin_select" on public.user_progress
  for select using (
    exists (
      select 1 from public.users where id = auth.uid() and role = 'admin'
    )
  );

-- ── user_streaks ──────────────────────────────────────────────
create policy "streaks_select_own" on public.user_streaks
  for select using (auth.uid() = user_id);

create policy "streaks_insert_own" on public.user_streaks
  for insert with check (auth.uid() = user_id);

create policy "streaks_upsert_own" on public.user_streaks
  for update using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- HELPER: auto-create user profile on signup
-- ═══════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
