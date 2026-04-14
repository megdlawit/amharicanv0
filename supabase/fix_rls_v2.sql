-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — RLS Complete Fix v2
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Fixes 500 error caused by recursive RLS policies
-- ═══════════════════════════════════════════════════════════

-- ── 1. Drop ALL policies on users (every possible name) ────
do $$ declare
  pol record;
begin
  for pol in
    select policyname from pg_policies where tablename = 'users' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.users', pol.policyname);
  end loop;
end $$;

-- ── 2. Drop ALL policies on other tables ───────────────────
do $$ declare
  pol record;
begin
  for pol in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
    and tablename in ('units','lessons','exercises','vocabulary','user_progress','user_streaks')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ── 3. Rebuild users RLS — NO self-referencing subqueries ──
alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── 4. Rebuild other tables — simple auth check only ───────
alter table public.units          enable row level security;
alter table public.lessons        enable row level security;
alter table public.exercises      enable row level security;
alter table public.vocabulary     enable row level security;
alter table public.user_progress  enable row level security;
alter table public.user_streaks   enable row level security;

-- Units: any logged-in user can read & write (admin managed in app)
create policy "units_all"      on public.units      for all using (auth.uid() is not null);
create policy "lessons_all"    on public.lessons    for all using (auth.uid() is not null);
create policy "exercises_all"  on public.exercises  for all using (auth.uid() is not null);
create policy "vocab_all"      on public.vocabulary for all using (auth.uid() is not null);

-- Progress: own rows only
create policy "progress_own"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "streaks_own"
  on public.user_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 5. Fix trigger ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, xp, streak_count, role, level, goal_minutes)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    0, 0, 'user', 'A1', 10
  )
  on conflict (id) do update
    set email = excluded.email,
        name  = coalesce(nullif(excluded.name,''), public.users.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6. Set your admin account ──────────────────────────────
-- Replace the email below with yours and uncomment:
-- update public.users set role = 'admin' where email = 'your@email.com';
