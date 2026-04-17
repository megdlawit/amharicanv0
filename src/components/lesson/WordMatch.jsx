import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

export default function WordMatch({ exercise, onAnswer }) {
  const raw = Array.isArray(exercise.options)
    ? exercise.options
    : JSON.parse(exercise.options || '[]')

  const pairs = raw[0]?.am
    ? raw
    : raw.reduce((acc, _, i, a) => { if (i % 2 === 0) acc.push({ am: a[i], en: a[i+1] }); return acc }, [])

  const [leftItems]  = useState(() => shuffle(pairs.map(p => p.am)))
  const [rightItems] = useState(() => shuffle(pairs.map(p => p.en)))
  const [selLeft,  setSelLeft]  = useState(null)
  const [selRight, setSelRight] = useState(null)
  const [matched,  setMatched]  = useState([])   // [{am,en}]
  const [wrongFlash, setWrong]  = useState(null) // {am,en}
  const [done, setDone]         = useState(false)

  useEffect(() => {
    if (!selLeft || !selRight) return
    const pair = pairs.find(p => p.am === selLeft)
    if (pair?.en === selRight) {
      const next = [...matched, { am: selLeft, en: selRight }]
      setMatched(next)
      setSelLeft(null); setSelRight(null)
      if (next.length === pairs.length) setDone(true)
    } else {
      setWrong({ am: selLeft, en: selRight })
      setTimeout(() => { setWrong(null); setSelLeft(null); setSelRight(null) }, 650)
    }
  }, [selLeft, selRight])

  const isMatchedAm = am => matched.some(m => m.am === am)
  const isMatchedEn = en => matched.some(m => m.en === en)

  const lStyle = am => {
    if (isMatchedAm(am)) return 'border-brand-200 bg-brand-50 text-brand-400 opacity-50 cursor-default'
    if (wrongFlash?.am === am) return 'border-red-400 bg-red-50 text-red-600 animate-shake'
    if (selLeft === am)  return 'border-brand-500 bg-brand-50 text-brand-700 scale-[1.02]'
    return 'border-stone-200 bg-white text-stone-800 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer'
  }
  const rStyle = en => {
    if (isMatchedEn(en)) return 'border-brand-200 bg-brand-50 text-brand-400 opacity-50 cursor-default'
    if (wrongFlash?.en === en) return 'border-red-400 bg-red-50 text-red-600 animate-shake'
    if (selRight === en) return 'border-brand-500 bg-brand-50 text-brand-700 scale-[1.02]'
    return 'border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="font-bold text-[16px] text-stone-800">Match each pair</p>
        <p className="text-[12px] text-stone-400 mt-0.5">{matched.length} / {pairs.length} matched</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Left col */}
        <div className="space-y-2">
          {leftItems.map(am => (
            <button
              key={am}
              disabled={isMatchedAm(am) || done}
              onClick={() => !isMatchedAm(am) && setSelLeft(am === selLeft ? null : am)}
              className={clsx(
                'w-full py-3.5 px-3 rounded-2xl border-2 am text-[22px] transition-all duration-150 select-none',
                lStyle(am)
              )}
            >{am}</button>
          ))}
        </div>

        {/* Right col */}
        <div className="space-y-2">
          {rightItems.map(en => (
            <button
              key={en}
              disabled={isMatchedEn(en) || done}
              onClick={() => !isMatchedEn(en) && setSelRight(en === selRight ? null : en)}
              className={clsx(
                'w-full py-3.5 px-3 rounded-2xl border-2 text-[14px] font-semibold transition-all duration-150 select-none',
                rStyle(en)
              )}
            >{en}</button>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-1">
        {pairs.map((_, i) => (
          <div key={i} className={clsx(
            'rounded-full transition-all duration-300',
            i < matched.length ? 'w-5 h-2 bg-brand-500' : 'w-2 h-2 bg-stone-200'
          )} />
        ))}
      </div>

      {done && (
        <div className="bg-brand-50 border border-brand-200/50 rounded-2xl p-4 flex items-center justify-between animate-slide-up">
          <p className="font-bold text-brand-700 text-[15px]">✓ All matched!</p>
          <button
            onClick={() => onAnswer(true)}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-[14px] active:scale-95 transition-all"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
