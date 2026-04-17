import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }    from 'react-router-dom'
import { supabase }                  from '@/lib/supabase'
import { useAuthStore }              from '@/store/useAuthStore'
import { useLessonStore }            from '@/store/useLessonStore'
import MultipleChoice                from '@/components/lesson/MultipleChoice'
import WordMatch                     from '@/components/lesson/WordMatch'
import ListenSelect                  from '@/components/lesson/ListenSelect'
import { X, Eye, EyeOff, Zap, Flame, Star, BookOpen, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const HEARTS = 3

// ── Intro screen ─────────────────────────────────────────────────────────────
function Intro({ lesson, exercises, onStart }) {
  const types = exercises.reduce((a, e) => { a[e.type] = (a[e.type]||0)+1; return a }, {})
  const typeLabel = { multiple_choice:'🔤 Multiple choice', word_match:'🔗 Word matching', listen_select:'🔊 Listen & select' }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-7 max-w-sm w-full text-center animate-pop">
        <div className="w-16 h-16 bg-brand-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-card">
          <BookOpen size={26} className="text-white" strokeWidth={2} />
        </div>
        <h1 className="text-[24px] font-extrabold text-stone-900 tracking-tight mb-1">
          {lesson.title_en}
        </h1>
        {lesson.title_am && (
          <p className="am text-[20px] text-stone-400 mb-5">{lesson.title_am}</p>
        )}

        <div className="card-inset p-4 mb-6 text-left space-y-2.5">
          <p className="section-label">This lesson</p>
          <div className="flex justify-between text-[14px]">
            <span className="text-stone-500">Total exercises</span>
            <span className="font-bold text-stone-900">{exercises.length}</span>
          </div>
          {Object.entries(types).map(([t, n]) => (
            <div key={t} className="flex justify-between text-[13px]">
              <span className="text-stone-400">{typeLabel[t]}</span>
              <span className="font-medium text-stone-600">{n}</span>
            </div>
          ))}
          <div className="flex justify-between text-[13px] pt-2 border-t border-stone-200/50">
            <span className="text-stone-400 flex items-center gap-1">
              <Zap size={12} className="text-amber-400" /> XP reward
            </span>
            <span className="font-bold text-amber-500">+{lesson.xp_reward || 10} XP</span>
          </div>
        </div>

        <button onClick={onStart} className="btn-primary w-full text-[15px] gap-2">
          Start Lesson <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── XP float ─────────────────────────────────────────────────────────────────
function XpFloat({ id, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t) }, [])
  return (
    <div className="absolute -top-6 right-0 pointer-events-none z-10 animate-float-up">
      <span className="text-[13px] font-extrabold text-amber-500">+5 XP</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuthStore()
  const { markLessonComplete }   = useLessonStore()

  const [lesson,    setLesson]    = useState(null)
  const [exercises, setExercises] = useState([])
  const [phase,     setPhase]     = useState('loading')  // loading|intro|quiz|complete|failed
  const [current,   setCurrent]   = useState(0)
  const [hearts,    setHearts]    = useState(HEARTS)
  const [showRom,   setShowRom]   = useState(true)
  const [score,     setScore]     = useState({ correct:0, wrong:0 })
  const [xpEarned,  setXpEarned]  = useState(0)
  const [xpFloats,  setXpFloats]  = useState([])
  const [saving,    setSaving]    = useState(false)
  const xpRef = useRef(0)

  useEffect(() => {
    const load = async () => {
      const { data: les, error } = await supabase
        .from('lessons').select('*, units(title_en,title_am)')
        .eq('id', id).single()
      if (error || !les) { setPhase('error'); return }
      const { data: exs } = await supabase
        .from('exercises').select('*').eq('lesson_id', id).order('id')
      setLesson(les)
      setExercises(exs || [])
      setPhase('intro')
    }
    load()
  }, [id])

  const exercise = exercises[current]

  const handleAnswer = (correct) => {
    if (correct) {
      xpRef.current += 5
      const id = Date.now()
      setXpFloats(f => [...f, id])
      setScore(s => ({ ...s, correct: s.correct+1 }))
    } else {
      setScore(s => ({ ...s, wrong: s.wrong+1 }))
      const newH = hearts - 1
      setHearts(newH)
      if (newH === 0) { setTimeout(() => setPhase('failed'), 100); return }
    }
    const isLast = current + 1 >= exercises.length
    if (isLast) handleComplete()
    else setCurrent(c => c+1)
  }

  const handleComplete = async () => {
    setSaving(true)
    const total = (lesson?.xp_reward || 10) + xpRef.current
    setXpEarned(total)
    if (user?.id) {
      await markLessonComplete(user.id, id, total, score.wrong)
      await refreshProfile()
    }
    setSaving(false)
    setPhase('complete')
  }

  const resetLesson = () => {
    setCurrent(0); setHearts(HEARTS)
    setScore({ correct:0, wrong:0 }); xpRef.current = 0
    setPhase('intro')
  }

  // ── States ──
  if (phase === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (phase === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-400">
      <p className="font-medium">Lesson not found</p>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">Go Back</button>
    </div>
  )
  if (phase === 'intro') return <Intro lesson={lesson} exercises={exercises} onStart={() => setPhase('quiz')} />

  if (phase === 'complete') return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-8 max-w-sm w-full text-center animate-pop">
        {saving ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-stone-400 font-medium">Saving progress…</p>
          </div>
        ) : (
          <>
            <div className="text-[56px] mb-3">🎉</div>
            <h2 className="text-[24px] font-extrabold text-stone-900 tracking-tight mb-1">Lesson Complete!</h2>
            <p className="text-[14px] text-stone-400 mb-6">{lesson.title_en}</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { bg:'bg-amber-50',  ic:'text-amber-400',  Icon:Zap,   val:`+${xpEarned}`, label:'XP gained' },
                { bg:'bg-orange-50', ic:'text-orange-400', Icon:Flame, val:'+1',            label:'Streak'    },
                { bg:'bg-brand-50', ic:'text-brand-500', Icon:Star,  val:`${score.correct}/${exercises.length}`, label:'Correct' },
              ].map(({ bg, ic, Icon, val, label }) => (
                <div key={label} className={clsx('rounded-2xl p-3.5 text-center', bg)}>
                  <Icon size={16} className={clsx('mx-auto mb-1.5', ic)} strokeWidth={2.2} />
                  <p className={clsx('text-[18px] font-extrabold', ic)}>{val}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Accuracy */}
            <div className="mb-6">
              <div className="flex justify-between text-[12px] text-stone-400 mb-1.5">
                <span>Accuracy</span>
                <span className="font-bold text-stone-600">
                  {Math.round((score.correct / Math.max(exercises.length,1))*100)}%
                </span>
              </div>
              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-700"
                  style={{ width:`${(score.correct/Math.max(exercises.length,1))*100}%` }} />
              </div>
            </div>

            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
              Continue Learning
            </button>
          </>
        )}
      </div>
    </div>
  )

  if (phase === 'failed') return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="card p-8 max-w-sm w-full text-center animate-pop">
        <div className="text-[56px] mb-3">💔</div>
        <h2 className="text-[24px] font-extrabold text-stone-900 mb-1">Out of hearts</h2>
        <p className="text-[14px] text-stone-400 mb-6">
          {score.correct} correct out of {current} answers. Try again!
        </p>
        <button onClick={resetLesson} className="btn-primary w-full mb-3">Try Again</button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">Back to Dashboard</button>
      </div>
    </div>
  )

  // ── Quiz ──
  const pct = Math.round((current / exercises.length) * 100)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="btn-icon w-9 h-9 shrink-0">
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width:`${pct}%` }} />
            </div>
          </div>

          {/* Hearts */}
          <div className="flex gap-0.5 shrink-0">
            {Array.from({ length: HEARTS }).map((_, i) => (
              <span key={i} className={clsx('text-[16px] transition-all', i < hearts ? '' : 'opacity-20 grayscale')}>
                ❤️
              </span>
            ))}
          </div>

          {/* Romanization toggle */}
          <button onClick={() => setShowRom(r => !r)}
            className="btn-icon w-9 h-9 shrink-0 text-stone-400">
            {showRom ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-xl mx-auto px-4 pb-2.5 flex justify-between items-center">
          <p className="text-[12px] text-stone-400">
            {lesson.units?.title_en} › {lesson.title_en}
            {lesson.title_am && <span className="am ml-1">· {lesson.title_am}</span>}
          </p>
          <p className="text-[12px] font-bold text-brand-500">
            {current + 1} / {exercises.length}
          </p>
        </div>
      </header>

      {/* Exercise */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-xl">
          {exercise && (
            <div key={exercise.id} className="card p-6 animate-rise relative">
              {/* XP floats */}
              {xpFloats.map(fid => (
                <XpFloat key={fid} id={fid} onDone={() => setXpFloats(f => f.filter(x => x !== fid))} />
              ))}

              {/* Type label */}
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5">
                {exercise.type === 'multiple_choice' && '🔤 Choose the correct meaning'}
                {exercise.type === 'word_match'      && '🔗 Match the pairs'}
                {exercise.type === 'listen_select'   && '🔊 Listen and select'}
              </p>

              {exercise.type === 'multiple_choice' && (
                <MultipleChoice exercise={exercise} showRomanization={showRom} onAnswer={handleAnswer} />
              )}
              {exercise.type === 'word_match' && (
                <WordMatch exercise={exercise} showRomanization={showRom} onAnswer={handleAnswer} />
              )}
              {exercise.type === 'listen_select' && (
                <ListenSelect exercise={exercise} showRomanization={showRom} onAnswer={handleAnswer} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
