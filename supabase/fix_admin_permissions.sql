-- ═══════════════════════════════════════════════════════════
-- AMHARICAN — Fix Admin Permissions RLS (run this in Supabase)
-- The previous policies caused infinite recursion.
-- This uses a SECURITY DEFINER function to safely check role.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Create a helper function that checks role WITHOUT triggering RLS ──
-- SECURITY DEFINER means it runs as the DB owner, bypassing RLS on users table
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid() limit 1;
$$;

-- ── 2. Drop ALL existing user policies (fresh start) ─────────
drop policy if exists "users_select_own"                on public.users;
drop policy if exists "users_insert_own"                on public.users;
drop policy if exists "users_update_own"                on public.users;
drop policy if exists "users_admin_select"              on public.users;
drop policy if exists "users_admin_update"              on public.users;
drop policy if exists "users_admin_update_permissions"  on public.users;

-- ── 3. Recreate policies using the safe helper function ──────

-- Anyone can read their own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Admins can read ALL rows (needed for admin panel user list)
create policy "users_admin_select" on public.users
  for select using (public.get_my_role() = 'admin');

-- Users can insert their own row (signup trigger)
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

-- Users can update their OWN row (profile settings)
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Admins can update ANY row (grant/revoke admin, set permissions)
create policy "users_admin_update" on public.users
  for update using (public.get_my_role() = 'admin');

-- ── 4. Make sure admin_permissions column exists ─────────────
alter table public.users
  add column if not exists admin_permissions jsonb;

-- ── 5. Verify ────────────────────────────────────────────────
select 'Admin permissions fix applied ✓' as status;

-- ── 6. RPC function for admin to update any user (bypasses RLS) ──
create or replace function public.admin_update_user_role(
  target_user_id   uuid,
  new_role         text    default null,
  new_permissions  jsonb   default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Only allow if calling user is an admin
  if (select role from public.users where id = auth.uid()) != 'admin' then
    raise exception 'Access denied: caller is not an admin';
  end if;

  update public.users
  set
    role               = coalesce(new_role, role),
    admin_permissions  = coalesce(new_permissions, admin_permissions)
  where id = target_user_id;
end;
$$;

-- Grant execute to authenticated users (the function itself checks admin role)
grant execute on function public.admin_update_user_role to authenticated;

select 'RPC function created ✓' as status;
