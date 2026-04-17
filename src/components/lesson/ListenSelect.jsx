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

  const optClass = opt => {
    if (!played)   return 'option-btn opacity-40 cursor-not-allowed'
    if (!answered) return 'option-btn am text-[22px]'
    if (opt === correct) return 'option-btn option-correct am text-[22px]'
    if (opt === selected && opt !== correct) return 'option-btn option-wrong am text-[22px]'
    return 'option-btn option-ghost am text-[22px]'
  }

  return (
    <div className="space-y-5">
      {/* Audio player */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-3 bg-brand-50 rounded-3xl px-10 py-8">
          <button
            onClick={handlePlay}
            disabled={playing}
            className={clsx(
              'w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-200 shadow-lifted',
              playing
                ? 'bg-brand-400 scale-95 cursor-default'
                : 'bg-brand-500 hover:bg-brand-600 hover:scale-105 active:scale-95'
            )}
          >
            <Volume2 size={28} className={clsx('text-white', playing && 'animate-pulse')} strokeWidth={2} />
          </button>
          <p className="text-[13px] font-medium text-stone-500">
            {!played ? 'Tap to hear the word' : playing ? 'Playing…' : 'Tap to replay'}
          </p>
          {played && showRomanization && exercise.romanization && (
            <p className="text-[12px] text-stone-400 font-medium">{exercise.romanization}</p>
          )}
        </div>
        <p className="text-[13px] text-stone-400 font-medium mt-3">
          {played ? 'Which word did you hear?' : 'Listen first, then choose'}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={!played || answered}
            className={clsx(optClass(opt), 'flex items-center justify-between gap-2')}
          >
            <span className="am text-[22px]">{opt}</span>
            {answered && opt === correct && <CheckCircle2 size={16} className="text-brand-500 shrink-0" strokeWidth={2.5} />}
            {answered && opt === selected && opt !== correct && <XCircle size={16} className="text-red-400 shrink-0" strokeWidth={2.5} />}
          </button>
        ))}
      </div>

      {answered && (
        <div className={clsx(
          'rounded-2xl p-4 flex items-center justify-between animate-slide-up',
          selected === correct ? 'bg-brand-50 border border-brand-200/50' : 'bg-red-50 border border-red-200/50'
        )}>
          <div>
            {selected === correct ? (
              <p className="font-bold text-brand-700 text-[15px]">✓ Correct!</p>
            ) : (
              <>
                <p className="font-bold text-red-600 text-[15px]">✗ Not quite</p>
                <p className="am text-[13px] text-red-500 mt-0.5">Answer: <strong>{correct}</strong></p>
              </>
            )}
          </div>
          <button
            onClick={() => onAnswer(selected === correct)}
            className={clsx(
              'flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-[14px] text-white transition-all active:scale-95',
              selected === correct ? 'bg-brand-500 hover:bg-brand-600' : 'bg-red-500 hover:bg-red-600'
            )}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
