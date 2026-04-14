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
  const [matched,  setMatched]  = useState([])
  const [wrongFlash, setWrong]  = useState(null)
  const [done, setDone]         = useState(false)
  const [recentMatch, setRecentMatch] = useState(null)

  useEffect(() => {
    if (!selLeft || !selRight) return
    const pair = pairs.find(p => p.am === selLeft)
    if (pair?.en === selRight) {
      const next = [...matched, { am: selLeft, en: selRight }]
      setMatched(next)
      setRecentMatch(selLeft)
      setTimeout(() => setRecentMatch(null), 600)
      setSelLeft(null); setSelRight(null)
      if (next.length === pairs.length) setDone(true)
    } else {
      setWrong({ am: selLeft, en: selRight })
      setTimeout(() => { setWrong(null); setSelLeft(null); setSelRight(null) }, 650)
    }
  }, [selLeft, selRight])

  const isMatchedAm = am => matched.some(m => m.am === am)
  const isMatchedEn = en => matched.some(m => m.en === en)

  const lClass = am => {
    if (isMatchedAm(am)) return 'border-emerald-200 bg-emerald-50 text-emerald-500 opacity-60 cursor-default scale-95'
    if (wrongFlash?.am === am) return 'border-red-400 bg-red-50 text-red-600 animate-shake'
    if (selLeft === am) return 'border-brand-400 bg-brand-50 text-brand-700 scale-[1.03]'
    return 'border-stone-200 bg-white text-stone-800 hover:border-brand-300 hover:bg-brand-50/60 cursor-pointer hover:scale-[1.02]'
  }
  const rClass = en => {
    if (isMatchedEn(en)) return 'border-emerald-200 bg-emerald-50 text-emerald-500 opacity-60 cursor-default scale-95'
    if (wrongFlash?.en === en) return 'border-red-400 bg-red-50 text-red-600 animate-shake'
    if (selRight === en) return 'border-brand-400 bg-brand-50 text-brand-700 scale-[1.03]'
    return 'border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-brand-50/60 cursor-pointer hover:scale-[1.02]'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="font-extrabold text-[16px] text-stone-800">Match each pair</p>
        <p className="text-[12px] text-stone-400 mt-0.5 font-medium">
          {matched.length} / {pairs.length} matched
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-1">
        {pairs.map((_, i) => (
          <div key={i} className={clsx(
            'rounded-full transition-all duration-400',
            i < matched.length
              ? 'w-6 h-2.5 bg-emerald-500'
              : 'w-2.5 h-2.5 bg-stone-200'
          )} />
        ))}
      </div>

      {/* Match grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left — Amharic */}
        <div className="space-y-2">
          {leftItems.map(am => (
            <button key={am}
              disabled={isMatchedAm(am) || done}
              onClick={() => !isMatchedAm(am) && setSelLeft(am === selLeft ? null : am)}
              className={clsx(
                'w-full py-4 px-3 rounded-2xl border-2 am text-[24px] transition-all duration-150 select-none font-black',
                lClass(am)
              )}
              style={{ boxShadow: selLeft === am ? '0 3px 0 rgba(21,101,232,0.25)' : '0 2px 0 #e0ddd6' }}>
              {am}
              {isMatchedAm(am) && <span className="block text-[10px] font-sans font-bold mt-0.5 not-am">✓</span>}
            </button>
          ))}
        </div>

        {/* Right — English */}
        <div className="space-y-2">
          {rightItems.map(en => (
            <button key={en}
              disabled={isMatchedEn(en) || done}
              onClick={() => !isMatchedEn(en) && setSelRight(en === selRight ? null : en)}
              className={clsx(
                'w-full py-4 px-3 rounded-2xl border-2 text-[13px] font-bold transition-all duration-150 select-none',
                rClass(en)
              )}
              style={{ boxShadow: selRight === en ? '0 3px 0 rgba(21,101,232,0.25)' : '0 2px 0 #e0ddd6' }}>
              {en}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      {!done && (
        <p className="text-center text-[11px] text-stone-300 font-medium">
          Tap an Amharic word, then its English meaning
        </p>
      )}

      {/* Done banner */}
      {done && (
        <div className="rounded-2xl p-4 flex items-center justify-between animate-slide-up border-[1.5px] border-emerald-200"
          style={{ background:'linear-gradient(135deg,#e8f5ec,#f0faf3)' }}>
          <div>
            <p className="font-extrabold text-emerald-700 text-[15px]">✓ All matched!</p>
            <p className="text-[12px] text-emerald-600 mt-0.5 font-medium">Perfect score! +5 XP</p>
          </div>
          <button onClick={() => onAnswer(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[14px] active:scale-95 transition-all"
            style={{ boxShadow:'0 3px 0 #166534' }}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}