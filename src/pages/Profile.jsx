import { useState, useEffect, useRef } from 'react'
import { Link }         from 'react-router-dom'
import { supabase }     from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout        from '@/components/layout/AppLayout'
import { ProgressBar }  from '@/components/ui/ProgressBar'
import { Zap, Flame, BookOpen, Award, Save, ChevronRight, Settings, Pencil } from 'lucide-react'
import clsx from 'clsx'
import AvatarEditor, { AvatarDisplay } from '@/components/AvatarEditor'

const LEVEL_PCT = { A1: 15, 'A1+': 35, A2: 55, B1: 75, B2: 95 }
const GOAL_OPTIONS = [5, 10, 15, 20, 30]

export default function Profile() {
  const { user, profile, refreshProfile } = useAuthStore()

  const [name,        setName]        = useState('')
  const [goalMinutes, setGoalMinutes] = useState(10)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [streakDays,  setStreakDays]  = useState([])
  const [lessonCount, setLessonCount] = useState(0)
  const [showSettings,setShowSettings]= useState(false)
  const [avatarUrl,   setAvatarUrl]   = useState(null)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setGoalMinutes(profile.goal_minutes || 10)
      setAvatarUrl(profile.avatar_url || null)
    }
  }, [profile])

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      // Streak heatmap — last 35 days (5 weeks)
      const { data: s } = await supabase
        .from('user_streaks').select('date').eq('user_id', user.id)
      const active = new Set((s || []).map(d => d.date))
      const days = []
      for (let i = 34; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000)
        const str = d.toISOString().split('T')[0]
        days.push({ date: str, active: active.has(str), day: d.getDate() })
      }
      setStreakDays(days)

      // Lesson count
      const { count } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setLessonCount(count || 0)
    }
    load()
  }, [user?.id])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('users')
      .update({ name: name.trim(), goal_minutes: goalMinutes })
      .eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const levelPct  = LEVEL_PCT[profile?.level || 'A1'] || 15
  const initials  = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Profile</h1>
          <button onClick={() => setShowSettings(s => !s)}
            className={clsx('w-9 h-9 rounded-2xl flex items-center justify-center transition-colors',
              showSettings ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')}>
            <Settings size={17} strokeWidth={1.9} />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="card p-5 mb-4 flex items-center gap-4">
          {/* Clickable avatar — opens avatar editor */}
          <div className="relative shrink-0 group cursor-pointer" onClick={() => setShowAvatarEditor(true)}>
            <AvatarDisplay avatarUrl={avatarUrl} initials={initials} size={56} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white group-hover:bg-green-600 transition-colors">
              <Pencil size={11} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input py-2.5 text-[16px] font-semibold mb-1"
              placeholder="Your name"
            />
            <p className="text-[12px] text-stone-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] shrink-0',
              saved
                ? 'bg-brand-50 text-brand-600'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            )}>
            <Save size={13} />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Level card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] text-stone-400 font-medium">Current Level</p>
              <p className="text-[24px] font-bold text-stone-900 leading-none mt-0.5">
                {profile?.level || 'A1'}
              </p>
            </div>
            <div className="w-11 h-11 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Award size={20} className="text-brand-500" strokeWidth={1.8} />
            </div>
          </div>
          <ProgressBar value={levelPct} max={100} height="h-2" />
          <div className="flex justify-between text-[11px] text-stone-300 mt-1.5">
            {['A1', 'A1+', 'A2', 'B1', 'B2'].map(l => (
              <span key={l} className={profile?.level === l ? 'text-brand-500 font-bold' : ''}>{l}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Zap,      label: 'Total XP',     value: profile?.xp || 0,            bg: 'bg-amber-50',  ic: 'text-amber-500'  },
            { icon: Flame,    label: 'Day Streak',   value: `${profile?.streak_count || 0}d`, bg: 'bg-orange-50', ic: 'text-orange-500' },
            { icon: BookOpen, label: 'Lessons Done', value: lessonCount,                   bg: 'bg-brand-50', ic: 'text-brand-600' },
            { icon: Award,    label: 'Daily Goal',   value: `${profile?.goal_minutes || 10} min`, bg: 'bg-purple-50', ic: 'text-purple-500' },
          ].map(({ icon: Icon, label, value, bg, ic }) => (
            <div key={label} className={clsx('rounded-2xl p-4', bg)}>
              <Icon size={17} className={clsx(ic, 'mb-2')} strokeWidth={1.9} />
              <p className="text-[22px] font-bold text-stone-900 leading-none">{value}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="card p-5 mb-4 animate-rise">
            <p className="font-bold text-[15px] text-stone-900 mb-4">Settings</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-2">Daily Goal</label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_OPTIONS.map(min => (
                    <button key={min} onClick={() => setGoalMinutes(min)}
                      className={clsx(
                        'px-4 py-2 rounded-xl text-[13px] font-semibold transition-all',
                        goalMinutes === min
                          ? 'bg-brand-500 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      )}>
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1">Learning reason</label>
                <p className="text-[13px] text-stone-400 capitalize">{profile?.learning_reason || 'Not set'}</p>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Streak heatmap */}
        <div className="card p-5 mb-4">
          <p className="font-bold text-[15px] text-stone-900 mb-1 tracking-tight">Activity</p>
          <p className="text-[12px] text-stone-400 mb-4">Days you practiced — last 5 weeks</p>
          <div className="grid grid-cols-7 gap-1.5">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-stone-300 font-medium pb-1">{d}</div>
            ))}
            {/* Pad start to align with correct weekday */}
            {Array.from({ length: new Date(streakDays[0]?.date + 'T00:00').getDay() === 0 ? 6 : new Date(streakDays[0]?.date + 'T00:00').getDay() - 1 }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {streakDays.map(({ date, active }) => (
              <div key={date} title={date}
                className={clsx(
                  'aspect-square rounded-md transition-all',
                  active ? 'bg-brand-500 shadow-sm' : 'bg-stone-100'
                )} />
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card overflow-hidden">
          {[
            { to: '/achievements', label: 'Achievements',  sub: 'View your earned badges'   },
            { to: '/leaderboard',  label: 'Leaderboard',   sub: 'See how you rank globally'  },
            { to: '/vocabulary',   label: 'Vocabulary',    sub: 'Review all learned words'   },
            { to: '/practice',     label: 'Practice',      sub: 'Quick drills & flashcards'  },
          ].map(({ to, label, sub }) => (
            <Link key={to} to={to}
              className="flex items-center justify-between px-5 py-4 border-b last:border-b-0 border-stone-50 hover:bg-stone-50 transition-colors group">
              <div>
                <p className="text-[14px] font-semibold text-stone-800">{label}</p>
                <p className="text-[12px] text-stone-400">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-stone-200 group-hover:text-stone-400 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="h-6" />
      </div>

      {showAvatarEditor && (
        <AvatarEditor
          onClose={() => setShowAvatarEditor(false)}
          onSave={(cfg) => {
            setAvatarUrl(JSON.stringify({ type: 'avatarConfig', config: cfg }))
            setShowAvatarEditor(false)
          }}
        />
      )}
    </AppLayout>
  )
}