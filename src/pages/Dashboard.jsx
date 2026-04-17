import { useEffect } from 'react'
import { Link }        from 'react-router-dom'
import { Lock, CheckCircle2, BookOpen, Flame, Zap, Target, ChevronRight } from 'lucide-react'
import { useAuthStore }   from '@/store/useAuthStore'
import { useLessonStore } from '@/store/useLessonStore'
import AppLayout from '@/components/layout/AppLayout'
import clsx from 'clsx'

const UNIT_PALETTES = [
  { header:'bg-brand-500', ring:'ring-brand-300', dot:'bg-brand-500', light:'bg-brand-50', text:'text-brand-600' },
  { header:'bg-blue-500',   ring:'ring-blue-300',   dot:'bg-blue-500',   light:'bg-blue-50',   text:'text-blue-600'   },
  { header:'bg-violet-500', ring:'ring-violet-300', dot:'bg-violet-500', light:'bg-violet-50', text:'text-violet-600' },
  { header:'bg-amber-500',  ring:'ring-amber-300',  dot:'bg-amber-500',  light:'bg-amber-50',  text:'text-amber-600'  },
  { header:'bg-rose-500',   ring:'ring-rose-300',   dot:'bg-rose-500',   light:'bg-rose-50',   text:'text-rose-600'   },
]

function LessonBubble({ lesson, status, palette }) {
  const base = 'w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 select-none shrink-0'

  if (status === 'completed') return (
    <Link to={`/lesson/${lesson.id}`}
      className={clsx(base, palette.header, 'shadow-card hover:shadow-lifted hover:scale-105 ring-4', palette.ring.replace('ring-','ring-') + '/30')}>
      <CheckCircle2 size={24} className="text-white" strokeWidth={2.5} />
    </Link>
  )

  if (status === 'unlocked') return (
    <Link to={`/lesson/${lesson.id}`}
      className={clsx(base, 'bg-white border-[3px] shadow-lifted hover:scale-110 animate-ring-pulse',
        'border-' + palette.header.replace('bg-',''))}>
      <span className="am font-bold text-xl leading-none" style={{ color: 'var(--brand)' }}>
        {lesson.title_am?.[0] || 'ሀ'}
      </span>
    </Link>
  )

  return (
    <div className={clsx(base, 'bg-stone-100 border-2 border-dashed border-stone-200 cursor-not-allowed')}>
      <Lock size={16} className="text-stone-300" strokeWidth={2} />
    </div>
  )
}

export default function Dashboard() {
  const { user, profile }   = useAuthStore()
  const { units, progress, loading, fetchUnits, fetchProgress } = useLessonStore()

  useEffect(() => { fetchUnits() }, [])
  useEffect(() => { if (user?.id) fetchProgress(user.id) }, [user?.id])

  const completedIds = new Set(progress.map(p => p.lesson_id))
  const totalLessons = units.reduce((n, u) => n + (u.lessons?.length || 0), 0)
  const doneCount    = completedIds.size
  const pct          = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0
  const zigzag       = [0, 40, 80, 120, 80, 40, 0]

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8 animate-rise">

        {/* ── Greeting ── */}
        <div className="mb-7">
          <p className="text-[13px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-[28px] font-extrabold text-stone-900 tracking-tight leading-tight">
            {profile?.name ? `Selam, ${profile.name.split(' ')[0]}! 👋` : 'Selam! 👋'}
          </h1>
          <p className="text-[14px] text-stone-400 mt-1">
            {profile?.streak_count > 0
              ? `You're on a ${profile.streak_count}-day streak — keep going!`
              : 'Start your first lesson to begin your streak.'}
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: Flame,  value: profile?.streak_count || 0, label: 'Day streak', bg: 'bg-orange-50', ic: 'text-orange-400' },
            { icon: Zap,    value: profile?.xp || 0,           label: 'Total XP',   bg: 'bg-amber-50',  ic: 'text-amber-400' },
            { icon: Target, value: doneCount,                  label: 'Completed',  bg: 'bg-brand-50', ic: 'text-brand-500' },
          ].map(({ icon: Icon, value, label, bg, ic }) => (
            <div key={label} className={clsx('card-sm p-4 text-center', bg.replace('bg-','border-').replace('-50','-100/40'))}>
              <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2', bg)}>
                <Icon size={16} className={ic} strokeWidth={2.2} />
              </div>
              <p className="text-[20px] font-extrabold text-stone-900 leading-none">{value}</p>
              <p className="text-[11px] text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Overall progress ── */}
        {totalLessons > 0 && (
          <div className="card p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-[15px] text-stone-900">Overall Progress</p>
                <p className="text-[12px] text-stone-400 mt-0.5">Level {profile?.level || 'A1'}</p>
              </div>
              <span className="text-[22px] font-extrabold text-brand-500">{pct}%</span>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[12px] text-stone-400 mt-2">{doneCount} of {totalLessons} lessons complete</p>
          </div>
        )}

        {/* ── Skill tree ── */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : units.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={36} className="text-stone-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-stone-400">No lessons yet</p>
            <p className="text-[13px] text-stone-300 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12 stagger-children">
            {units.map((unit, ui) => {
              const palette  = UNIT_PALETTES[ui % UNIT_PALETTES.length]
              const lessons  = [...(unit.lessons || [])]
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
                  <div className={clsx('rounded-3xl px-5 py-4 mb-8 relative overflow-hidden', palette.header)}>
                    <div className="absolute inset-0 opacity-10">
                      <span className="am absolute text-white text-[80px] -right-4 -bottom-4 select-none">
                        {unit.title_am?.[0] || 'ሀ'}
                      </span>
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                          Unit {ui + 1}
                        </p>
                        <p className="font-extrabold text-[18px] text-white leading-tight">
                          {unit.title_en}
                        </p>
                        {unit.title_am && (
                          <p className="am text-[14px] text-white/70 mt-0.5">{unit.title_am}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[28px] font-extrabold text-white leading-none">{unitPct}%</p>
                        <p className="text-[11px] text-white/60 mt-0.5">{unitDone}/{unitTotal} done</p>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full transition-all duration-700"
                        style={{ width: `${unitPct}%` }} />
                    </div>
                  </div>

                  {/* Lesson bubbles — zigzag */}
                  <div className="relative flex flex-col items-start gap-5 pl-6">
                    {/* Connector line */}
                    {lessons.length > 1 && (
                      <div className="absolute left-[calc(1.5rem+30px)] top-[30px] bottom-[30px] w-0.5 bg-stone-200 rounded-full -z-0" />
                    )}

                    {lessons.map((lesson, li) => {
                      const done          = completedIds.has(lesson.id)
                      const prevDone      = li === 0
                        ? unitUnlocked
                        : completedIds.has(lessons[li - 1].id) && unitUnlocked
                      const status        = done ? 'completed' : prevDone ? 'unlocked' : 'locked'
                      const mlValue       = zigzag[li % zigzag.length]

                      return (
                        <div key={lesson.id}
                          className="relative z-10 flex items-center gap-4"
                          style={{ marginLeft: mlValue }}>
                          <LessonBubble lesson={lesson} status={status} palette={palette} />
                          <div>
                            <p className={clsx('font-semibold text-[14px] leading-tight',
                              status === 'locked' ? 'text-stone-300' : 'text-stone-800')}>
                              {lesson.title_en}
                            </p>
                            {lesson.title_am && (
                              <p className={clsx('am text-[12px] mt-0.5',
                                status === 'locked' ? 'text-stone-200' : 'text-stone-400')}>
                                {lesson.title_am}
                              </p>
                            )}
                            <p className={clsx('text-[11px] mt-0.5 font-semibold',
                              done ? 'text-brand-500' :
                              status === 'unlocked' ? 'text-amber-500' : 'text-stone-200')}>
                              {done ? '✓ Complete'
                               : status === 'unlocked' ? `+${lesson.xp_reward || 10} XP`
                               : '🔒 Locked'}
                            </p>
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

        <div className="h-6" />
      </div>
    </AppLayout>
  )
}
