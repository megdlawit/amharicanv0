import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle2, BookOpen, Flame, Zap, Target, Star, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuthStore }   from '@/store/useAuthStore'
import { useLessonStore } from '@/store/useLessonStore'
import AppLayout from '@/components/layout/AppLayout'
import clsx from 'clsx'

const UNIT_PALETTES = [
  { grad: 'from-blue-500 to-blue-600',   shadow: '#1d4ed8', ring: 'ring-blue-300',   dot: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  { grad: 'from-violet-500 to-violet-600', shadow: '#5b21b6', ring: 'ring-violet-300', dot: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  { grad: 'from-emerald-500 to-emerald-600', shadow: '#065f46', ring: 'ring-emerald-300', dot: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { grad: 'from-amber-500 to-orange-500',  shadow: '#b45309', ring: 'ring-amber-300',   dot: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
  { grad: 'from-rose-500 to-rose-600',    shadow: '#9f1239', ring: 'ring-rose-300',    dot: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-200' },
]

function LessonBubble({ lesson, status, palette, index }) {
  const base = 'w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all duration-200 select-none shrink-0 relative'

  if (status === 'completed') return (
    <Link to={`/lesson/${lesson.id}`}
      className={clsx(base, `bg-gradient-to-br ${palette.grad}`, 'shadow-lg hover:scale-110 active:scale-95 ring-4 ring-white')}
      style={{ boxShadow: `0 4px 0 ${palette.shadow}40, 0 6px 16px ${palette.shadow}30` }}>
      <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
    </Link>
  )

  if (status === 'unlocked') return (
    <Link to={`/lesson/${lesson.id}`}
      className={clsx(base, 'bg-white border-[3px] hover:scale-110 active:scale-95 animate-ring-pulse ring-4 ring-white')}
      style={{ borderColor: `var(--brand)`, boxShadow: '0 4px 0 rgba(21,101,232,0.25), 0 6px 20px rgba(21,101,232,0.2)' }}>
      <span className="am font-black text-2xl text-brand-500 leading-none">
        {lesson.title_am?.[0] || 'ሀ'}
      </span>
    </Link>
  )

  return (
    <div className={clsx(base, 'bg-stone-100 border-2 border-dashed border-stone-200 cursor-not-allowed')}>
      <Lock size={18} className="text-stone-300" strokeWidth={2} />
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuthStore()
  const { units, progress, loading, fetchUnits, fetchProgress } = useLessonStore()

  useEffect(() => { fetchUnits() }, [])
  useEffect(() => { if (user?.id) fetchProgress(user.id) }, [user?.id])

  const completedIds = new Set(progress.map(p => p.lesson_id))
  const totalLessons = units.reduce((n, u) => n + (u.lessons?.length || 0), 0)
  const doneCount    = completedIds.size
  const pct          = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0
  const zigzag       = [0, 48, 96, 140, 96, 48, 0]
  const firstName    = profile?.name?.split(' ')[0] || null

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8 animate-rise">

        {/* ── Hero greeting ── */}
        <div className="mb-6 relative overflow-hidden rounded-3xl p-6 tilet-bg"
          style={{ background: 'linear-gradient(135deg, #1565E8 0%, #0f4bc9 60%, #0a3496 100%)', boxShadow: '0 6px 0 #0a3496, 0 10px 30px rgba(21,101,232,0.3)' }}>
          {/* Decorative Amharic letters */}
          <div className="absolute right-4 top-2 am text-[80px] text-white/8 select-none font-black leading-none">ሀ</div>
          <div className="absolute right-16 bottom-0 am text-[50px] text-white/6 select-none font-black leading-none">ለ</div>
          <div className="relative">
            <p className="text-blue-200 text-[12px] font-bold uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
            </p>
            <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
              {greeting}{firstName ? `, ${firstName}` : ''}! 👋
            </h1>
            <p className="text-blue-200 text-[13px] mt-1.5 font-medium">
              {profile?.streak_count > 0
                ? `🔥 You're on a ${profile.streak_count}-day streak — incredible!`
                : 'Start your first lesson to ignite your streak!'}
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { emoji:'🔥', value: profile?.streak_count || 0, label:'Day streak',  bg:'from-orange-50 to-amber-50',  border:'border-orange-100', val_color:'text-orange-500' },
            { emoji:'⚡', value: profile?.xp || 0,            label:'Total XP',    bg:'from-amber-50 to-yellow-50',  border:'border-amber-100',  val_color:'text-amber-500' },
            { emoji:'🎯', value: doneCount,                   label:'Completed',   bg:'from-blue-50 to-indigo-50',   border:'border-blue-100',   val_color:'text-blue-500' },
          ].map(({ emoji, value, label, bg, border, val_color }) => (
            <div key={label} className={clsx('card-gamified p-4 text-center bg-gradient-to-b', bg, 'border', border)}>
              <span className="text-[22px] mb-1.5 block">{emoji}</span>
              <p className={clsx('text-[22px] font-extrabold leading-none', val_color)}>{value}</p>
              <p className="text-[10px] text-stone-400 font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Overall progress ── */}
        {totalLessons > 0 && (
          <div className="card p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-extrabold text-[15px] text-stone-900">Course Progress</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center">
                    <span className="text-[9px] font-black text-white">{profile?.level || 'A1'}</span>
                  </div>
                  <p className="text-[12px] text-stone-400 font-medium">Level {profile?.level || 'A1'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[28px] font-black text-brand-500">{pct}%</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-700 relative"
                style={{ width:`${pct}%`, background:'linear-gradient(90deg, #1565E8, #4d90fe)' }}>
                <div className="absolute inset-0 bg-white/20 rounded-full" style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 100%)' }} />
              </div>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">{doneCount} of {totalLessons} lessons complete</p>
          </div>
        )}

        {/* ── Skill tree ── */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-28" />)}
          </div>
        ) : units.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={36} className="text-stone-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-bold text-stone-400">No lessons yet</p>
            <p className="text-[13px] text-stone-300 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12 stagger-children">
            {units.map((unit, ui) => {
              const palette   = UNIT_PALETTES[ui % UNIT_PALETTES.length]
              const lessons   = [...(unit.lessons || [])]
                .filter(l => l.is_published !== false)
                .sort((a, b) => a.order_index - b.order_index)
              const unitDone  = lessons.filter(l => completedIds.has(l.id)).length
              const unitTotal = lessons.length
              const unitPct   = unitTotal ? Math.round((unitDone / unitTotal) * 100) : 0

              const prevUnit     = units[ui - 1]
              const prevLessons  = (prevUnit?.lessons || []).filter(l => l.is_published !== false)
              const prevAllDone  = prevLessons.every(l => completedIds.has(l.id))
              const unitUnlocked = ui === 0 || prevAllDone

              return (
                <div key={unit.id} className="animate-rise">
                  {/* Unit banner */}
                  <div className={clsx('rounded-3xl px-5 py-5 mb-8 relative overflow-hidden bg-gradient-to-br', palette.grad)}
                    style={{ boxShadow: `0 5px 0 ${palette.shadow}60, 0 8px 24px ${palette.shadow}25` }}>
                    {/* Tilet pattern overlay */}
                    <div className="absolute inset-0 tilet-bg opacity-20" />
                    {/* Decorative Amharic character */}
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                      <span className="am text-[72px] text-white/15 font-black select-none leading-none">
                        {unit.title_am?.[0] || 'ሀ'}
                      </span>
                    </div>
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.15em] mb-1">
                          Unit {ui + 1}
                        </p>
                        <p className="font-extrabold text-[19px] text-white leading-tight truncate">{unit.title_en}</p>
                        {unit.title_am && (
                          <p className="am text-[14px] text-white/70 mt-0.5">{unit.title_am}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[30px] font-black text-white leading-none">{unitPct}%</p>
                        <p className="text-[10px] text-white/60 font-semibold mt-0.5">{unitDone}/{unitTotal}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3.5 relative h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full transition-all duration-700"
                        style={{ width:`${unitPct}%` }} />
                    </div>
                  </div>

                  {/* Lesson bubbles — zigzag path */}
                  <div className="relative flex flex-col items-start gap-5 pl-4">
                    {/* Connector line */}
                    {lessons.length > 1 && (
                      <div className="absolute left-[calc(1rem+32px)] top-[32px] bottom-[32px] w-0.5 rounded-full"
                        style={{ background: 'repeating-linear-gradient(to bottom, #e0ddd6 0, #e0ddd6 6px, transparent 6px, transparent 12px)' }} />
                    )}

                    {lessons.map((lesson, li) => {
                      const done     = completedIds.has(lesson.id)
                      const prevDone = li === 0
                        ? unitUnlocked
                        : completedIds.has(lessons[li - 1].id) && unitUnlocked
                      const status   = done ? 'completed' : prevDone ? 'unlocked' : 'locked'
                      const mlValue  = zigzag[li % zigzag.length]

                      return (
                        <div key={lesson.id}
                          className="relative z-10 flex items-center gap-4"
                          style={{ marginLeft: mlValue }}>
                          <LessonBubble lesson={lesson} status={status} palette={palette} index={li} />
                          <div className="min-w-0">
                            <p className={clsx('font-bold text-[14px] leading-tight',
                              status === 'locked' ? 'text-stone-300' : 'text-stone-800')}>
                              {lesson.title_en}
                            </p>
                            {lesson.title_am && (
                              <p className={clsx('am text-[12px] mt-0.5',
                                status === 'locked' ? 'text-stone-200' : 'text-stone-400')}>
                                {lesson.title_am}
                              </p>
                            )}
                            {/* Status badge */}
                            {status === 'completed' && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600">
                                <CheckCircle2 size={10} strokeWidth={2.5} /> Done
                              </span>
                            )}
                            {status === 'unlocked' && (
                              <span className="xp-pill mt-1">
                                ⚡ +{lesson.xp_reward || 10} XP
                              </span>
                            )}
                            {status === 'locked' && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-stone-300">
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="h-8" />
      </div>
    </AppLayout>
  )
}