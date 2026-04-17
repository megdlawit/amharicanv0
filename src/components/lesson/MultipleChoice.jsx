import { useState } from 'react'
import { Volume2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { useTTS } from '@/hooks/useTTS'
import clsx from 'clsx'

export default function MultipleChoice({ exercise, showRomanization, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
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

  const optClass = (opt) => {
    if (!answered) return 'option-btn'
    if (opt === correct) return 'option-btn option-correct'
    if (opt === selected && opt !== correct) return 'option-btn option-wrong'
    return 'option-btn option-ghost'
  }

  return (
    <div className="space-y-5">
      {/* Prompt card */}
      <div className="bg-brand-50 rounded-3xl py-8 px-6 text-center">
        <p className="am text-[52px] text-stone-900 leading-none mb-3">{exercise.prompt_am}</p>
        {showRomanization && exercise.romanization && (
          <p className="text-[13px] text-stone-400 font-medium">{exercise.romanization}</p>
        )}
        <button
          onClick={() => playAudio(exercise.audio_url, exercise.prompt_am)}
          className="mt-3 inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[13px] font-semibold bg-brand-100 hover:bg-brand-200 px-3 py-1.5 rounded-xl transition-all"
        >
          <Volume2 size={13} strokeWidth={2.5} /> Listen
        </button>
      </div>

      <p className="text-center text-[13px] text-stone-400 font-medium">
        Select the correct meaning
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={answered}
            className={clsx(optClass(opt), 'flex items-center justify-between gap-2')}
          >
            <span>{opt}</span>
            {answered && opt === correct && (
              <CheckCircle2 size={16} className="text-brand-500 shrink-0" strokeWidth={2.5} />
            )}
            {answered && opt === selected && opt !== correct && (
              <XCircle size={16} className="text-red-400 shrink-0" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>

      {/* Feedback + next */}
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
                <p className="text-[13px] text-red-500 mt-0.5">Answer: <strong>{correct}</strong></p>
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
