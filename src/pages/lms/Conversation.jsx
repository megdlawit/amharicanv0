import { useState, useRef, useEffect } from 'react'
import AppLayout        from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store/useAuthStore'
import {
  Send, RefreshCw, Sparkles, ChevronDown,
  Volume2, BookOpen, MessageCircle, Globe,
  ChevronRight, Lightbulb, X
} from 'lucide-react'
import clsx from 'clsx'
import { useTTS } from '@/hooks/useTTS'

// ── Rich Amharic knowledge base injected into every AI call ──
const AMHARIC_DATA = `
AMHARIC LANGUAGE REFERENCE (Use this to teach accurately):

=== GREETINGS & BASICS ===
• ሰላም (selam) = Hello / Peace [informal, universal]
• ጤና ይስጥልኝ (ṭena yisṭilliñ) = Good health to you [formal]
• እንደምን ነህ? (indemen neh?) = How are you? [to male]
• እንደምን ነሽ? (indemen nesh?) = How are you? [to female]
• ደህና ነኝ (dehna negn) = I am fine
• አሜን (amen) = Response to formal greeting
• እንደምን አደርክ? (indemen aderk?) = How did you sleep? [to male]
• እንደምን አደርሽ? (indemen adersh?) = How did you sleep? [to female]
• ሰላም ሁን (selam hun) = Goodbye / Be well
• ቸር አደር (cher ader) = Good morning (literal: sleep well)
• ጥሩ ምሽት (ṭiru misht) = Good evening
• አመሰግናለሁ (ameseginallehu) = Thank you [singular]
• አመሰግናለን (ameseginalen) = Thank you [plural / formal]
• ይቅርታ (yiqirta) = Sorry / Excuse me
• አዎ (awo) = Yes
• አይ / አይደለም (ay / ayidelem) = No / It is not
• እባክህ (ibakeh) = Please [to male]
• እባክሽ (ibakesh) = Please [to female]

=== NUMBERS ===
1=አንድ (and), 2=ሁለት (hulet), 3=ሶስት (sost), 4=አራት (arat), 5=አምስት (amst)
6=ስድስት (sidst), 7=ሰባት (sebat), 8=ስምንት (simint), 9=ዘጠኝ (zeṭeñ), 10=አስር (asir)
11=አስራ አንድ, 20=ሃያ (haya), 30=ሰላሳ (selasa), 100=መቶ (meto), 1000=ሺ (shi)

=== COLORS ===
Red=ቀይ (qey), Blue=ሰማያዊ (semayawi), Green=አረንጓዴ (arengwade), Yellow=ቢጫ (bicha)
Black=ጥቁር (ṭiqur), White=ነጭ (neṭsh), Brown=ቡናማ (bunama)

=== FAMILY ===
Mother=እናት (inat), Father=አባት (abat), Sister=እህት (iht), Brother=ወንድም (wendim)
Son=ልጅ (lij) [boy], Daughter=ልጅ (lij) [girl, context dependent], Child=ልጅ (lij)
Husband=ባል (bal), Wife=ሚስት (mist), Family=ቤተሰብ (beteseb)

=== FOOD & DRINK ===
ቡና (buna) = Coffee [Ethiopia's national drink, word origin of "coffee"]
ውሃ (wiha) = Water, ጠላ (ṭela) = Traditional beer
እንጀራ (injera) = Spongy flatbread, main staple food
ትቅ (tiqel) = Stew/sauce served on injera
ዶሮ ወጥ (doro weṭ) = Chicken stew [most famous Ethiopian dish]
ሽሮ (shiro) = Chickpea stew [very common], ሽሮ ፍቅ (shiro fiq) = thick shiro
ሰላጣ (selata) = Salad, ፍራፍሬ (firafire) = Fruit
የምሳ ሰዓት (yemisa seaat) = Lunchtime, ምሳ (misa) = Lunch
ምሽት ምግብ (misht migib) = Dinner, ቁርስ (qurs) = Breakfast

=== COMMON PHRASES ===
• ስሜ ... ነው (sime ... new) = My name is ...
• ከ ... ነኝ (ke ... negn) = I am from ...
• አልገባኝም (algegbagnim) = I don't understand
• ዝግ ብለህ ተናገር (zig bileh tenager) = Speak slowly please
• እንደምን ትለዋለህ? (indemen tilewalen?) = How do you say...?
• ይህ ምንድን ነው? (yih mindun new?) = What is this?
• ምን ያህል? (min yahil?) = How much?
• የት? (yet?) = Where?, መቼ? (meche?) = When?, ማን? (man?) = Who?
• ለምን? (lemin?) = Why?, እንዴት? (indet?) = How?
• እወዳለሁ (ewedalehu) = I love it / I love [something]
• ኢትዮጵያ (ityopp'iya) = Ethiopia
• አዲስ አበባ (addis abeba) = Addis Ababa [means "New Flower"]

=== GRAMMAR RULES ===
GENDER in 2nd person (YOU):
• -(ህ/ክ) endings = masculine (e.g. ነህ neh = you are [male])
• -(ሽ) endings = feminine (e.g. ነሽ nesh = you are [female])
• -(ን) endings = plural (e.g. ናቸሁ nachehu = you all are)

VERB CONJUGATION - "to be":
• ነኝ (negn) = I am
• ነህ (neh) = you are [male]  
• ነሽ (nesh) = you are [female]
• ነው (new) = he/it is
• ናት (nat) = she is
• ናቸሁ (nachehu) = you all are
• ናቸው (nachew) = they are
• ነን (nen) = we are

SENTENCE STRUCTURE: Subject-Object-Verb (SOV)
"I coffee drink" = እኔ ቡና እጠጣለሁ (ine buna iṭeṭalehu)
Unlike English (SVO), the verb ALWAYS comes last in Amharic.

NEGATION: Add አ- prefix and ም-suffix to verb
ነው (new) = is → አይደለም (ayidelem) = is not
ወደዳለሁ (wedadalehu) = I like → አወዳልሁም (awedalhum) = I don't like

=== THE GE'EZ SCRIPT (FIDEL) ===
Amharic uses the Ge'ez/Ethiopic script (ፊደል/fidel).
Each character = consonant + vowel combination (syllabary system)
7 vowel orders per consonant: ሀ ሁ ሂ ሃ ሄ ህ ሆ (ha, hu, hi, haa, he, h, ho)
There are ~230-280 characters total (33 base letters × 7 vowel forms)
Punctuation: ። = period, ፣ = comma, ፡ = word separator (optional), ፤ = semicolon

=== CULTURAL CONTEXT ===
• Ethiopian New Year (ኤንቁጣጣሽ/Enkutatash) = September 11-12 (Julian calendar)
• Ethiopia uses the Ethiopian calendar (13 months, ~7-8 years behind Gregorian)
• Coffee ceremony (ቡና ቤት/buna bet) has 3 rounds: Abol, Tona, Baraka
• Injera is eaten communally from a shared plate — very important to eat from your side
• Time system: Ethiopian clock starts at 6AM = 12:00, so "1 o'clock" Ethiopian = 7AM
• ቤተ ክርስቲያን (bete kiristyan) = Ethiopian Orthodox Church, major cultural force
• Lion of Judah (የይሁዳ አንበሳ) = ancient symbol of Ethiopian Empire
• "ቋንቋ ድልድይ ነው" = Language is a bridge [Amharican motto]
`

// ── Tutors ────────────────────────────────────────────────────
const TUTORS = [
  {
    id: 'selam',
    name: 'Selam',
    name_am: 'ሰላም',
    role: 'Beginner Tutor',
    emoji: '👩🏾‍🏫',
    level: 'A1–A2',
    desc: 'Patient and encouraging. Perfect if you\'re just starting out.',
    color: { bg: 'bg-brand-500', light: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200' },
    systemPrompt: `You are Selam, a warm and patient Amharic language tutor for absolute beginners.

${AMHARIC_DATA}

YOUR TEACHING STYLE:
- Encouraging, never critical — celebrate every attempt
- Always correct gently by modelling the right form ("Great try! The correct form is...")
- Keep responses short (3-5 lines max)
- ALWAYS use this format for every response:
  1. Write in Amharic script first
  2. Immediately follow with English translation in (parentheses)
  3. Add pronunciation using simple romanization in [brackets]
  4. End with 💡 Tip: one grammar/pronunciation insight

RULES:
- Never skip the Amharic script — it is essential
- If user writes in English, translate their words into Amharic and teach them
- After each exchange, suggest one follow-up question or phrase for them to try
- Start every conversation with: ሰላም! እንደምን ነህ/ነሽ? (Selam! Indemen neh/nesh?) — Hello! How are you?`,
  },
  {
    id: 'dawit',
    name: 'Dawit',
    name_am: 'ዳዊት',
    role: 'Intermediate Tutor',
    emoji: '👨🏾‍💼',
    level: 'A2–B1',
    desc: 'Direct and culturally rich. Push your Amharic further.',
    color: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    systemPrompt: `You are Dawit, an experienced Amharic tutor for intermediate learners. You are knowledgeable, direct, and culturally proud.

${AMHARIC_DATA}

YOUR TEACHING STYLE:
- Intellectually engaging and culturally rich
- Use idiomatic expressions and proverbs naturally
- Reference Ethiopian culture, history, and daily life
- ALWAYS use this format:
  1. Response primarily in Amharic script
  2. English translation in (parentheses)
  3. 📚 Note: cultural context or advanced grammar point
  4. Challenge: a slightly harder phrase for them to try

RULES:
- Push learners to use more complex sentence structures
- Introduce one new vocabulary word per exchange
- If they make a grammar error, explain the rule behind the correction
- Weave in Ethiopian cultural context naturally (coffee ceremony, food, history)
- Start with: ጤና ይስጥልኝ! ዛሬ ምን ልናጠና? (Ṭena yisṭilliñ! Zare min linaṭena?) — Greetings! What shall we study today?`,
  },
  {
    id: 'tigist',
    name: 'Tigist',
    name_am: 'ትጉስት',
    role: 'Conversation Partner',
    emoji: '👩🏾',
    level: 'B1+',
    desc: 'Casual and fun. Practice like chatting with a friend in Addis.',
    color: { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
    systemPrompt: `You are Tigist, a young Ethiopian woman from Addis Ababa who speaks Amharic naturally and casually. You are fun, warm, and speak like a real friend — not a textbook.

${AMHARIC_DATA}

YOUR STYLE:
- Casual, natural, spontaneous — like texting a friend
- Use informal contractions and everyday slang (not formal classroom Amharic)
- React naturally to what the learner says
- ALWAYS use this format:
  1. Casual Amharic script (the way people actually speak in Addis)
  2. English translation in (parentheses)
  3. ✨ Slang: one colloquial expression or shortcut native speakers use
  4. React to what the user said — ask a follow-up as you would with a real friend

RULES:
- Never be robotic or stiff — be authentically conversational
- Sprinkle in references to Addis Ababa life: traffic (ትራፊክ), buna, injera, music
- If they make an error, correct it the way a friend would — casually, not as a teacher
- Use emojis occasionally as a natural part of conversation
- Start with a casual Addis-style greeting: ሰላም ቦ! ሞ ምናለ? (Selam bo! Mo minale?) — Hey! What's up?`,
  },
]

// ── Starter prompts per tutor ─────────────────────────────────
const STARTERS = {
  selam: [
    'How do I say "My name is..."',
    'Teach me to greet someone',
    'What are the basic numbers?',
    'How do I say thank you?',
  ],
  dawit: [
    'Explain Amharic verb conjugation',
    'Teach me Ethiopian proverbs',
    'How do I talk about my job?',
    'What is the Ge\'ez script history?',
  ],
  tigist: [
    'How do Ethiopians greet friends?',
    'What\'s popular slang in Addis?',
    'Talk to me about Ethiopian food',
    'How do I negotiate at a market?',
  ],
}

// ── Color map ─────────────────────────────────────────────────
const COLOR_MAP = {
  brand:  'bg-brand-500',
  blue:   'bg-blue-500',
  violet: 'bg-violet-500',
}

export default function Conversation() {
  const { profile } = useAuthStore()
  const [activeTutor, setActiveTutor] = useState(null)
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showPicker,  setShowPicker]  = useState(true)
  const bottomRef = useRef(null)
  const { playAudio } = useTTS()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startTutor = async (tutor) => {
    setActiveTutor(tutor)
    setMessages([])
    setShowPicker(false)
    setLoading(true)
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 500,
          system:     tutor.systemPrompt,
          messages:   [{ role: 'user', content: 'Start the conversation with your opening greeting.' }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || 'ሰላም!'
      setMessages([{ role: 'assistant', text, tutor: tutor.id }])
    } catch (err) {
      setMessages([{ role: 'assistant', text: `ሰላም! (Hello!) I'm ${tutor.name}, ready to help you learn Amharic. What would you like to practice today?`, tutor: tutor.id }])
    }
    setLoading(false)
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading || !activeTutor) return
    setInput('')
    const next = [...messages, { role: 'user', text: msg }]
    setMessages(next)
    setLoading(true)
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 600,
          system:     activeTutor.systemPrompt,
          messages:   next.map(m => ({ role: m.role, content: m.text })),
        }),
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text || 'ይቅርታ — let me try again.'
      setMessages(m => [...m, { role: 'assistant', text: reply, tutor: activeTutor.id }])
    } catch (err) {
      const errMsg = !import.meta.env.VITE_ANTHROPIC_API_KEY
        ? '⚠️ API key missing — add VITE_ANTHROPIC_API_KEY to your .env file.'
        : 'Connection issue — please try again.'
      setMessages(m => [...m, { role: 'assistant', text: errMsg, tutor: activeTutor.id }])
    }
    setLoading(false)
  }

  const reset = () => {
    setActiveTutor(null)
    setMessages([])
    setShowPicker(true)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

        {/* ── Tutor picker ── */}
        {showPicker ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-brand-500" />
                <h1 className="text-[22px] font-bold text-stone-900 tracking-tight">AI Conversation Partner</h1>
              </div>
              <p className="text-[13px] text-stone-400">Practice real Amharic conversations. No embarrassment — available 24/7.</p>
            </div>

            {/* Tutor cards */}
            <div className="space-y-3 mb-7">
              {TUTORS.map(tutor => (
                <button key={tutor.id} onClick={() => startTutor(tutor)}
                  className="w-full text-left bg-white rounded-3xl border border-stone-100 shadow-card p-5 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] flex items-start gap-4">
                  <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0', tutor.color.light)}>
                    {tutor.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[16px] text-stone-900">{tutor.name}</p>
                      <span className="am text-stone-400 text-[13px]">{tutor.name_am}</span>
                      <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', tutor.color.light, tutor.color.text)}>
                        {tutor.level}
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-400 font-medium mt-0.5">{tutor.role}</p>
                    <p className="text-[13px] text-stone-600 mt-1.5 leading-relaxed">{tutor.desc}</p>

                    {/* Sample starters */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {STARTERS[tutor.id].slice(0, 2).map(s => (
                        <span key={s} className={clsx('text-[11px] px-2.5 py-1 rounded-full border', tutor.color.light, tutor.color.text, tutor.color.border)}>
                          "{s}"
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 shrink-0 mt-1" />
                </button>
              ))}
            </div>

            {/* Info card */}
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex gap-3">
              <Lightbulb size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-brand-800 mb-1">How the AI tutor works</p>
                <p className="text-[12px] text-brand-700 leading-relaxed">
                  Each tutor is powered by Claude AI with deep knowledge of Amharic grammar, script, vocabulary, and Ethiopian culture.
                  Responses include Amharic script, pronunciation guides, and cultural context — every time.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Active chat ── */}

            {/* Chat header */}
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100 mb-4 shrink-0">
              <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center text-2xl', activeTutor.color.light)}>
                {activeTutor.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[15px] text-stone-900">{activeTutor.name}</p>
                  <span className="am text-stone-400 text-[12px]">{activeTutor.name_am}</span>
                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">● Online</span>
                </div>
                <p className="text-[11px] text-stone-400">{activeTutor.role} · {activeTutor.level}</p>
              </div>
              <button onClick={reset}
                className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Starter prompts */}
            {messages.length <= 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide shrink-0">
                {STARTERS[activeTutor.id].map(s => (
                  <button key={s} onClick={() => send(s)}
                    className={clsx('shrink-0 text-[12px] font-semibold px-3.5 py-2 rounded-xl border transition-all hover:scale-[1.02]', activeTutor.color.light, activeTutor.color.text, activeTutor.color.border)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={clsx('flex gap-2.5', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  {m.role === 'assistant' && (
                    <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 mt-0.5', activeTutor.color.light)}>
                      {activeTutor.emoji}
                    </div>
                  )}
                  <div className={clsx('max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-line',
                    m.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm'
                      : 'bg-white border border-stone-100 shadow-xs text-stone-800 rounded-tl-sm'
                  )}>
                    {m.text}
                    {m.role === 'assistant' && (
                      <button onClick={() => playAudio(null, m.text.split('(')[0].trim())}
                        className="mt-2 flex items-center gap-1 text-[11px] text-stone-300 hover:text-brand-500 transition-colors">
                        <Volume2 size={12} /> Listen
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0', activeTutor.color.light)}>
                    {activeTutor.emoji}
                  </div>
                  <div className="bg-white border border-stone-100 shadow-xs rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 shrink-0">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Type in English or Amharic…"
                  className="input pr-4 text-[14px] w-full"
                  disabled={loading}
                />
              </div>
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className={clsx('w-12 h-[52px] rounded-2xl flex items-center justify-center transition-all',
                  input.trim() && !loading ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm' : 'bg-stone-100 text-stone-300'
                )}>
                <Send size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
