-- ═══════════════════════════════════════════════════════════════
-- Amharican v7 — Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. PHONE COLUMN ON USERS ────────────────────────────────
alter table public.users
  add column if not exists phone text;

-- ─── 2. ADMIN PERMISSIONS ────────────────────────────────────
alter table public.users
  add column if not exists admin_permissions jsonb default null;

-- ─── 3. VIDEO LESSONS TABLE ──────────────────────────────────
create table if not exists public.video_lessons (
  id              uuid         primary key default gen_random_uuid(),
  title_en        text         not null,
  title_am        text,
  description_en  text,
  video_url       text         not null,
  thumbnail_url   text,
  level           text         not null default 'A1',
  is_published    boolean      not null default false,
  created_at      timestamptz  not null default now()
);

alter table public.video_lessons enable row level security;

-- Learners see published videos only
create policy "videos_read_published" on public.video_lessons
  for select using (is_published = true);

-- Admins have full CRUD
create policy "videos_admin_all" on public.video_lessons
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- PHONE AUTH DASHBOARD SETUP (no SQL needed — dashboard only)
-- ═══════════════════════════════════════════════════════════════
--
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers
--
-- 1. Click "Phone" provider → toggle Enable
--
-- 2. Choose SMS Provider:
--    ┌─────────────┬────────────────────────────────────────────┐
--    │ Twilio      │ Most popular. Free trial: twilio.com       │
--    │ Vonage      │ Easy signup: vonage.com                    │
--    │ MessageBird │ Good for Africa/Ethiopia: messagebird.com  │
--    │ TextLocal   │ Budget option for Ethiopia numbers          │
--    └─────────────┴────────────────────────────────────────────┘
--
-- 3. For Twilio (recommended):
--    a. Sign up at twilio.com → get free $15 credit
--    b. Console → Account SID  (paste into Supabase)
--    c. Console → Auth Token   (paste into Supabase)
--    d. Phone Numbers → Buy a number  (or use trial number)
--    e. Paste "From" number into Supabase  (format: +15551234567)
--
-- 4. Save → test with your own phone number first
--
-- NOTE: During development you can use Supabase's built-in OTP
--       test numbers (no SMS sent). Go to:
--       Authentication → Users → "OTP Test Numbers" to add them.
-- ═══════════════════════════════════════════════════════════════
