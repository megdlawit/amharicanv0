import { useState } from 'react'
import { Volume2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'
import clsx from 'clsx'

export default function MultipleChoice({ exercise, showRomanization, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const { playAudio } = useTTS()

  const options = Array.isArray(exercise.options)
    ? exercise.options
    : JSON.parse(exercise.options || '[]')

  const correct = exercise.correct_answer

  const handleSelect = (opt) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
  }

  const handlePlay = async () => {
    if (playing) return
    setPlaying(true)
    await playAudio(exercise.audio_url, exercise.prompt_am)
    setTimeout(() => setPlaying(false), 1000)
  }

  const isCorrect = selected === correct

  return (
    <div className="space-y-5">
      {/* Prompt card */}
      <div className="rounded-3xl py-8 px-6 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 100%)', border:'1.5px solid rgba(21,101,232,0.12)' }}>
        {/* Decorative bg char */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="am text-[120px] text-brand-100/60 font-black select-none leading-none">
            {exercise.prompt_am}
          </span>
        </div>
        <div className="relative">
          <p className="am text-[58px] text-stone-900 leading-none mb-2 font-black drop-shadow-sm">
            {exercise.prompt_am}
          </p>
          {showRomanization && exercise.romanization && (
            <p className="text-[13px] text-stone-500 font-medium bg-white/70 inline-block px-3 py-1 rounded-full">
              {exercise.romanization}
            </p>
          )}
          {/* Audio button */}
          <div className="mt-4 flex justify-center">
            <button onClick={handlePlay} disabled={playing}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200',
                playing
                  ? 'bg-brand-100 text-brand-400 cursor-default'
                  : 'bg-white hover:bg-brand-50 text-brand-600 hover:text-brand-700 shadow-sm border border-brand-100 hover:border-brand-200 active:scale-95'
              )}>
              {playing ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="sound-bar w-1 rounded-full bg-brand-400"
                      style={{ height:`${8 + (i%3)*4}px` }} />
                  ))}
                </div>
              ) : (
                <Volume2 size={13} strokeWidth={2.5} />
              )}
              {playing ? 'Playing…' : 'Listen'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-stone-400 font-semibold uppercase tracking-wider">
        Select the correct meaning
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt, i) => {
          let extraClass = 'option-btn'
          if (answered) {
            if (opt === correct)               extraClass = 'option-btn option-correct'
            else if (opt === selected)         extraClass = 'option-btn option-wrong animate-shake'
            else                               extraClass = 'option-btn option-ghost'
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={answered}
              className={clsx(extraClass, 'flex items-center justify-between gap-2 min-h-[52px]')}
              style={!answered ? { animationDelay:`${i*40}ms` } : {}}>
              <span className="text-[14px]">{opt}</span>
              {answered && opt === correct && (
                <CheckCircle2 size={17} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
              )}
              {answered && opt === selected && opt !== correct && (
                <XCircle size={17} className="text-red-500 shrink-0" strokeWidth={2.5} />
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback banner */}
      {answered && (
        <div className={clsx(
          'rounded-2xl p-4 flex items-center justify-between animate-slide-up',
          isCorrect
            ? 'border-[1.5px] border-emerald-200'
            : 'border-[1.5px] border-red-200'
        )}
        style={{ background: isCorrect
          ? 'linear-gradient(135deg, #e8f5ec, #f0faf3)'
          : 'linear-gradient(135deg, #fde8eb, #fff0f2)' }}>
          <div>
            {isCorrect ? (
              <div>
                <p className="font-extrabold text-emerald-700 text-[15px]">✓ Correct! Well done!</p>
                <p className="text-[12px] text-emerald-600 mt-0.5 font-medium">+5 XP earned</p>
              </div>
            ) : (
              <div>
                <p className="font-extrabold text-red-600 text-[15px]">✗ Not quite</p>
                <p className="text-[12px] text-red-500 mt-0.5">Correct: <strong>{correct}</strong></p>
              </div>
            )}
          </div>
          <button onClick={() => onAnswer(isCorrect)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-[14px] text-white transition-all active:scale-95',
              isCorrect
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
            )}
            style={{ boxShadow: isCorrect ? '0 3px 0 #166534' : '0 3px 0 #7f1d1d' }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}