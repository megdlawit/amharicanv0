import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

const STEPS = [
  {
    id: 'reason',
    title: 'Why are you learning\nAmharic?',
    sub: 'We will personalise your experience',
    options: [
      { value:'heritage', emoji:'🇪🇹', label:'Heritage & Family',  sub:'Connect with Ethiopian roots' },
      { value:'travel',   emoji:'✈️',  label:'Travel to Ethiopia', sub:'Phrases for your trip' },
      { value:'work',     emoji:'🏛️', label:'Work & Diplomacy',   sub:'Professional Amharic' },
      { value:'curious',  emoji:'📚',  label:'Just Curious',       sub:'Explore a new language' },
    ],
  },
  {
    id: 'level',
    title: "What's your\nAmharic level?",
    sub: 'Be honest — we will meet you where you are',
    options: [
      { value:'A1',  emoji:'🌱', label:'Complete Beginner', sub:'I know nothing yet' },
      { value:'A1+', emoji:'🌿', label:'I know a little',   sub:'A few words and phrases' },
      { value:'A2',  emoji:'🌳', label:'Intermediate',      sub:'I can have basic conversations' },
    ],
  },
  {
    id: 'goal',
    title: 'Set your daily\nlearning goal',
    sub: 'Consistency beats intensity',
    options: [
      { value:5,  emoji:'⚡', label:'Casual',    sub:'5 minutes / day' },
      { value:10, emoji:'🔥', label:'Regular',   sub:'10 minutes / day' },
      { value:15, emoji:'💪', label:'Committed', sub:'15 minutes / day' },
    ],
  },
]

export default function Onboarding() {
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving,  setSaving]  = useState(false)
  const { user, refreshProfile } = useAuthStore()
  const navigate = useNavigate()

  const current  = STEPS[step]
  const selected = answers[current.id]
  const pct      = Math.round(((step + 1) / STEPS.length) * 100)

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setSaving(true)
      await supabase.from('users').update({
        learning_reason: answers.reason,
        level:           answers.level  || 'A1',
        goal_minutes:    answers.goal   || 10,
      }).eq('id', user.id)
      await refreshProfile()
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {STEPS.map((_, i) => (
          <div key={i} className={clsx(
            'rounded-full transition-all duration-300',
            i === step
              ? 'w-6 h-2.5 bg-brand-500'
              : i < step
                ? 'w-2.5 h-2.5 bg-brand-300'
                : 'w-2.5 h-2.5 bg-stone-200'
          )} />
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="card p-7 animate-rise">

          {/* Icon */}
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <span className="am text-white font-bold text-base">አ</span>
          </div>

          {/* Title */}
          <h1 className="text-[24px] font-extrabold text-stone-900 leading-tight tracking-tight mb-1 whitespace-pre-line">
            {current.title}
          </h1>
          <p className="text-[14px] text-stone-400 mb-6">{current.sub}</p>

          {/* Options */}
          <div className="space-y-2.5">
            {current.options.map(({ value, emoji, label, sub }) => {
              const active = selected === value
              return (
                <button
                  key={String(value)}
                  onClick={() => setAnswers(a => ({ ...a, [current.id]: value }))}
                  className={clsx(
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 text-left',
                    active
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-stone-100 bg-white hover:border-stone-200 hover:bg-stone-50'
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('font-semibold text-[14px]', active ? 'text-brand-700' : 'text-stone-800')}>
                      {label}
                    </p>
                    <p className="text-[12px] text-stone-400 mt-0.5">{sub}</p>
                  </div>
                  <div className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    active ? 'border-brand-500 bg-brand-500' : 'border-stone-200'
                  )}>
                    {active && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Nav */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="btn-secondary flex items-center gap-1 flex-shrink-0">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!selected || saving}
              className="btn-primary flex-1 flex items-center justify-center gap-1"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : step === STEPS.length - 1 ? (
                'Start Learning!'
              ) : (
                <>Continue <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[12px] text-stone-400 mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
