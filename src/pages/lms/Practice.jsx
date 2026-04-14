import { useEffect, useState, useCallback } from 'react'
import { supabase }     from '@/lib/supabase'
import AppLayout        from '@/components/layout/AppLayout'
import { Dumbbell, RefreshCw, CheckCircle2, XCircle, Volume2, Zap } from 'lucide-react'
import { useTTS }       from '@/hooks/useTTS'
import clsx from 'clsx'

const MODES = [
  { id: 'flashcard', label: 'Flashcards',    emoji: '🃏', desc: 'Tap to flip — Amharic to English'   },
  { id: 'quiz',      label: 'Quick Quiz',    emoji: '⚡', desc: 'Multiple choice — race against time' },
  { id: 'audio',     label: 'Ear Training',  emoji: '🔊', desc: 'Listen and identify the word'        },
]

// ── Flashcard mode ────────────────────────────────────────────
function FlashcardMode({ words }) {
  const [idx,     setIdx]     = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done,    setDone]    = useState(0)
  const { playAudio } = useTTS()

  if (!words.length) return <p className="text-center text-stone-400 py-10">No vocabulary yet.</p>

  const word = words[idx]

  const next = (wasCorrect) => {
    setCorrect(c => c + (wasCorrect ? 1 : 0))
    setDone(d => d + 1)
    setFlipped(false)
    setTimeout(() => setIdx(i => (i + 1) % words.length), 200)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[13px] text-stone-400 font-medium">
        <span>Card {idx + 1} / {words.length}</span>
        <span className="text-brand-600 font-bold">{done > 0 ? Math.round((correct/done)*100) : 0}% correct</span>
      </div>

      {/* Card */}
      <button onClick={() => setFlipped(f => !f)}
        className="card w-full p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-4 hover:shadow-lifted transition-all active:scale-[0.98]">
        {flipped ? (
          <div className="animate-rise space-y-2">
            <p className="text-[11px] text-brand-500 font-bold uppercase tracking-widest">English</p>
            <p className="text-[28px] font-bold text-stone-900">{word.word_en}</p>
            {word.romanization && <p className="text-stone-400 text-sm italic">{word.romanization}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">Amharic</p>
            <p className="am text-[48px] font-bold text-stone-900">{word.word_am}</p>
            <p className="text-[12px] text-stone-300">Tap to reveal</p>
          </div>
        )}
      </button>

      {/* Actions */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => next(false)}
            className="card p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 border-red-100 transition-colors active:scale-[0.97]">
            <XCircle size={18} /> Missed it
          </button>
          <button onClick={() => next(true)}
            className="card p-4 flex items-center justify-center gap-2 text-brand-600 hover:bg-brand-50 border-brand-100 transition-colors active:scale-[0.97]">
            <CheckCircle2 size={18} /> Got it!
          </button>
        </div>
      ) : (
        <button onClick={() => playAudio(word.audio_url, word.word_am)}
          className="btn-secondary w-full flex items-center justify-center gap-2">
          <Volume2 size={16} /> Listen
        </button>
      )}
    </div>
  )
}

// ── Quick Quiz mode ───────────────────────────────────────────
function QuizMode({ words }) {
  const [qIdx,     setQIdx]     = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState({ correct: 0, total: 0 })

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

  const makeQuestion = useCallback(() => {
    if (words.length < 4) return null
    const word    = words[qIdx % words.length]
    const others  = shuffle(words.filter(w => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...others])
    return { word, options }
  }, [words, qIdx])

  const q = makeQuestion()

  const pick = (opt) => {
    if (selected) return
    setSelected(opt.id)
    const correct = opt.id === q.word.id
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setTimeout(() => { setSelected(null); setQIdx(i => i + 1) }, 900)
  }

  if (!q) return <p className="text-center text-stone-400 py-10">Need at least 4 vocabulary words to play.</p>

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-[13px] text-stone-400 font-medium">
        <span>Question {score.total + 1}</span>
        <span className="text-brand-600 font-bold">{score.correct}/{score.total}</span>
      </div>

      {/* Prompt */}
      <div className="card p-7 text-center bg-gradient-to-b from-brand-50 to-white border-brand-100/60">
        <p className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold mb-2">Translate to English</p>
        <p className="am text-[52px] font-bold text-stone-900">{q.word.word_am}</p>
        {q.word.romanization && <p className="text-stone-400 text-sm mt-1">{q.word.romanization}</p>}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map(opt => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === q.word.id
          return (
            <button key={opt.id} onClick={() => pick(opt)} disabled={!!selected}
              className={clsx(
                'p-4 rounded-2xl border-2 text-[14px] font-semibold transition-all duration-200',
                !selected && 'border-stone-200 bg-stone-50 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer',
                isSelected && isCorrect  && 'border-brand-400 bg-brand-50 text-brand-700',
                isSelected && !isCorrect && 'border-red-300 bg-red-50 text-red-600',
                selected && !isSelected && isCorrect && 'border-brand-300 bg-brand-50 text-brand-600',
                selected && !isSelected && !isCorrect && 'border-stone-100 bg-stone-50 text-stone-400 opacity-50',
              )}
            >
              {opt.word_en}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Audio mode ────────────────────────────────────────────────
function AudioMode({ words }) {
  const [idx,     setIdx]     = useState(0)
  const [played,  setPlayed]  = useState(false)
  const [selected,setSelected]= useState(null)
  const [score,   setScore]   = useState({ correct: 0, total: 0 })
  const { playAudio } = useTTS()

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

  const makeQ = useCallback(() => {
    if (words.length < 4) return null
    const word    = words[idx % words.length]
    const others  = shuffle(words.filter(w => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...others])
    return { word, options }
  }, [words, idx])

  const q = makeQ()

  const pick = (opt) => {
    if (!played || selected) return
    setSelected(opt.id)
    const correct = opt.id === q.word.id
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setTimeout(() => { setSelected(null); setPlayed(false); setIdx(i => i + 1) }, 900)
  }

  if (!q) return <p className="text-center text-stone-400 py-10">Need at least 4 words.</p>

  return (
    <div className="space-y-5">
      <div className="flex justify-between text-[13px] text-stone-400 font-medium">
        <span>Listen & select</span>
        <span className="text-brand-600 font-bold">{score.correct}/{score.total}</span>
      </div>

      <div className="card p-8 text-center">
        <button
          onClick={() => { playAudio(q.word.audio_url, q.word.word_am); setPlayed(true) }}
          className="w-20 h-20 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center mx-auto shadow-lifted transition-all hover:scale-105 active:scale-95"
        >
          <Volume2 size={30} className="text-white" />
        </button>
        <p className="text-stone-400 text-sm mt-4 font-medium">
          {played ? 'Select the Amharic word you heard' : 'Tap to play'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map(opt => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === q.word.id
          return (
            <button key={opt.id} onClick={() => pick(opt)} disabled={!played || !!selected}
              className={clsx(
                'p-4 rounded-2xl border-2 am text-[26px] font-bold transition-all duration-200',
                !played && 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed',
                played && !selected && 'border-stone-200 bg-stone-50 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer text-stone-800',
                isSelected && isCorrect  && 'border-brand-400 bg-brand-50 text-brand-700',
                isSelected && !isCorrect && 'border-red-300 bg-red-50 text-red-600',
                selected && !isSelected && isCorrect && 'border-brand-300 bg-brand-50 text-brand-600',
                selected && !isSelected && !isCorrect && 'border-stone-100 bg-stone-50 text-stone-300 opacity-50',
              )}
            >
              {opt.word_am}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Practice page ────────────────────────────────────────
export default function Practice() {
  const [words,   setWords]   = useState([])
  const [mode,    setMode]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('vocabulary').select('*').order('word_en')
      setWords(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Dumbbell size={20} className="text-purple-500" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Practice</h1>
              <p className="text-stone-400 text-sm">Daily drills to sharpen your skills</p>
            </div>
          </div>
          {mode && (
            <button onClick={() => setMode(null)}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm font-medium">
              <RefreshCw size={14} /> Change
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-3xl" />)}
          </div>
        ) : !mode ? (
          /* Mode selector */
          <div className="space-y-3">
            <p className="text-[13px] font-bold text-stone-400 uppercase tracking-widest mb-4">Choose a mode</p>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="card p-5 w-full flex items-center gap-4 hover:shadow-lifted transition-all active:scale-[0.98] text-left">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  {m.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[15px] text-stone-900">{m.label}</p>
                  <p className="text-[13px] text-stone-400 mt-0.5">{m.desc}</p>
                </div>
                <div className="w-8 h-8 bg-stone-100 rounded-xl flex items-center justify-center">
                  <Zap size={14} className="text-stone-400" />
                </div>
              </button>
            ))}

            <div className="card-inset p-4 mt-4">
              <p className="text-[13px] font-semibold text-stone-600 mb-1">Your library</p>
              <p className="text-[12px] text-stone-400">{words.length} words available for practice</p>
            </div>
          </div>
        ) : (
          /* Active mode */
          <div>
            <div className="card-inset p-3 mb-5 inline-flex items-center gap-2">
              <span className="text-lg">{MODES.find(m => m.id === mode)?.emoji}</span>
              <span className="text-[13px] font-semibold text-stone-700">{MODES.find(m => m.id === mode)?.label}</span>
            </div>

            {mode === 'flashcard' && <FlashcardMode words={words} />}
            {mode === 'quiz'      && <QuizMode words={words} />}
            {mode === 'audio'     && <AudioMode words={words} />}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
