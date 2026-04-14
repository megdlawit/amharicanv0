import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }    from 'react-router-dom'
import { supabase }                  from '@/lib/supabase'
import { useAuthStore }              from '@/store/useAuthStore'
import { useLessonStore }            from '@/store/useLessonStore'
import MultipleChoice                from '@/components/lesson/MultipleChoice'
import WordMatch                     from '@/components/lesson/WordMatch'
import ListenSelect                  from '@/components/lesson/ListenSelect'
import { X, Eye, EyeOff, Zap, Flame, Star, BookOpen, ChevronRight, Trophy, Target } from 'lucide-react'
import clsx from 'clsx'

const HEARTS = 3

// ── Confetti particle ──────────────────────────────────────────────────────
function Confetti() {
  const pieces = ['🎊','⭐','✨','🌟','💛','🔵','🟡']
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({length:18}).map((_,i) => (
        <div key={i} className="absolute text-xl"
          style={{
            left:`${5 + (i*5.5) % 95}%`,
            top: '-20px',
            animation: `confetti-drop ${1.2 + (i%4)*0.3}s ease-in ${i*0.1}s forwards`
          }}>
          {pieces[i % pieces.length]}
        </div>
      ))}
    </div>
  )
}

// ── Intro screen ──────────────────────────────────────────────────────────
function Intro({ lesson, exercises, onStart }) {
  const types = exercises.reduce((a, e) => { a[e.type] = (a[e.type]||0)+1; return a }, {})
  const typeLabel = { multiple_choice:'🔤 Multiple choice', word_match:'🔗 Word matching', listen_select:'🔊 Listen & select' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'var(--surface)' }}>
      <div className="card p-7 max-w-sm w-full text-center animate-pop"
        style={{ boxShadow:'0 6px 0 #e0ddd6, 0 12px 40px rgba(0,0,0,0.1)' }}>
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center relative overflow-hidden"
          style={{ background:'linear-gradient(135deg, #1565E8, #0f4bc9)', boxShadow:'0 4px 0 #0a3496, 0 8px 24px rgba(21,101,232,0.35)' }}>
          <div className="absolute inset-0 tilet-bg opacity-30" />
          <span className="am text-4xl text-white relative z-10 font-black">
            {lesson.title_am?.[0] || 'ሀ'}
          </span>
        </div>

        <h1 className="text-[24px] font-extrabold text-stone-900 tracking-tight mb-1">{lesson.title_en}</h1>
        {lesson.title_am && (
          <p className="am text-[18px] text-stone-400 mb-5">{lesson.title_am}</p>
        )}

        {/* Details card */}
        <div className="card-inset p-4 mb-6 text-left space-y-3">
          <p className="section-label">This lesson includes</p>
          {Object.entries(types).map(([t, n]) => (
            <div key={t} className="flex items-center justify-between text-[13px]">
              <span className="text-stone-500">{typeLabel[t]}</span>
              <span className="font-bold text-stone-800 bg-stone-200/60 px-2 py-0.5 rounded-full text-[12px]">{n}x</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-[13px] pt-2 border-t border-stone-200/50">
            <span className="text-stone-400">XP reward</span>
            <span className="xp-pill">⚡ +{lesson.xp_reward || 10} XP</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-stone-400">Exercises</span>
            <span className="font-bold text-stone-800">{exercises.length} total</span>
          </div>
        </div>

        <button onClick={onStart} className="btn-primary w-full text-[15px] gap-2">
          Start Lesson <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── XP float ─────────────────────────────────────────────────────────────
function XpFloat({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t) }, [])
  return (
    <div className="absolute -top-8 right-2 pointer-events-none z-10 animate-float-up">
      <span className="text-[14px] font-extrabold text-amber-500 drop-shadow-sm">+5 XP ⚡</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuthStore()
  const { markLessonComplete }   = useLessonStore()

  const [lesson,    setLesson]    = useState(null)
  const [exercises, setExercises] = useState([])
  const [phase,     setPhase]     = useState('loading')
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
      const fid = Date.now()
      setXpFloats(f => [...f, fid])
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
    <div className="min-h-screen flex items-center justify-center" style={{ background:'var(--surface)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-[3px] border-brand-500 border-t-transparent animate-spin" />
        <p className="text-[14px] font-semibold text-stone-400">Loading lesson…</p>
      </div>
    </div>
  )

  if (phase === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-400">
      <p className="font-semibold">Lesson not found</p>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">Go Back</button>
    </div>
  )

  if (phase === 'intro') return <Intro lesson={lesson} exercises={exercises} onStart={() => setPhase('quiz')} />

  if (phase === 'complete') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'var(--surface)' }}>
      {!saving && <Confetti />}
      <div className="card p-8 max-w-sm w-full text-center animate-pop"
        style={{ boxShadow:'0 6px 0 #e0ddd6, 0 12px 40px rgba(0,0,0,0.1)' }}>
        {saving ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-stone-400 font-semibold">Saving progress…</p>
          </div>
        ) : (
          <>
            {/* Trophy */}
            <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center relative overflow-hidden"
              style={{ background:'linear-gradient(135deg, #D4A017, #F59E0B)', boxShadow:'0 4px 0 #92610a, 0 8px 24px rgba(212,160,23,0.4)' }}>
              <Trophy size={36} className="text-white" strokeWidth={2} />
            </div>
            <h2 className="text-[26px] font-extrabold text-stone-900 tracking-tight mb-1">Lesson Complete!</h2>
            <p className="text-[13px] text-stone-400 mb-6 font-medium">{lesson.title_en}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { emoji:'⚡', bg:'from-amber-50 to-yellow-50', border:'border-amber-100', val:`+${xpEarned}`, label:'XP gained', color:'text-amber-500' },
                { emoji:'🔥', bg:'from-orange-50 to-red-50',   border:'border-orange-100', val:'+1',          label:'Streak',   color:'text-orange-500' },
                { emoji:'🎯', bg:'from-blue-50 to-indigo-50',  border:'border-blue-100',  val:`${score.correct}/${exercises.length}`, label:'Correct', color:'text-blue-500' },
              ].map(({ emoji, bg, border, val, label, color }) => (
                <div key={label} className={clsx('rounded-2xl p-3.5 text-center bg-gradient-to-b border', bg, border)}>
                  <span className="text-[18px] mb-1 block">{emoji}</span>
                  <p className={clsx('text-[17px] font-extrabold', color)}>{val}</p>
                  <p className="text-[10px] text-stone-400 font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Accuracy bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="font-semibold text-stone-500">Accuracy</span>
                <span className="font-extrabold text-stone-700">
                  {Math.round((score.correct / Math.max(exercises.length,1))*100)}%
                </span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${(score.correct/Math.max(exercises.length,1))*100}%`,
                    background:'linear-gradient(90deg,#1B7A3B,#22c55e)' }} />
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'var(--surface)' }}>
      <div className="card p-8 max-w-sm w-full text-center animate-pop"
        style={{ boxShadow:'0 6px 0 #e0ddd6, 0 12px 40px rgba(0,0,0,0.1)' }}>
        <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center"
          style={{ background:'linear-gradient(135deg, #C8102E, #ef4444)', boxShadow:'0 4px 0 #7f0d1e, 0 8px 24px rgba(200,16,46,0.35)' }}>
          <span className="text-[38px]">💔</span>
        </div>
        <h2 className="text-[24px] font-extrabold text-stone-900 mb-1">Out of hearts!</h2>
        <p className="text-[14px] text-stone-400 mb-6 font-medium">
          {score.correct} correct out of {current} answers. You got this — try again!
        </p>
        <button onClick={resetLesson} className="btn-primary w-full mb-3">Try Again 💪</button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">Back to Dashboard</button>
      </div>
    </div>
  )

  // ── Quiz ──
  const pct = Math.round((current / exercises.length) * 100)

  return (
    <div className="min-h-screen flex flex-col" style={{ background:'var(--surface)' }}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-stone-100 sticky top-0 z-20"
        style={{ boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Close */}
          <button onClick={() => navigate('/dashboard')}
            className="btn-icon w-9 h-9 shrink-0 border border-stone-200">
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* Progress bar */}
          <div className="flex-1 relative">
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width:`${pct}%`, background:'linear-gradient(90deg,#1565E8,#4d90fe)' }}>
                <div className="absolute inset-0" style={{ background:'linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 100%)' }} />
              </div>
            </div>
          </div>

          {/* Hearts */}
          <div className="flex gap-1 shrink-0">
            {Array.from({ length: HEARTS }).map((_, i) => (
              <span key={i} className={clsx('text-[18px] transition-all duration-300',
                i < hearts ? 'scale-100' : 'opacity-20 grayscale scale-90')}>
                ❤️
              </span>
            ))}
          </div>

          {/* Romanization toggle */}
          <button onClick={() => setShowRom(r => !r)}
            className={clsx('btn-icon w-9 h-9 shrink-0 border transition-colors',
              showRom ? 'border-brand-200 bg-brand-50 text-brand-500' : 'border-stone-200 text-stone-400')}>
            {showRom ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>

        {/* Breadcrumb + counter */}
        <div className="max-w-xl mx-auto px-4 pb-2.5 flex justify-between items-center">
          <p className="text-[11px] text-stone-400 font-medium">
            {lesson.units?.title_en} · {lesson.title_en}
            {lesson.title_am && <span className="am ml-1">{lesson.title_am}</span>}
          </p>
          <p className="text-[12px] font-extrabold text-brand-500">
            {current + 1} <span className="text-stone-300 font-normal">/</span> {exercises.length}
          </p>
        </div>
      </header>

      {/* Exercise area */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto">
        <div className="w-full max-w-xl">
          {exercise && (
            <div key={exercise.id} className="card p-6 animate-rise relative"
              style={{ boxShadow:'0 4px 0 #e0ddd6, 0 8px 24px rgba(0,0,0,0.08)' }}>
              {/* XP floats */}
              {xpFloats.map(fid => (
                <XpFloat key={fid} onDone={() => setXpFloats(f => f.filter(x => x !== fid))} />
              ))}

              {/* Exercise type label */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                  <span className="text-[14px]">
                    {exercise.type === 'multiple_choice' && '🔤'}
                    {exercise.type === 'word_match'      && '🔗'}
                    {exercise.type === 'listen_select'   && '🔊'}
                  </span>
                </div>
                <p className="text-[12px] font-bold text-stone-400 uppercase tracking-wider">
                  {exercise.type === 'multiple_choice' && 'Choose the correct meaning'}
                  {exercise.type === 'word_match'      && 'Match the pairs'}
                  {exercise.type === 'listen_select'   && 'Listen and select'}
                </p>
              </div>

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