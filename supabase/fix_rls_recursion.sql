-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Fix RLS Infinite Recursion
-- Run this in Supabase Dashboard → SQL Editor
-- This fixes the 500 error caused by RLS policies on the
-- users table querying the users table (infinite loop).
-- ═══════════════════════════════════════════════════════════

-- 1. Drop ALL existing policies on users table
drop policy if exists "users_select"        on public.users;
drop policy if exists "users_insert"        on public.users;
drop policy if exists "users_update"        on public.users;
drop policy if exists "users_select_own"    on public.users;
drop policy if exists "users_insert_own"    on public.users;
drop policy if exists "users_update_own"    on public.users;
drop policy if exists "users_admin_select"  on public.users;
drop policy if exists "users_admin_update"  on public.users;

-- 2. Create a security definer function to check admin role
--    This breaks the recursion — it runs outside RLS context
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3. Simple non-recursive policies

-- SELECT: own row OR admin (using the function, not inline subquery)
create policy "users_select"
  on public.users
  for select
  using (
    auth.uid() = id
    or public.is_admin()
  );

-- INSERT: own row only (no recursion risk here)
create policy "users_insert"
  on public.users
  for insert
  with check (auth.uid() = id);

-- UPDATE: own row OR admin
create policy "users_update"
  on public.users
  for update
  using (
    auth.uid() = id
    or public.is_admin()
  );

-- DELETE: admin only
create policy "users_delete"
  on public.users
  for delete
  using (public.is_admin());
