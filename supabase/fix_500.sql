-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Fix 500 Error
-- Run this ENTIRE file in Supabase → SQL Editor → Run
-- It drops ALL existing policies on users table and rebuilds
-- them cleanly. Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════

-- Step 1: Drop every policy on the users table (all possible names)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where tablename = 'users' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.users', pol.policyname);
  end loop;
end$$;

-- Step 2: Make sure RLS is enabled
alter table public.users enable row level security;

-- Step 3: Create clean, simple policies

-- Anyone authenticated can read their own row
create policy "users_select_own"
  on public.users
  for select
  using (auth.uid() = id);

-- Anyone authenticated can insert their own row
create policy "users_insert_own"
  on public.users
  for insert
  with check (auth.uid() = id);

-- Anyone authenticated can update their own row
create policy "users_update_own"
  on public.users
  for update
  using (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- Step 4: Fix the trigger (recreate cleanly)
-- ═══════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════
-- Step 5: Make yourself admin
-- IMPORTANT: replace the email below with YOUR email
-- ═══════════════════════════════════════════════════════════

update public.users
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';

-- Verify it worked — you should see your row with role = admin
select id, email, name, role from public.users;
