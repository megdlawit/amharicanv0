import { useEffect, useState } from 'react'
import { supabase }     from '@/lib/supabase'
import AppLayout        from '@/components/layout/AppLayout'
import { Search, Volume2, BookMarked } from 'lucide-react'
import { useTTS }       from '@/hooks/useTTS'
import clsx from 'clsx'

export default function Vocabulary() {
  const [words,   setWords]   = useState([])
  const [query,   setQuery]   = useState('')
  const [tag,     setTag]     = useState('all')
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState(null)
  const { playAudio } = useTTS()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('vocabulary').select('*').order('word_en')
      setWords(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const tags = ['all', ...new Set(words.map(w => w.topic_tag).filter(Boolean))]

  const filtered = words.filter(w => {
    const matchTag   = tag === 'all' || w.topic_tag === tag
    const matchQuery = !query ||
      w.word_am.includes(query) ||
      w.word_en.toLowerCase().includes(query.toLowerCase()) ||
      w.romanization?.toLowerCase().includes(query.toLowerCase())
    return matchTag && matchQuery
  })

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
            <BookMarked size={20} className="text-blue-500" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Vocabulary</h1>
            <p className="text-stone-400 text-sm">{words.length} words in your library</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search words…"
            className="input pl-10"
          />
        </div>

        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {tags.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={clsx(
                'shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold capitalize transition-all',
                tag === t
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Word grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <BookMarked size={32} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="font-medium">No words found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(w => {
              const isFlipped = flipped === w.id
              return (
                <button key={w.id}
                  onClick={() => setFlipped(isFlipped ? null : w.id)}
                  className={clsx(
                    'card p-4 text-left transition-all duration-200 hover:shadow-lifted active:scale-[0.97]',
                    isFlipped && 'ring-2 ring-brand-300 bg-brand-50/50'
                  )}
                >
                  {isFlipped ? (
                    /* Back: English + info */
                    <div className="animate-rise">
                      <p className="text-[11px] text-brand-500 font-bold uppercase tracking-widest mb-1.5">English</p>
                      <p className="text-[18px] font-bold text-stone-900">{w.word_en}</p>
                      {w.romanization && (
                        <p className="text-[12px] text-stone-400 mt-1 italic">{w.romanization}</p>
                      )}
                      {w.topic_tag && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-brand-50 text-brand-600 text-[11px] font-semibold rounded-full capitalize">
                          {w.topic_tag}
                        </span>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); playAudio(w.audio_url, w.word_am) }}
                        className="mt-2 flex items-center gap-1 text-brand-500 text-[12px] font-medium"
                      >
                        <Volume2 size={13} /> Listen
                      </button>
                    </div>
                  ) : (
                    /* Front: Amharic */
                    <div>
                      <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-widest mb-2">Amharic</p>
                      <p className="am text-[32px] font-bold text-stone-900 leading-tight">{w.word_am}</p>
                      <p className="text-[11px] text-stone-300 mt-2">Tap to reveal</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
