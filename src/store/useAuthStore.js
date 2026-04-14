import { create } from 'zustand'
import { supabase, supabaseReady } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  init: async () => {
    // If Supabase isn't configured, skip all auth network calls so the
    // landing page renders immediately without network errors or crashes.
    if (!supabaseReady) {
      set({ loading: false })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      }
    } catch (e) {
      console.warn('[Amharican] Supabase getSession failed:', e.message)
    }
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const prevUser = get().user
          if (prevUser?.id !== session.user.id) {
            set({ user: session.user, profile: null })
          } else {
            set({ user: session.user })
          }
          await get().fetchProfile(session.user.id)
        }
      }
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
    })
  },

  fetchProfile: async (userId) => {
    if (!userId || !supabaseReady) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      set({ profile: data })
      return
    }

    if (error) {
      const code = error?.code || ''
      const msg  = error?.message || ''

      if (msg.includes('500') || code === '500' || msg.includes('infinite recursion')) {
        console.error('[Amharican] DB error — run fix_policies_v3.sql', msg)
        set({ profile: { id: userId, role: 'user', xp: 0, streak_count: 0, level: 'A1', name: '' } })
        return
      }

      if (code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser()
        const name =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name      ||
          user?.email?.split('@')[0]     ||
          'Learner'

        const { data: created } = await supabase
          .from('users')
          .upsert(
            { id: userId, email: user?.email || '', name,
              xp: 0, streak_count: 0, role: 'user', level: 'A1', goal_minutes: 10 },
            { onConflict: 'id' }
          )
          .select()
          .single()

        if (created) set({ profile: created })
        else         set({ profile: { id: userId, role: 'user', xp: 0, streak_count: 0, level: 'A1', name } })
      }
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (user?.id) await get().fetchProfile(user.id)
  },

  signOut: async () => {
    set({ user: null, profile: null })
    if (supabaseReady) await supabase.auth.signOut()
  },
}))
