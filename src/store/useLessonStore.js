import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useLessonStore = create((set, get) => ({
  units:    [],
  progress: [],   // { lesson_id, completed_at, xp_earned, errors_count }[]
  loading:  false,

  fetchUnits: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('units')
      .select(`
        id, title_en, title_am, order_index, is_published,
        lessons (
          id, title_en, title_am, order_index, xp_reward, is_published
        )
      `)
      .eq('is_published', true)
      .order('order_index')
    if (!error) set({ units: data || [] })
    set({ loading: false })
  },

  fetchProgress: async (userId) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, completed_at, xp_earned, errors_count')
      .eq('user_id', userId)
    if (!error) set({ progress: data || [] })
  },

  markLessonComplete: async (userId, lessonId, xpEarned, errors) => {
    if (!userId || !lessonId) return

    // 1. Save / update progress row
    const { error: pErr } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id:      userId,
          lesson_id:    lessonId,
          completed_at: new Date().toISOString(),
          xp_earned:    xpEarned,
          errors_count: errors,
        },
        { onConflict: 'user_id,lesson_id' }
      )
    if (pErr) console.error('progress upsert:', pErr.message)

    // 2. Record today's streak
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('user_streaks')
      .upsert(
        { user_id: userId, date: today, xp_earned: xpEarned },
        { onConflict: 'user_id,date' }
      )

    // 3. Update user XP + streak counter
    const { data: profile } = await supabase
      .from('users')
      .select('xp, streak_count, last_active_at')
      .eq('id', userId)
      .single()

    if (profile) {
      const lastDate  = profile.last_active_at
        ? new Date(profile.last_active_at).toISOString().split('T')[0]
        : null
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

      let newStreak = 1
      if (lastDate === today)       newStreak = profile.streak_count || 1
      else if (lastDate === yesterday) newStreak = (profile.streak_count || 0) + 1

      await supabase.from('users').update({
        xp:             (profile.xp || 0) + xpEarned,
        streak_count:   newStreak,
        last_active_at: new Date().toISOString(),
      }).eq('id', userId)
    }

    // 4. Refresh local progress so dashboard re-renders correctly
    await get().fetchProgress(userId)
  },
}))
