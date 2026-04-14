import { useState } from 'react'
import { Volume2, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'
import clsx from 'clsx'

export default function ListenSelect({ exercise, showRomanization, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const [played,   setPlayed]   = useState(false)
  const { playAudio } = useTTS()

  const options = Array.isArray(exercise.options)
    ? exercise.options
    : JSON.parse(exercise.options || '[]')

  const correct = exercise.correct_answer

  const handlePlay = async () => {
    if (playing) return
    setPlaying(true)
    await playAudio(exercise.audio_url, exercise.prompt_am)
    setTimeout(() => { setPlaying(false); setPlayed(true) }, 900)
  }

  const handleSelect = opt => {
    if (!played || answered) return
    setSelected(opt)
    setAnswered(true)
  }

  const isCorrect = selected === correct

  return (
    <div className="space-y-5">
      {/* Audio player */}
      <div className="rounded-3xl px-6 py-8 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%)', border:'1.5px solid rgba(21,101,232,0.12)' }}>
        {/* Bg glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full bg-brand-200/30 blur-3xl" />
        </div>
        <div className="relative">
          {/* Play button */}
          <button onClick={handlePlay} disabled={playing}
            className={clsx(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-200',
              playing
                ? 'cursor-default scale-95'
                : 'hover:scale-110 active:scale-95'
            )}
            style={{
              background: playing
                ? 'linear-gradient(135deg, #4d90fe, #1565E8)'
                : 'linear-gradient(135deg, #1565E8, #0f4bc9)',
              boxShadow: playing
                ? '0 2px 0 #0a3496, 0 4px 16px rgba(21,101,232,0.4)'
                : '0 5px 0 #0a3496, 0 8px 24px rgba(21,101,232,0.35)'
            }}>
            {playing ? (
              <div className="flex items-end gap-1 h-7">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="sound-bar w-1.5 rounded-full bg-white"
                    style={{ height:`${10 + (i%3)*6}px` }} />
                ))}
              </div>
            ) : (
              <Volume2 size={30} className="text-white ml-1" strokeWidth={2} />
            )}
          </button>

          <p className="text-[13px] font-semibold text-stone-500 mt-3">
            {!played ? '👆 Tap to hear the word' : playing ? 'Playing…' : '🔄 Tap to replay'}
          </p>
          {played && showRomanization && exercise.romanization && (
            <p className="text-[12px] text-stone-400 mt-1 bg-white/60 inline-block px-3 py-0.5 rounded-full">
              {exercise.romanization}
            </p>
          )}
        </div>
      </div>

      <p className={clsx('text-center text-[12px] font-bold uppercase tracking-wider transition-colors',
        played ? 'text-stone-500' : 'text-stone-300')}>
        {played ? 'Which word did you hear?' : 'Listen first, then choose'}
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {options.map(opt => {
          let cls = 'option-btn'
          if (!played) cls = 'option-btn opacity-30 cursor-not-allowed'
          else if (answered) {
            if (opt === correct)       cls = 'option-btn option-correct'
            else if (opt === selected) cls = 'option-btn option-wrong animate-shake'
            else                       cls = 'option-btn option-ghost'
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)}
              disabled={!played || answered}
              className={clsx(cls, 'flex items-center justify-between gap-2 min-h-[60px]')}>
              <span className="am text-[24px] leading-none">{opt}</span>
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

      {/* Feedback */}
      {answered && (
        <div className={clsx('rounded-2xl p-4 flex items-center justify-between animate-slide-up border-[1.5px]',
          isCorrect ? 'border-emerald-200' : 'border-red-200')}
          style={{ background: isCorrect ? 'linear-gradient(135deg,#e8f5ec,#f0faf3)' : 'linear-gradient(135deg,#fde8eb,#fff0f2)' }}>
          <div>
            {isCorrect ? (
              <div>
                <p className="font-extrabold text-emerald-700 text-[15px]">✓ Correct!</p>
                <p className="am text-[14px] text-emerald-600 mt-0.5">{correct}</p>
              </div>
            ) : (
              <div>
                <p className="font-extrabold text-red-600 text-[15px]">✗ Not quite</p>
                <p className="am text-[14px] text-red-500 mt-0.5">{correct}</p>
              </div>
            )}
          </div>
          <button onClick={() => onAnswer(isCorrect)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-[14px] text-white transition-all active:scale-95',
              isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
            )}
            style={{ boxShadow: isCorrect ? '0 3px 0 #166534' : '0 3px 0 #7f1d1d' }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}