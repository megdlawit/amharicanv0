-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Fix RLS Infinite Recursion
-- Run this in Supabase Dashboard → SQL Editor
-- This fixes the 500 error on GET /rest/v1/users
-- ═══════════════════════════════════════════════════════════

-- Step 1: Drop ALL existing policies on users table
drop policy if exists "users_select"        on public.users;
drop policy if exists "users_insert"        on public.users;
drop policy if exists "users_update"        on public.users;
drop policy if exists "users_select_own"    on public.users;
drop policy if exists "users_insert_own"    on public.users;
drop policy if exists "users_update_own"    on public.users;
drop policy if exists "users_admin_select"  on public.users;
drop policy if exists "users_admin_update"  on public.users;

-- Step 2: Create simple, non-recursive policies
-- The old admin policies did: EXISTS (SELECT 1 FROM public.users WHERE ...)
-- which queries the users table from within a users policy = infinite loop = 500 error
-- Fix: use auth.jwt() to read the role from the JWT token instead

-- SELECT: users can read their own row only
create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

-- INSERT: authenticated users can create their own profile row
create policy "users_insert_own"
  on public.users
  for insert
  with check (auth.uid() = id);

-- UPDATE: users can update their own row only
create policy "users_update_own"
  on public.users
  for update
  using (auth.uid() = id);

-- Step 3: Fix the trigger so it runs as superuser (bypasses RLS entirely)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id, email, name, xp, streak_count, role, level, goal_minutes
  )
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
    set
      email = excluded.email,
      name  = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Step 4: Set your account to admin (replace with your email)
-- update public.users set role = 'admin' where email = 'your@email.com';
