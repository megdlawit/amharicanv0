import { useEffect, useState } from 'react'
import { useParams, Link }     from 'react-router-dom'
import { supabase }            from '@/lib/supabase'
import { useAuthStore }        from '@/store/useAuthStore'
import { useLessonStore }      from '@/store/useLessonStore'
import AppLayout               from '@/components/layout/AppLayout'
import { ProgressBar }         from '@/components/ui/ProgressBar'
import { ChevronLeft, Lock, CheckCircle2, PlayCircle, Zap } from 'lucide-react'
import clsx from 'clsx'

export default function CourseDetail() {
  const { id }  = useParams()
  const { user } = useAuthStore()
  const { progress, fetchProgress } = useLessonStore()
  const [unit, setUnit]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('units').select('*, lessons(*)').eq('id', id).single()
      setUnit(data); setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => { if (user?.id) fetchProgress(user.id) }, [user?.id])

  const completedIds = new Set(progress.map(p => p.lesson_id))

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  )
  if (!unit) return <AppLayout><div className="p-8 text-stone-400 text-center">Unit not found</div></AppLayout>

  const lessons = (unit.lessons||[]).filter(l=>l.is_published!==false).sort((a,b)=>a.order_index-b.order_index)
  const done    = lessons.filter(l => completedIds.has(l.id)).length

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Back */}
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-medium mb-6 transition-colors">
          <ChevronLeft size={16} /> All Courses
        </Link>

        {/* Unit hero */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-brand-500 to-brand-700 border-0">
          <p className="text-brand-200 text-[11px] font-bold uppercase tracking-widest mb-1">Course</p>
          <h1 className="text-[24px] font-bold text-white tracking-tight mb-1">{unit.title_en}</h1>
          {unit.title_am && <p className="am text-[18px] text-brand-200 mb-4">{unit.title_am}</p>}
          <div className="flex items-center justify-between text-[13px] mb-3">
            <span className="text-brand-200">{done} / {lessons.length} lessons</span>
            <span className="text-white font-semibold">{lessons.length ? Math.round((done/lessons.length)*100) : 0}%</span>
          </div>
          <ProgressBar value={done} max={lessons.length} height="h-2" color="bg-white/80" />
        </div>

        {/* Lessons list */}
        <div className="space-y-2.5">
          {lessons.map((lesson, li) => {
            const isDone    = completedIds.has(lesson.id)
            const prevDone  = li === 0 ? true : completedIds.has(lessons[li-1].id)
            const locked    = !isDone && !prevDone

            return (
              <div key={lesson.id}
                className={clsx('card p-4 flex items-center gap-4 transition-all duration-200',
                  locked ? 'opacity-50' : 'hover:shadow-lifted'
                )}
              >
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isDone ? 'bg-brand-500' : locked ? 'bg-stone-100' : 'bg-brand-50'
                )}>
                  {isDone   && <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />}
                  {locked   && <Lock size={16} className="text-stone-300" strokeWidth={1.8} />}
                  {!isDone && !locked && <span className="am text-brand-600 font-bold text-base">{lesson.title_am?.[0]||'ሀ'}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-stone-900">{lesson.title_en}</p>
                  {lesson.title_am && <p className="am text-[12px] text-stone-400">{lesson.title_am}</p>}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap size={11} className="text-amber-400" />
                    <span className="text-[11px] text-stone-400">+{lesson.xp_reward||10} XP</span>
                  </div>
                </div>

                {!locked && (
                  <Link to={`/lesson/${lesson.id}`}
                    className={clsx(
                      'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all',
                      isDone
                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                    )}
                  >
                    <PlayCircle size={14} />
                    {isDone ? 'Replay' : 'Start'}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
