import { useEffect, useRef, useState } from 'react'

/* ─── Feature Data ─── */
const FEAT_DATA = [
  {
    tag: '🔊 Audio',
    title: 'Native Speaker Audio',
    sub: "Real-voice recordings by Amharic speakers from Addis Ababa — hear exactly how it's spoken.",
    bg: '#EAF0FF',
    svg: `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="280" fill="#EAF0FF"/><rect x="140" y="20" width="160" height="240" rx="22" fill="white" stroke="rgba(26,58,219,.12)" stroke-width="1.5"/><rect x="160" y="48" width="120" height="8" rx="4" fill="rgba(26,58,219,.1)"/><text x="220" y="138" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="56" fill="#1A3ADB" opacity=".9">ሀ</text><text x="220" y="158" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="12" fill="#6B7080">ha — first letter</text><rect x="162" y="174" width="3" height="10" rx="1.5" fill="#1A3ADB" opacity=".3"/><rect x="168" y="169" width="3" height="20" rx="1.5" fill="#1A3ADB" opacity=".45"/><rect x="174" y="163" width="3" height="32" rx="1.5" fill="#1A3ADB" opacity=".65"/><rect x="180" y="158" width="3" height="42" rx="1.5" fill="#1A3ADB" opacity=".85"/><rect x="186" y="165" width="3" height="28" rx="1.5" fill="#1A3ADB" opacity=".7"/><rect x="192" y="172" width="3" height="14" rx="1.5" fill="#1A3ADB" opacity=".5"/><rect x="198" y="168" width="3" height="22" rx="1.5" fill="#1A3ADB" opacity=".6"/><rect x="204" y="161" width="3" height="36" rx="1.5" fill="#1A3ADB" opacity=".8"/><rect x="210" y="170" width="3" height="18" rx="1.5" fill="#1A3ADB" opacity=".55"/><rect x="216" y="175" width="3" height="8" rx="1.5" fill="#1A3ADB" opacity=".35"/><rect x="222" y="167" width="3" height="24" rx="1.5" fill="#1A3ADB" opacity=".6"/><rect x="228" y="160" width="3" height="38" rx="1.5" fill="#1A3ADB" opacity=".75"/><rect x="234" y="166" width="3" height="26" rx="1.5" fill="#1A3ADB" opacity=".6"/><rect x="240" y="172" width="3" height="14" rx="1.5" fill="#1A3ADB" opacity=".4"/><rect x="246" y="177" width="3" height="4" rx="1.5" fill="#1A3ADB" opacity=".25"/><circle cx="220" cy="218" r="16" fill="#1A3ADB"/><polygon points="216,212 228,218 216,224" fill="white"/><rect x="148" y="26" width="84" height="22" rx="8" fill="#1A3ADB"/><text x="190" y="41" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="white">98% Match 🎯</text></svg>`
  },
  {
    tag: '🔥 Streaks',
    title: 'Daily Streaks & XP',
    sub: 'Small daily habits — tracked with streaks and XP — build lasting fluency without burnout.',
    bg: '#FEF5DC',
    svg: `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="280" fill="#FEF5DC"/><rect x="60" y="24" width="320" height="232" rx="18" fill="white" stroke="rgba(200,152,42,.15)" stroke-width="1.5"/><text x="220" y="58" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="13" font-weight="700" fill="#0A0C14">Your Streak</text><text x="220" y="118" text-anchor="middle" font-size="64" fill="#C8982A">7</text><text x="220" y="140" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="11" fill="#6B7080">day streak 🔥</text><rect x="76" y="162" width="36" height="52" rx="10" fill="#FEF5DC"/><text x="94" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#8A6615">Mon</text><text x="94" y="205" text-anchor="middle" font-size="14">🔥</text><rect x="118" y="162" width="36" height="52" rx="10" fill="#FEF5DC"/><text x="136" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#8A6615">Tue</text><text x="136" y="205" text-anchor="middle" font-size="14">🔥</text><rect x="160" y="162" width="36" height="52" rx="10" fill="#FEF5DC"/><text x="178" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#8A6615">Wed</text><text x="178" y="205" text-anchor="middle" font-size="14">🔥</text><rect x="202" y="155" width="36" height="59" rx="10" fill="#C8982A"/><text x="220" y="178" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="white">Thu</text><text x="220" y="202" text-anchor="middle" font-size="16">⚡</text><rect x="244" y="162" width="36" height="52" rx="10" fill="rgba(10,12,20,.04)"/><text x="262" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#B0B5C2">Fri</text><text x="262" y="202" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="12" fill="#B0B5C2">○</text><rect x="286" y="162" width="36" height="52" rx="10" fill="rgba(10,12,20,.04)"/><text x="304" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#B0B5C2">Sat</text><text x="304" y="202" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="12" fill="#B0B5C2">○</text><rect x="328" y="162" width="36" height="52" rx="10" fill="rgba(10,12,20,.04)"/><text x="346" y="184" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#B0B5C2">Sun</text><text x="346" y="202" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="12" fill="#B0B5C2">○</text><rect x="152" y="228" width="136" height="22" rx="8" fill="#C8982A"/><text x="220" y="243" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="white">+120 XP this week 🏆</text></svg>`
  },
  {
    tag: '🌍 Culture',
    title: 'Culture Bytes',
    sub: 'Ethiopian history, food, and traditions woven into every lesson — language and culture are inseparable.',
    bg: '#1A1208',
    svg: `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="280" fill="#D4EFEF"/><rect x="60" y="20" width="320" height="240" rx="18" fill="#1A1208"/><ellipse cx="220" cy="120" rx="110" ry="80" fill="rgba(200,152,42,.12)"/><rect x="80" y="38" width="88" height="22" rx="7" fill="rgba(200,152,42,.2)" stroke="rgba(200,152,42,.35)" stroke-width="1"/><text x="124" y="53" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="800" fill="#C8982A" letter-spacing="1">🫘 DID YOU KNOW?</text><text x="220" y="138" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="52" fill="#C8982A">ቡና</text><text x="220" y="160" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" fill="rgba(255,255,255,.55)">Coffee (bunna) was born in Ethiopia.</text><text x="220" y="176" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" fill="rgba(255,255,255,.45)">The word traces back to Kaffa region.</text><rect x="80" y="204" width="70" height="22" rx="7" fill="rgba(200,152,42,.15)" stroke="rgba(200,152,42,.25)" stroke-width="1"/><text x="115" y="219" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#C8982A">History</text><rect x="158" y="204" width="60" height="22" rx="7" fill="rgba(200,152,42,.15)" stroke="rgba(200,152,42,.25)" stroke-width="1"/><text x="188" y="219" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#C8982A">Food</text><rect x="226" y="204" width="80" height="22" rx="7" fill="rgba(200,152,42,.15)" stroke="rgba(200,152,42,.25)" stroke-width="1"/><text x="266" y="219" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#C8982A">Traditions</text></svg>`
  },
  {
    tag: '🤖 AI · Soon',
    title: 'AI Conversation Partner',
    sub: 'Practice real Amharic conversations 24/7 with an AI tutor. No judgment, endless patience.',
    bg: '#EAF0FF',
    svg: `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="280" fill="#EAF0FF"/><rect x="60" y="20" width="320" height="240" rx="18" fill="white" stroke="rgba(26,58,219,.1)" stroke-width="1.5"/><rect x="60" y="20" width="320" height="52" rx="18" fill="#1A3ADB"/><rect x="60" y="50" width="320" height="22" fill="#1A3ADB"/><circle cx="92" cy="46" r="14" fill="rgba(255,255,255,.2)"/><text x="92" y="51" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="12" fill="white">አ</text><text x="116" y="40" font-family="'DM Sans',sans-serif" font-size="11" font-weight="700" fill="white">Amharican AI Tutor</text><text x="116" y="56" font-family="'DM Sans',sans-serif" font-size="9" fill="rgba(255,255,255,.65)">● Online now</text><rect x="76" y="86" width="220" height="50" rx="14" fill="#EAF0FF"/><text x="92" y="106" font-family="'Noto Serif Ethiopic',serif" font-size="13" fill="#1A3ADB">እንኳን ደህና መጡ!</text><text x="92" y="124" font-family="'DM Sans',sans-serif" font-size="10" fill="#6B7080">Welcome! How do you say "I'm fine"?</text><rect x="186" y="152" width="174" height="36" rx="14" fill="#1A3ADB"/><text x="273" y="166" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="13" fill="white">ደህና ነኝ!</text><text x="273" y="181" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" fill="rgba(255,255,255,.7)">dehna negn</text><rect x="76" y="205" width="188" height="36" rx="14" fill="#EAF0FF"/><text x="92" y="219" font-family="'DM Sans',sans-serif" font-size="10" fill="#1A3ADB" font-weight="600">✓ Perfect! +5 XP 🎉</text><text x="92" y="233" font-family="'DM Sans',sans-serif" font-size="10" fill="#6B7080">Try the next phrase →</text></svg>`
  },
  {
    tag: '📊 Progress',
    title: 'Progress Tracking',
    sub: "XP points, level badges, and weekly reports show exactly what you've mastered and where to focus next.",
    bg: '#DFF2EA',
    svg: `<svg viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg"><rect width="440" height="280" fill="#DFF2EA"/><rect x="60" y="20" width="320" height="240" rx="18" fill="white" stroke="rgba(26,122,74,.12)" stroke-width="1.5"/><text x="220" y="54" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="13" font-weight="700" fill="#0A0C14">Your Progress</text><circle cx="220" cy="118" r="50" fill="none" stroke="rgba(26,122,74,.1)" stroke-width="10"/><circle cx="220" cy="118" r="50" fill="none" stroke="#1A7A4A" stroke-width="10" stroke-dasharray="220 314" stroke-linecap="round" transform="rotate(-90 220 118)"/><text x="220" y="113" text-anchor="middle" font-size="28" fill="#1A7A4A">1,240</text><text x="220" y="133" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" fill="#6B7080">total XP</text><rect x="76" y="186" width="80" height="52" rx="12" fill="rgba(26,122,74,.07)"/><text x="116" y="208" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">LEVEL</text><text x="116" y="228" text-anchor="middle" font-size="22" fill="#1A7A4A">12</text><rect x="172" y="186" width="80" height="52" rx="12" fill="rgba(26,122,74,.07)"/><text x="212" y="208" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">STREAK</text><text x="212" y="228" text-anchor="middle" font-size="22" fill="#1A7A4A">7🔥</text><rect x="268" y="186" width="96" height="52" rx="12" fill="rgba(26,122,74,.07)"/><text x="316" y="208" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">UNITS DONE</text><text x="316" y="228" text-anchor="middle" font-size="22" fill="#1A7A4A">2/5</text></svg>`
  }
]

const FEAT_ITEMS = [
  {
    title: 'Native Speaker Audio',
    desc: "Every word and phrase recorded by Amharic native speakers from Addis Ababa. Hear how it's really spoken — not a text-to-speech robot.",
    subs: [
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`, text: 'Real-voice recordings from Addis' },
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`, text: 'Voice-match pronunciation scoring' }
    ]
  },
  {
    title: 'Daily Streaks & XP',
    desc: 'Consistency beats intensity. Small daily habits — tracked with streaks and XP points — build lasting fluency without burnout.',
    subs: [
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`, text: 'Streak recovery & freeze tokens' },
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, text: 'Weekly XP leaderboard' }
    ]
  },
  {
    title: 'Culture Bytes',
    desc: 'Mini lessons on Ethiopian food, history, traditions, and etiquette woven into every unit. Language without culture is just vocabulary.',
    subs: [
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, text: 'Food, history & greetings' },
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, text: 'Real-world context in every lesson' }
    ]
  },
  {
    title: 'AI Conversation Partner',
    desc: 'Practice real Amharic conversations with an AI tutor. No embarrassment, no judgment — available 24/7. Part of our upcoming suite.',
    subs: [
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, text: 'Unlimited practice conversations' },
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`, text: 'Instant grammar corrections' }
    ]
  },
  {
    title: 'Progress Tracking',
    desc: "XP points, level badges, and weekly reports show exactly what you've mastered and where to focus next — your learning, visualized.",
    subs: [
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`, text: 'Weekly XP & level reports' },
      { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`, text: 'Unit completion dashboard' }
    ]
  }
]

/* ─── Individual Card Slot (positioned absolutely inside the viewport) ─── */
function CardSlot({ data, index, active }) {
  const offset = index - active
  // Each card translates vertically and fades based on distance from active
  const translateY = offset * 60
  const opacity = offset === 0 ? 1 : Math.max(0, 1 - Math.abs(offset) * 0.55)
  const scale = offset === 0 ? 1 : Math.max(0.88, 1 - Math.abs(offset) * 0.06)
  const zIndex = FEAT_DATA.length - Math.abs(offset)
  const blur = offset === 0 ? 0 : Math.abs(offset) * 2

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        zIndex,
        width: '100%',
        maxWidth: 440,
        pointerEvents: offset === 0 ? 'auto' : 'none',
        transition: 'transform 0.65s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.5s ease, filter 0.5s ease'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          border: '1px solid rgba(10,12,20,.07)',
          overflow: 'hidden',
          boxShadow: offset === 0
            ? '0 10px 50px rgba(10,12,20,.14), 0 4px 12px rgba(10,12,20,.07)'
            : '0 4px 20px rgba(10,12,20,.06)'
        }}
      >
        <div style={{ background: data.bg }} dangerouslySetInnerHTML={{ __html: data.svg }} />
        <div style={{ padding: '28px 30px 32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.65rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
            borderRadius: 999, padding: '5px 14px', marginBottom: 14,
            background: '#EAF0FF', color: '#1069DD'
          }}>
            {data.tag}
          </div>
          <div style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0A0C14', marginBottom: 8, lineHeight: 1.3 }}>
            {data.title}
          </div>
          <div style={{ fontSize: '.86rem', color: '#6B7080', lineHeight: 1.65 }}>
            {data.sub}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function FeaturesSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisibleIndex = -1
        let maxRatio = 0
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            mostVisibleIndex = Number(entry.target.dataset.index)
          }
        })
        if (mostVisibleIndex !== -1 && mostVisibleIndex !== active && maxRatio > 0.4) {
          setActive(mostVisibleIndex)
        }
      },
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: '-100px 0px -140px 0px'
      }
    )

    const items = document.querySelectorAll('.feat-item')
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [active])

  const scrollToItem = (index) => {
    const elements = document.querySelectorAll('.feat-item')
    elements[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section
      id="features"
      style={{
        background: '#F6F7FB',
        padding: '90px 0 160px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '0 100px 60px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: '.7rem', fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase',
          color: '#1069DD', marginBottom: 14
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: '#1069DD', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700
          }}>ሄ</span>
          Features
        </div>
        <h2 style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 'clamp(2.3rem, 3.5vw, 3.5rem)',
          fontWeight: 700,
          letterSpacing: '-.03em',
          lineHeight: 1.08,
          color: '#062651'
        }}>
          Everything you need to actually{' '}
          <em style={{
            fontStyle: 'normal',
            fontWeight: 800,
            color: '#1069DD',
            background: '#e6edff',
            borderRadius: 100,
            padding: '4px 22px 9px',
            display: 'inline-block'
          }}>
            learn
          </em>
        </h2>
      </div>

      <div style={{
        padding: '0 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 90,
        minHeight: 'calc(100vh - 280px)'
      }}>

        {/* LEFT: Scrollable Feature List */}
        <div
          style={{
            position: 'sticky',
            top: 160,
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingRight: 20
          }}
          className="no-scrollbar"
        >
          {FEAT_ITEMS.map((item, index) => (
            <div
              key={index}
              data-index={index}
              className="feat-item"
              onClick={() => scrollToItem(index)}
              style={{
                padding: '36px 0',
                borderBottom: '1px solid rgba(10,12,20,.08)',
                cursor: 'pointer',
                opacity: active === index ? 1 : 0.48,
                transition: 'opacity 0.4s ease'
              }}
            >
              <div style={{
                fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                color: '#1069DD', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{
                  display: 'inline-block', width: 18, height: 2, background: '#1069DD', borderRadius: 2,
                  opacity: active === index ? 1 : 0, transition: 'opacity 0.3s'
                }} />
                0{index + 1}
              </div>

              <div style={{ fontSize: '1.55rem', fontWeight: 700, lineHeight: 1.28, color: '#0A0C14', marginBottom: 14 }}>
                {item.title}
              </div>

              <div style={{
                fontSize: '.89rem',
                color: '#6B7080',
                lineHeight: 1.7,
                maxHeight: active === index ? 140 : 0,
                overflow: 'hidden',
                opacity: active === index ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {item.desc}
              </div>

              <div style={{
                marginTop: active === index ? 22 : 0,
                maxHeight: active === index ? 180 : 0,
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {item.subs.map((sub, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    marginBottom: 12, fontSize: '.85rem', color: '#2E3245'
                  }}>
                    <div style={{
                      width: 28, height: 28, background: '#EAF0FF', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span style={{ width: 15, color: '#1069DD' }} dangerouslySetInnerHTML={{ __html: sub.icon }} />
                    </div>
                    <div style={{ paddingTop: 3 }}>{sub.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Stacked scrolling cards viewport */}
        <div style={{
          position: 'sticky',
          top: 160,
          height: 'calc(100vh - 280px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 440, height: 480 }}>

            {/* All cards stacked, animated by offset from active */}
            {FEAT_DATA.map((data, i) => (
              <CardSlot
                key={i}
                data={data}
                index={i}
                active={active}
              />
            ))}

            {/* Vertical Progress Dots */}
            <div style={{
              position: 'absolute',
              right: -42,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
              zIndex: 20
            }}>
              {FEAT_DATA.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollToItem(i)}
                  style={{
                    width: 7,
                    height: active === i ? 28 : 7,
                    borderRadius: active === i ? 4 : 999,
                    background: active === i ? '#1069DD' : 'rgba(10,12,20,.18)',
                    cursor: 'pointer',
                    transition: 'all 0.35s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}