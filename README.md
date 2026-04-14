# Amharican — Amharic Language Learning Web App

Duolingo-inspired Amharic learning platform for the Ethiopian diaspora, tourists, and diplomatic staff.

**Stack:** React.js + Vite + Tailwind CSS + Supabase

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/amharican.git
cd amharican
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard → **SQL Editor**, run these files in order:
   - `supabase/schema.sql` — creates all tables + RLS policies
   - `supabase/seed.sql` — loads 3 units, 7 lessons, 30+ exercises, 25 vocab words

3. In Supabase → **Authentication → Providers**, enable **Google OAuth**
   - Add your Google Client ID and Secret
   - Set redirect URL to `http://localhost:5173` (dev) and your production URL

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: Supabase → Settings → API

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Make yourself an admin

After signing up, run this in Supabase SQL Editor:

```sql
update public.users
set role = 'admin'
where email = 'your@email.com';
```

Then go to `/admin` to manage units, lessons, exercises, and vocabulary.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute, AdminRoute
│   ├── layout/        # AppLayout (sidebar + mobile nav)
│   ├── lesson/        # MultipleChoice, WordMatch, ListenSelect
│   └── ui/            # XpBadge, StreakBadge, ProgressBar
├── hooks/
│   └── useTTS.js      # Text-to-speech (browser + audio URL)
├── lib/
│   └── supabase.js    # Supabase client
├── pages/
│   ├── Landing.jsx    # Public landing page
│   ├── Login.jsx      # Email + Google auth
│   ├── Signup.jsx     # Registration
│   ├── Onboarding.jsx # 3-step new user setup
│   ├── Dashboard.jsx  # Skill tree + stats
│   ├── LessonPage.jsx # Exercise engine (hearts, XP, results)
│   ├── Profile.jsx    # Stats + streak heatmap
│   ├── Admin.jsx      # CMS for content team
│   └── NotFound.jsx
├── store/
│   ├── useAuthStore.js   # Auth + profile state (Zustand)
│   └── useLessonStore.js # Units, progress, lesson completion
└── index.css          # Tailwind + custom styles

supabase/
├── schema.sql  # All tables + RLS policies
└── seed.sql    # 3 units, 7 lessons, exercises, vocabulary
```

---

## Exercise Types

| Type | Description |
|------|-------------|
| `multiple_choice` | Show Amharic word → pick English meaning from 4 options |
| `word_match` | Match 4 Amharic words to their English translations |
| `listen_select` | Play TTS audio → pick the matching Amharic word |

### Adding exercises via Admin CMS

1. Sign in with your admin account
2. Go to `/admin`
3. Create a Unit → add Lessons → add Exercises to each lesson

**Options format:**
- Multiple choice: `["Hello","Goodbye","Thank you","Please"]`
- Word match: `[{"am":"ሰላም","en":"Hello"},{"am":"አዎ","en":"Yes"}]`
- Listen & select: `["ሰላም","ደህና ሁን","አዎ","አይ"]`

---

## Audio (TTS)

The app uses the **browser's built-in SpeechSynthesis API** as a fallback for Amharic audio.

To use **Google Cloud TTS** (better quality):
1. Generate audio clips using the Google Cloud TTS API with language `am-ET`
2. Upload `.mp3` files to Supabase Storage
3. Set the `audio_url` field on each exercise row

---

## Amharic Font

The app uses **Noto Sans Ethiopic** from Google Fonts, loaded in `index.html`.

Always apply `font-amharic` class or `font-family: 'Noto Sans Ethiopic'` to any Amharic text element.

Test that `ሰላም` renders correctly on all target browsers before deploying.
