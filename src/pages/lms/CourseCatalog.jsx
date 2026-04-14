import { useEffect } from 'react'
import { Link }       from 'react-router-dom'
import AppLayout      from '@/components/layout/AppLayout'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useLessonStore } from '@/store/useLessonStore'
import { useAuthStore }   from '@/store/useAuthStore'
import { BookOpen, ChevronRight, Lock, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

const UNIT_COLORS = [
  { dot: 'bg-brand-500', bar: 'bg-brand-500', icon: 'bg-brand-500' },
  { dot: 'bg-blue-500',   bar: 'bg-blue-500',   icon: 'bg-blue-500'   },
  { dot: 'bg-purple-500', bar: 'bg-purple-500',  icon: 'bg-purple-500' },
  { dot: 'bg-amber-500',  bar: 'bg-amber-500',   icon: 'bg-amber-500'  },
  { dot: 'bg-pink-500',   bar: 'bg-pink-500',    icon: 'bg-pink-500'   },
]

export default function CourseCatalog() {
  const { user } = useAuthStore()
  const { units, progress, loading, fetchUnits, fetchProgress } = useLessonStore()

  useEffect(() => { fetchUnits() }, [])
  useEffect(() => { if (user?.id) fetchProgress(user.id) }, [user?.id])

  const completedIds = new Set(progress.map(p => p.lesson_id))

  const totalLessons = units.reduce((n, u) => n + (u.lessons?.length || 0), 0)
  const totalDone    = units.reduce((n, u) =>
    n + (u.lessons || []).filter(l => completedIds.has(l.id)).length, 0)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Courses</h1>
          <p className="text-stone-400 text-sm mt-0.5">Your complete Amharic learning path</p>
        </div>

        {/* Overall progress card */}
        <div className="card-inset p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-brand-500 rounded-2xl flex items-center justify-center shrink-0">
              <BookOpen size={19} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-[14px] font-semibold text-stone-800">Amharic — A1 to B1</p>
                <p className="text-[13px] text-stone-400 shrink-0 ml-2">{totalDone}/{totalLessons}</p>
              </div>
              <ProgressBar value={totalDone} max={totalLessons} height="h-2" />
              <p className="text-[11px] text-stone-400 mt-1.5">
                {units.length} units · {totalLessons} lessons
              </p>
            </div>
          </div>
        </div>

        {/* Units list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-[88px] rounded-3xl" />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={32} className="text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-stone-500">No courses published yet</p>
            <p className="text-sm text-stone-400 mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit, ui) => {
              const lessons     = (unit.lessons || [])
                .filter(l => l.is_published !== false)
                .sort((a, b) => a.order_index - b.order_index)

              const done        = lessons.filter(l => completedIds.has(l.id)).length
              const total       = lessons.length
              const pct         = total ? Math.round((done / total) * 100) : 0
              const allDone     = done === total && total > 0

              const prevUnit    = units[ui - 1]
              const prevLessons = (prevUnit?.lessons || []).filter(l => l.is_published !== false)
              const unlocked    = ui === 0 || prevLessons.every(l => completedIds.has(l.id))

              const colors      = UNIT_COLORS[ui % UNIT_COLORS.length]

              return (
                <Link
                  key={unit.id}
                  to={unlocked ? `/courses/${unit.id}` : '#'}
                  className={clsx(
                    'card p-5 flex items-center gap-4 transition-all duration-200 group',
                    unlocked ? 'hover:shadow-lifted cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Icon */}
                  <div className={clsx(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200',
                    colors.icon,
                    unlocked && 'group-hover:scale-105'
                  )}>
                    {allDone ? (
                      <CheckCircle2 size={22} className="text-white" strokeWidth={2.5} />
                    ) : !unlocked ? (
                      <Lock size={18} className="text-white/60" strokeWidth={1.8} />
                    ) : (
                      <span className="am text-white text-xl font-bold leading-none">
                        {unit.title_am?.[0] || 'ሀ'}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-[15px] text-stone-900 truncate">{unit.title_en}</p>
                      <span className="text-[12px] text-stone-400 shrink-0 ml-3">{done}/{total}</span>
                    </div>

                    {unit.title_am && (
                      <p className="am text-[13px] text-stone-400 mb-2 leading-tight">{unit.title_am}</p>
                    )}

                    <ProgressBar
                      value={done}
                      max={total}
                      height="h-1.5"
                      color={allDone ? 'bg-brand-500' : colors.bar}
                    />

                    <p className="text-[11px] text-stone-400 mt-1.5">
                      {!unlocked
                        ? 'Complete previous unit to unlock'
                        : allDone
                          ? '✓ Complete'
                          : `${total - done} lesson${total - done !== 1 ? 's' : ''} remaining`
                      }
                    </p>
                  </div>

                  {/* Arrow */}
                  {unlocked && (
                    <ChevronRight
                      size={16}
                      className="text-stone-300 group-hover:text-stone-500 shrink-0 transition-colors"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        <div className="h-6" />
      </div>
    </AppLayout>
  )
}
