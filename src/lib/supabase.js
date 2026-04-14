import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co'
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// App won't throw on startup if env vars are missing —
// auth calls return empty sessions and the user stays on the landing page.
export const supabase = createClient(supabaseUrl, supabaseKey)

// Expose whether real credentials are present
export const supabaseReady =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
