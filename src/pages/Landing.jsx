import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Features from './Feature'

/* ═══════════════════════════════════════════════════
   LANDING PAGE — faithful React port of Amharican HTML
   ═══════════════════════════════════════════════════ */

/* ─── Data ─── */
const SLIDES = [
  { word: 'learn.',     pillBg: '#fff2e6', pillColor: '#c8982a', iconBg: '#fff2e6', dotBg: '#c8982a',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c8982a" stroke-width="2" stroke-linecap="round"><path d="M4 19V5h6l2 2h8v12H4z"/><path d="M8 11h8M8 15h5"/></svg>` },
  { word: 'pronounce.', pillBg: '#DFF2EA', pillColor: '#1A7A4A', iconBg: '#DFF2EA', dotBg: '#1A7A4A',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>` },
  { word: 'read.',      pillBg: '#D4EFEF', pillColor: '#0D6E6E', iconBg: '#D4EFEF', dotBg: '#0D6E6E',
    iconSvg: `<svg viewBox="0 0 24 24" fill="#0D6E6E"><rect x="3" y="5" width="18" height="2.5" rx="1.25"/><rect x="3" y="10.75" width="18" height="2.5" rx="1.25"/><rect x="3" y="16.5" width="18" height="2.5" rx="1.25"/></svg>` },
  { word: 'explore.',   pillBg: '#fff2e6', pillColor: '#c8982a', iconBg: '#fff2e6', dotBg: '#c8982a',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="#c8982a" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
]

const FIDEL = 'ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖ'.split('')
const FIDEL_NAMES = ['ha','hu','hi','haa','he','h','ho','la','lu','li','laa','le','l','lo','hha','hhu','hhi','hhaa','hhe','hh','hho']
const AZ_TEXTS = ['A to Z', 'hä to pe', 'ሀ - ፐ']
const CARD_TAGS = [
  { bg:'#FEF5DC', color:'#8A6615',  iconColor:'currentColor', iconFill:'currentColor', label:'Daily Lesson',   title:'What does this mean?',       sub:'Pick the correct translation',       tagIconSvg:`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` },
  { bg:'#DFF2EA', color:'#1A7A4A',  label:'Pronunciation',    title:'Listen & repeat',                         sub:'Hear native Amharic sounds',         tagIconSvg:`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>` },
  { bg:'#D4EFEF', color:'#0D6E6E',  label:"Ge'ez Script",     title:'The Fidel alphabet',                      sub:'276 characters, one at a time',      tagIconSvg:`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>` },
  { bg:'rgba(200,152,42,.18)', color:'#C8982A', label:'Culture Byte', title:'Ethiopia in context',             sub:'Language meets living culture',       tagIconSvg:`<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
]
const CURVE_UNITS = [
  { icon:'🔤', title:'Unit 1 — The Fidel Alphabet',    meta:'18 lessons · Reading & writing',    type:'gold',  pct:65, badge:'In progress', badgeType:'gold'  },
  { icon:'👋', title:'Unit 2 — Greetings & Basics',    meta:'24 lessons · Speaking & listening', type:'green', pct:20, badge:'Unlocked',     badgeType:'green' },
  { icon:'🍽️', title:'Unit 3 — Food & Daily Life',     meta:'30 lessons · Vocabulary',           type:'lock',  pct:0,  badge:'🔒 Locked',    badgeType:'lock'  },
  { icon:'🏙️', title:'Unit 4 — Navigate the City',     meta:'28 lessons · Real scenarios',       type:'lock',  pct:0,  badge:'🔒 Locked',    badgeType:'lock'  },
  { icon:'🏛️', title:'Unit 5 — Formal & Professional', meta:'22 lessons · Business & diplomacy', type:'lock',  pct:0,  badge:'🔒 Locked',    badgeType:'lock'  },
]

/* ─── Card visuals ─── */
function CardLesson() {
  const [chosen, setChosen] = useState(null)
  useEffect(() => {
    const t = setTimeout(() => setChosen(1), 1400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ height:220, background:'#FEF5DC', padding:22, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <div style={{ fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'2.6rem', fontWeight:700, color:'#8A6615', lineHeight:1, marginBottom:4 }}>ሰላም</div>
      <div style={{ fontSize:'.83rem', fontWeight:600, color:'rgba(138,102,21,.5)', marginBottom:13 }}>selam</div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {['Thank you','Hello / Peace','Goodbye'].map((opt,i) => (
          <div key={i} onClick={() => setChosen(i)} style={{ background: chosen===i && i===1 ? '#DFF2EA' : '#fff', border:`1.5px solid ${chosen===i && i===1 ? '#1A7A4A' : 'rgba(200,152,42,.22)'}`, borderRadius:10, padding:'9px 13px', fontSize:'.82rem', fontWeight:600, color: chosen===i && i===1 ? '#1A7A4A' : '#2E3245', cursor:'pointer', transition:'all .25s' }}>{opt}</div>
        ))}
      </div>
      {chosen===1 && <div style={{ position:'absolute', top:14, right:14, background:'#C8982A', color:'#fff', fontSize:'.63rem', fontWeight:800, borderRadius:8, padding:'5px 10px' }}>✓ Correct!</div>}
      <div style={{ position:'absolute', bottom:14, right:14, fontSize:'.69rem', fontWeight:800, color:'#8A6615', background:'rgba(200,152,42,.1)', borderRadius:20, padding:'3px 9px' }}>🔥 7 day streak</div>
    </div>
  )
}

function CardPronunciation() {
  const chars = [['አ','ʼa'],['ሀ','ha'],['ለ','le'],['ሙ','mu'],['ነ','ne'],['ረ','re']]
  const [phase, setPhase] = useState('idle')
  const [ci, setCi] = useState(0)
  useEffect(() => {
    let t1, t2
    const cycle = () => {
      setPhase('listening')
      t1 = setTimeout(() => {
        setPhase('match')
        t2 = setTimeout(() => { setCi(c=>(c+1)%chars.length); setPhase('idle'); setTimeout(cycle,400) }, 1200)
      }, 900)
    }
    const init = setTimeout(cycle, 600)
    return () => { clearTimeout(init); clearTimeout(t1); clearTimeout(t2) }
  }, [])
  const [char] = chars[ci]
  const heights = [12,22,30,26,18,10,8]
  return (
    <div style={{ height:220, background:'#DFF2EA', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:13, padding:22 }}>
      <div style={{ fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'3.4rem', fontWeight:700, color:'#1A7A4A', lineHeight:1, transition:'transform .3s cubic-bezier(.34,1.56,.64,1)' }}>{char}</div>
      <div style={{ display:'flex', alignItems:'center', gap:3, height:34 }}>
        {heights.map((h,i) => (
          <div key={i} style={{ width:3, borderRadius:2, background:'#1A7A4A', height: phase==='idle' ? 3 : h, opacity: phase==='idle' ? 0.2 : 1, transition:`height .3s ease-in-out ${i*0.07}s, opacity .3s` }} />
        ))}
      </div>
      <div style={{ fontSize:'.77rem', fontWeight:700, color:'#1A7A4A', letterSpacing:'.04em', textTransform:'uppercase' }}>
        {phase==='idle' ? 'TAP TO HEAR' : phase==='listening' ? 'LISTENING...' : 'PERFECT!'}
      </div>
      {phase==='match' && <div style={{ position:'absolute', top:14, right:14, background:'#1A7A4A', color:'#fff', fontSize:'.69rem', fontWeight:800, borderRadius:8, padding:'4px 10px' }}>98% Match</div>}
    </div>
  )
}

function CardScript() {
  const [lit, setLit] = useState(0)
  const [caption, setCaption] = useState(`${FIDEL[0]} — ${FIDEL_NAMES[0]}`)
  useEffect(() => {
    const t = setInterval(() => {
      setLit(i => { const n=(i+1)%FIDEL.length; setCaption(`${FIDEL[n]} — ${FIDEL_NAMES[n]}`); return n })
    }, 700)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ height:220, background:'#D4EFEF', padding:18, display:'flex', flexDirection:'column', gap:7 }}>
      <div style={{ fontSize:'.67rem', fontWeight:800, color:'#0D6E6E', letterSpacing:'.08em', textTransform:'uppercase' }}>Explore Fidel</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:5, flex:1 }}>
        {FIDEL.map((ch,i) => (
          <div key={i} style={{ background: i===lit ? '#0D6E6E' : 'rgba(13,110,110,.1)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'1.05rem', color: i===lit ? '#fff' : '#0D6E6E', fontWeight:600, aspectRatio:'1', transform: i===lit ? 'scale(1.08)' : 'scale(1)', boxShadow: i===lit ? '0 4px 14px rgba(13,110,110,.35)' : 'none', cursor:'pointer', transition:'all .3s' }}>{ch}</div>
        ))}
      </div>
      <div style={{ fontSize:'.7rem', fontWeight:600, color:'#0D6E6E', opacity: caption ? 1 : 0, transition:'opacity .3s', textAlign:'center' }}>{caption}</div>
    </div>
  )
}

function CardCulture() {
  const facts = [
    { am:'ቡና', text:'Coffee (bunna) originated in Ethiopia. The word "coffee" comes from Kaffa, an Ethiopian region.' },
    { am:'ጤና ይስጥልኝ', text:'"ṭena yisṭilliñ" means "May God give you health" — the common Amharic greeting.' },
  ]
  const [fi, setFi] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFi(f=>(f+1)%facts.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ height:220, background:'#1A1208', position:'relative', overflow:'hidden', padding:20, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 70% 30%,rgba(200,152,42,.25) 0%,transparent 60%),radial-gradient(circle at 20% 70%,rgba(26,122,74,.15) 0%,transparent 50%)' }} />
      <div style={{ position:'absolute', inset:0, opacity:.07, backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(200,152,42,.8) 8px,rgba(200,152,42,.8) 9px)' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(200,152,42,.2)', border:'1px solid rgba(200,152,42,.4)', borderRadius:8, padding:'4px 10px', fontSize:'.61rem', fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color:'#C8982A', marginBottom:8 }}>🫘 Did you know?</div>
        <div key={fi} style={{ animation:'cbFadeUp .4s both' }}>
          <div style={{ fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'1.05rem', fontWeight:700, color:'#C8982A', marginBottom:4 }}>{facts[fi].am}</div>
          <div style={{ color:'rgba(255,255,255,.9)', fontSize:'.81rem', fontWeight:400, lineHeight:1.5 }}>{facts[fi].text}</div>
        </div>
      </div>
    </div>
  )
}

const CARD_COMPONENTS = [CardLesson, CardPronunciation, CardScript, CardCulture]

/* ─── Hero carousel ─── */
function HeroCarousel() {
  const [cur, setCur] = useState(0)
  const autoRef = useRef(null)
  const sceneRef = useRef(null)
  const N = 4, DUR = 4800

  const goTo = useCallback((idx) => {
    clearTimeout(autoRef.current)
    setCur(idx)
    autoRef.current = setTimeout(() => goTo((idx+1)%N), DUR)
  }, [])

  useEffect(() => {
    autoRef.current = setTimeout(() => goTo(1), DUR)
    return () => clearTimeout(autoRef.current)
  }, [goTo])

  const getPos = (i) => {
    const rel = ((i-cur)%N+N)%N
    if (rel===0) return 'current'
    if (rel===1) return 'next'
    if (rel===N-1) return 'prev'
    return rel===2 ? 'hiddenRight' : 'hiddenLeft'
  }

  const posStyle = (pos) => {
    const sw = sceneRef.current?.offsetWidth || 500
    const cw = Math.min(440, sw * 0.85)
    const cx = (sw - cw) / 2
    const pk = cw * 0.96
    const base = { position:'absolute', top:'50%', width: cw, borderRadius:24, background:'#fff', border:'1px solid rgba(10,12,20,.08)', padding:26, cursor:'pointer', willChange:'left,transform,opacity' }
    const trans = 'left .72s cubic-bezier(.4,0,.2,1), transform .72s cubic-bezier(.4,0,.2,1), opacity .72s cubic-bezier(.4,0,.2,1), box-shadow .5s ease'
    if (pos==='current')     return { ...base, left:cx, transform:'translateY(-50%) scale(1)',    opacity:1,   zIndex:10, boxShadow:'0 8px 32px rgba(10,12,20,.12),0 2px 8px rgba(10,12,20,.05)', pointerEvents:'auto',  transition:trans }
    if (pos==='next')        return { ...base, left:cx+pk, transform:'translateY(-50%) scale(.86)', opacity:.38, zIndex:5,  boxShadow:'none', pointerEvents:'none', transition:trans }
    if (pos==='prev')        return { ...base, left:cx-pk, transform:'translateY(-50%) scale(.86)', opacity:.38, zIndex:5,  boxShadow:'none', pointerEvents:'none', transition:trans }
    if (pos==='hiddenRight') return { ...base, left:cx+pk*2, transform:'translateY(-50%) scale(.82)', opacity:0, zIndex:2, pointerEvents:'none', transition:'none' }
    return                          { ...base, left:cx-pk*2, transform:'translateY(-50%) scale(.82)', opacity:0, zIndex:2, pointerEvents:'none', transition:'none' }
  }

  useEffect(() => {
    const handler = () => setCur(c => c) // trigger re-render for recalc
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
      <div ref={sceneRef} style={{ position:'relative', flex:1, minHeight:0, overflow:'hidden', maskImage:'linear-gradient(to right, transparent 0%, rgba(0,0,0,.5) 8%, black 16%, black 84%, rgba(0,0,0,.5) 92%, transparent 100%)' }}>
        {[0,1,2,3].map(i => {
          const pos = getPos(i)
          const tag = CARD_TAGS[i]
          const CardC = CARD_COMPONENTS[i]
          return (
            <div key={i} style={posStyle(pos)} onClick={() => goTo(i)}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'.65rem', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', background:tag.bg, color:tag.color, borderRadius:8, padding:'5px 12px', marginBottom:14 }}
                dangerouslySetInnerHTML={{ __html: `${tag.tagIconSvg} ${tag.label}` }} />
              <div style={{ fontSize:'1.12rem', fontWeight:700, color:'#0A0C14', marginBottom:4, lineHeight:1.2 }}>{tag.title}</div>
              <div style={{ fontSize:'.83rem', color:'#6B7080', lineHeight:1.5, marginBottom:14 }}>{tag.sub}</div>
              <div style={{ borderRadius:16, overflow:'hidden' }}><CardC /></div>
            </div>
          )
        })}
      </div>
      {/* Dots — exact HTML match: vertical pill for active */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, height:44 }}>
        {[0,1,2,3].map(i => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Card ${i+1}`}
            style={{ all:'unset', display:'block', boxSizing:'border-box', width: i===cur ? 4 : 5, height: i===cur ? 24 : 5, borderRadius:99, background: i===cur ? '#1069DD' : 'rgba(10,12,20,.2)', cursor:'pointer', flexShrink:0, overflow:'hidden', transition:'width .35s cubic-bezier(.4,0,.2,1), height .35s cubic-bezier(.4,0,.2,1), background .35s ease' }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Hero pill row ─── */
function HeroPillRow() {
  const [idx, setIdx] = useState(0)
  const [word, setWord] = useState(SLIDES[0].word)
  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => { const n=(i+1)%SLIDES.length; setTimeout(()=>setWord(SLIDES[n].word),110); return n })
    }, 4800)
    return () => clearInterval(t)
  }, [])
  const s = SLIDES[idx]
  return (
    <span style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'nowrap', marginTop:4 }}>
      <span style={{ display:'inline-flex', alignItems:'center', borderRadius:100, background:s.pillBg, whiteSpace:'nowrap', transition:'background .4s ease,color .4s ease' }}>
        <span style={{ padding:'4px 22px 8px 22px', color:s.pillColor, fontFamily:"'DM Sans',sans-serif", fontStyle:'normal', fontSize:'clamp(2.2rem,3.4vw,4.2rem)', fontWeight:800, lineHeight:1.06, letterSpacing:'-.03em', transition:'color .4s' }}>{word}</span>
      </span>
      <span style={{ width:52, height:52, borderRadius:'50%', background:s.iconBg, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .4s' }}
        dangerouslySetInnerHTML={{ __html: `<span style="width:24px;height:24px;display:block">${s.iconSvg}</span>` }} />
    </span>
  )
}

/* ─── How it works cards ─── */
function HowCards() {
  const [hovered, setHovered] = useState(-1)
  const cards = [
    { num:'01.', title:'Master the Fidel Alphabet', desc:"Start with the beautiful Ge'ez script. Visual mnemonics and spaced repetition make all 276 characters second nature — usually within a few weeks.",
      iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
      illusSvg:`<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#EAF0FF" rx="14"/><rect x="20" y="16" width="200" height="24" rx="7" fill="rgba(26,58,219,.1)"/><text x="120" y="32" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" font-weight="700" fill="#1A3ADB" letter-spacing="1">FIDEL ALPHABET</text><rect x="20" y="52" width="52" height="52" rx="10" fill="#1A3ADB"/><text x="46" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="white">ሀ</text><rect x="80" y="52" width="52" height="52" rx="10" fill="rgba(26,58,219,.12)"/><text x="106" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB">ሁ</text><rect x="140" y="52" width="52" height="52" rx="10" fill="rgba(26,58,219,.12)"/><text x="166" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB">ሂ</text><rect x="200" y="52" width="52" height="52" rx="10" fill="rgba(26,58,219,.12)"/><text x="226" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB">ሃ</text><rect x="260" y="52" width="52" height="52" rx="10" fill="rgba(26,58,219,.08)"/><text x="286" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB" opacity=".5">ለ</text><rect x="320" y="52" width="52" height="52" rx="10" fill="rgba(26,58,219,.08)"/><text x="346" y="85" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB" opacity=".4">ሉ</text><rect x="20" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.08)"/><text x="46" y="145" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB" opacity=".35">ሊ</text><rect x="80" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.06)"/><text x="106" y="145" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB" opacity=".25">ላ</text><rect x="140" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.06)"/><text x="166" y="145" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="26" fill="#1A3ADB" opacity=".2">ነ</text><rect x="200" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.04)"/><rect x="260" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.04)"/><rect x="320" y="112" width="52" height="52" rx="10" fill="rgba(26,58,219,.04)"/><rect x="20" y="174" width="100" height="18" rx="6" fill="#1A3ADB" opacity=".12"/><text x="70" y="186" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A3ADB">3 / 276 learned</text><rect x="128" y="174" width="252" height="18" rx="6" fill="rgba(26,58,219,.06)"/><rect x="128" y="174" width="40" height="18" rx="6" fill="#1A3ADB" opacity=".3"/></svg>` },
    { num:'02.', title:'Build Vocabulary & Pronunciation', desc:'Bite-sized daily lessons teach core vocabulary and phrases. Native speaker audio and voice matching give you authentic pronunciation from day one.',
      iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>`,
      illusSvg:`<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#DFF2EA" rx="14"/><text x="200" y="118" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="80" fill="#1A7A4A" opacity=".18">አ</text><rect x="24" y="20" width="88" height="36" rx="10" fill="white" opacity=".9"/><text x="68" y="34" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">SOUND</text><text x="68" y="47" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="13" fill="#1A7A4A">አ = ʼa</text><rect x="120" y="20" width="88" height="36" rx="10" fill="white" opacity=".9"/><text x="164" y="34" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">WORD</text><text x="164" y="47" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="13" fill="#1A7A4A">አዲስ = new</text><rect x="216" y="20" width="88" height="36" rx="10" fill="white" opacity=".9"/><text x="260" y="34" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#1A7A4A">PHRASE</text><text x="260" y="47" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="11" fill="#1A7A4A">ሰላም = hello</text><rect x="24" y="148" width="4" height="20" rx="2" fill="#1A7A4A" opacity=".3"/><rect x="32" y="140" width="4" height="36" rx="2" fill="#1A7A4A" opacity=".4"/><rect x="40" y="132" width="4" height="52" rx="2" fill="#1A7A4A" opacity=".6"/><rect x="48" y="126" width="4" height="64" rx="2" fill="#1A7A4A" opacity=".8"/><rect x="56" y="134" width="4" height="48" rx="2" fill="#1A7A4A" opacity=".7"/><rect x="64" y="144" width="4" height="28" rx="2" fill="#1A7A4A" opacity=".5"/><rect x="72" y="150" width="4" height="16" rx="2" fill="#1A7A4A" opacity=".3"/><rect x="276" y="144" width="100" height="28" rx="8" fill="#1A7A4A"/><text x="326" y="162" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="11" font-weight="700" fill="white">98% Match 🎯</text><text x="200" y="192" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" fill="#1A7A4A" opacity=".6" letter-spacing="1.5">VOCABULARY · PRONUNCIATION · AUDIO</text></svg>` },
    { num:'03.', title:'Speak with Culture', desc:"Culture Bytes connect the language to real Ethiopian life — food, greetings, history, and traditions. Language without culture is just vocabulary.",
      iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      illusSvg:`<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#FEF5DC" rx="14"/><path d="M200,30 C220,32 245,38 258,55 C272,74 265,96 258,114 C250,134 235,148 220,158 C206,167 195,162 184,150 C170,135 162,110 165,88 C168,66 180,42 200,30Z" fill="rgba(200,152,42,.18)" stroke="#C8982A" stroke-width="1.5"/><circle cx="208" cy="108" r="7" fill="#C8982A"/><circle cx="208" cy="108" r="12" fill="none" stroke="#C8982A" stroke-width="1.5" opacity=".4"/><text x="225" y="106" font-family="'DM Sans',sans-serif" font-size="9" font-weight="700" fill="#8A6615">Addis Ababa</text><rect x="20" y="22" width="96" height="26" rx="8" fill="white" opacity=".9"/><text x="68" y="38" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="12" fill="#C8982A">ቡና ☕</text><rect x="288" y="22" width="90" height="26" rx="8" fill="white" opacity=".9"/><text x="333" y="38" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="12" fill="#C8982A">ኢንጀራ 🫓</text><rect x="20" y="155" width="110" height="26" rx="8" fill="white" opacity=".9"/><text x="75" y="171" text-anchor="middle" font-family="'Noto Serif Ethiopic',serif" font-size="11" fill="#C8982A">ጤና ይስጥልኝ 🙏</text><rect x="272" y="155" width="108" height="26" rx="8" fill="white" opacity=".9"/><text x="326" y="171" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" font-weight="600" fill="#8A6615">Culture Byte 🌍</text><text x="200" y="195" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="9" fill="#8A6615" opacity=".6" letter-spacing="1.5">HISTORY · FOOD · TRADITIONS · CONTEXT</text></svg>` },
  ]
  return (
    <div style={{ display:'flex', gap:16, alignItems:'stretch', minHeight:420 }}>
      {cards.map((c,i) => {
        const isH = hovered===i
        const anyH = hovered!==-1
        return (
          <div key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(-1)}
            style={{ position:'relative', background: isH ? '#fff' : '#F6F7FB', border:`1.5px solid ${isH ? 'rgba(10,12,20,.1)' : 'rgba(10,12,20,.08)'}`, borderRadius:22, padding:'28px 24px', cursor:'default', flex: isH ? '2 1 0' : anyH ? '0 0 18%' : '1 1 0', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end', minWidth:0, transition:'flex .5s cubic-bezier(.4,0,.2,1), background .3s, border-color .3s, box-shadow .3s', boxShadow: isH ? '0 6px 32px rgba(10,12,20,.09)' : 'none' }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'3rem', fontWeight:800, color:'rgba(10,12,20,.07)', lineHeight:1, marginBottom:'auto', letterSpacing:'-.03em' }}>{c.num}</div>
            {/* Illustration */}
            <div style={{ width:'100%', borderRadius:12, overflow:'hidden', flexShrink:0, height: isH ? 180 : 0, opacity: isH ? 1 : 0, marginBottom: isH ? 16 : 0, transition:'height .5s cubic-bezier(.4,0,.2,1), opacity .3s .12s, margin-bottom .3s', background:'transparent' }}
              dangerouslySetInnerHTML={{ __html: `<svg style="display:block;width:100%;height:180px" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">${c.illusSvg.replace(/<svg[^>]*>/, '').replace('</svg>','')}</svg>` }} />
            {/* Card body */}
            <div style={{ flexShrink:0 }}>
              <div style={{ width:36, height:36, borderRadius:980, background: isH ? '#1069DD' : '#EAF0FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, transition:'background .3s' }}>
                <span style={{ width:17, height:17, display:'block', color: isH ? '#fff' : '#1069DD' }} dangerouslySetInnerHTML={{ __html: c.iconSvg }} />
              </div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'#0A0C14', lineHeight:1.3 }}>{c.title}</div>
              <div style={{ fontSize:'.84rem', color:'#6B7080', lineHeight:1.62, height: isH ? 'auto' : 0, maxHeight: isH ? 140 : 0, opacity: isH ? 1 : 0, overflow:'hidden', marginTop: isH ? 9 : 0, transition:'max-height .45s cubic-bezier(.4,0,.2,1) .1s, opacity .28s .2s, margin-top .3s .1s' }}>{c.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Service cards ─── */
function ServiceCards() {
  const cards = [
    { featured:false, iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="#1069DD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, title:'The Diaspora', sub:'Reconnect with the language of your heritage and give the next generation their roots.', items:['Heritage & family reconnection','2nd generation learners','Cultural identity & pride'] },
    { featured:true,  iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`, title:'Tourists & Travelers', sub:'Navigate Addis Ababa, order coffee at the source, and unlock a deeper experience.', items:['Essential travel phrases','Food & market vocabulary','Cultural etiquette & context'] },
    { featured:false, iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="#1069DD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`, title:'Diplomats & NGOs', sub:'Formal and professional Amharic for diplomats, aid workers, and delegates — including those heading to COP32 in Africa.', items:['Formal register & protocol','Government & AU vocabulary','Team & embassy accounts'], cop:true },
    { featured:false, iconSvg:`<svg viewBox="0 0 24 24" fill="none" stroke="#1069DD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`, title:'Curious Minds', sub:"Fascinated by Ethiopia's history, cuisine, or culture? Learn the language behind the stories.", items:['Culture & history context','No prior language skills needed','Learn at your own pace'] },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }} className="service-cards-grid">
      {cards.map((c,i) => (
        <div key={i} className={`sc-card ${c.featured?'sc-feat':''}`}
          style={{ background: c.featured ? '#0A0C14' : '#fff', borderRadius:18, border:`1.5px solid ${c.featured ? '#0A0C14' : 'rgba(10,12,20,.08)'}`, padding:'28px 26px', transition:'border-color .25s, transform .2s, box-shadow .25s', cursor:'default', position:'relative', overflow:'hidden' }}>
          <div style={{ width:44, height:44, borderRadius:12, background: c.featured ? 'rgba(255,255,255,.12)' : '#EAF0FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, flexShrink:0 }}>
            <span style={{ width:20, height:20, display:'block' }} dangerouslySetInnerHTML={{ __html: c.iconSvg }} />
          </div>
          <div style={{ fontSize:'1.1rem', fontWeight:700, color: c.featured ? '#fff' : '#0A0C14', marginBottom:10, lineHeight:1.25 }}>{c.title}</div>
          <p style={{ fontSize:'.86rem', color: c.featured ? 'rgba(255,255,255,.6)' : '#6B7080', lineHeight:1.6 }}>
            {c.cop ? <>Formal and professional Amharic for diplomats, aid workers, and delegates — including those heading to <strong style={{ color:'#1069DD' }}>COP32</strong> in Africa.</> : c.sub}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:14, paddingTop:14, borderTop:`1px solid ${c.featured?'rgba(255,255,255,.1)':'rgba(10,12,20,.08)'}` }}>
            {c.items.map(it => (
              <div key={it} style={{ display:'flex', alignItems:'center', gap:9, fontSize:'.84rem', color: c.featured ? 'rgba(255,255,255,.75)' : '#2E3245', fontWeight:500 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', background: c.featured ? 'rgba(255,255,255,.15)' : '#EAF0FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg viewBox="0 0 12 12" width="9" height="9"><polyline points="2,6 5,9 10,3" stroke={c.featured?'#fff':'#1069DD'} strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
                </div>
                {it}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Curriculum section ─── */
function CurriculumSection() {
  const [azIdx, setAzIdx] = useState(0)
  const [hiding, setHiding] = useState(false)
  const [visible, setVisible] = useState([false,false,false,false,false])
  const secRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => {
      setHiding(true)
      setTimeout(() => { setAzIdx(i=>(i+1)%AZ_TEXTS.length); setHiding(false) }, 320)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        CURVE_UNITS.forEach((_,i) => setTimeout(() => setVisible(v=>{const n=[...v];n[i]=true;return n}), i*120))
        obs.disconnect()
      }
    }, { threshold:.15 })
    if (secRef.current) obs.observe(secRef.current)
    return () => obs.disconnect()
  }, [])

  const azText = AZ_TEXTS[azIdx]
  const isEthiopic = azText.includes('ሀ')

  return (
    <section id="curriculum" ref={secRef} style={{ background:'#fff', borderTop:'1px solid rgba(10,12,20,.08)' }} className="curriculum-section">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="curriculum-grid">
        <div>
          <SectionEyebrow letter="ሃ">Curriculum</SectionEyebrow>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'clamp(2rem,3.2vw,3.4rem)', fontWeight:700, letterSpacing:'-.03em', lineHeight:1.07, color:'#062651', marginBottom:16 }}>
            A clear path from<br/>
            <em style={{ fontStyle:'normal', fontWeight:800, color:'#1069DD', background:'#e6edff', borderRadius:100, padding:'4px 20px 8px', letterSpacing:'-.03em', display:'inline-block', fontFamily: isEthiopic ? "'Noto Serif Ethiopic',serif" : undefined, opacity: hiding ? 0 : 1, transform: hiding ? 'translateY(-8px)' : 'none', transition:'opacity .3s, transform .3s' }}>
              {azText}
            </em>
          </div>
          <p style={{ fontSize:'.97rem', color:'#6B7080', lineHeight:1.73, maxWidth:480 }}>Every lesson builds on the last. A structured, progressive curriculum designed by Amharic linguists — not an algorithm.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {CURVE_UNITS.map((u,i) => {
            const bg  = u.type==='gold' ? '#FEF5DC' : u.type==='green' ? '#DFF2EA' : '#F6F7FB'
            const bdr = u.type==='gold' ? 'rgba(200,152,42,.28)' : u.type==='green' ? 'rgba(26,122,74,.22)' : 'rgba(10,12,20,.08)'
            const iconBg = u.type==='gold' ? '#C8982A' : u.type==='green' ? '#1A7A4A' : 'rgba(10,12,20,.08)'
            const iconColor = u.type==='lock' ? '#B0B5C2' : '#fff'
            const barBg = u.type==='gold' ? '#C8982A' : u.type==='green' ? '#1A7A4A' : 'transparent'
            const badgeBg = u.badgeType==='gold' ? '#C8982A' : u.badgeType==='green' ? '#1A7A4A' : '#F6F7FB'
            const badgeColor = u.badgeType==='lock' ? '#B0B5C2' : '#fff'
            const badgeBorder = u.badgeType==='lock' ? '1px solid rgba(10,12,20,.08)' : 'none'
            return (
              <div key={i} style={{ background:bg, border:`1.5px solid ${bdr}`, borderRadius:16, padding:'22px 24px', display:'flex', alignItems:'center', gap:16, minHeight:90, opacity: visible[i] ? (u.type==='lock' ? .38 : 1) : 0, transform: visible[i] ? 'none' : 'translateX(-20px)', transition:'opacity .4s, transform .6s cubic-bezier(.34,1.56,.64,1)' }}>
                <div style={{ width:48, height:48, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', background:iconBg, color:iconColor, transition:'background .3s' }}>{u.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'1rem', fontWeight:700, color:'#0A0C14', marginBottom:3 }}>{u.title}</div>
                  <div style={{ fontSize:'.8rem', color:'#6B7080', fontWeight:400 }}>{u.meta}</div>
                  <div style={{ height:3, background:'rgba(10,12,20,.08)', borderRadius:2, marginTop:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:2, width: visible[i] ? u.pct+'%' : '0%', background:barBg, transition:'width 1.2s cubic-bezier(.4,0,.2,1) .4s' }} />
                  </div>
                </div>
                <div style={{ fontSize:'.68rem', fontWeight:800, borderRadius:7, padding:'5px 11px', letterSpacing:'.04em', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0, background:badgeBg, color:badgeColor, border:badgeBorder }}>{u.badge}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Shared eyebrow component ─── */
function SectionEyebrow({ letter, children }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:'.7rem', fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', color:'#1069DD', marginBottom:13 }}>
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', background:'#1069DD', color:'#fff', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.75rem', fontWeight:700, lineHeight:1, flexShrink:0 }}>{letter}</span>
      {children}
    </div>
  )
}

/* ═══ MAIN COMPONENT ═══ */
export default function Landing() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [langLabel, setLangLabel] = useState('EN')
  const [activeSection, setActiveSection] = useState('')
  const comingSoonRef = useRef(null)

  const scrollToBottom = () => comingSoonRef.current?.scrollIntoView({ behavior:'smooth' })

  useEffect(() => {
    const close = e => { if (e.key==='Escape') { setDrawerOpen(false); setLangOpen(false) } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  useEffect(() => {
    const sections = ['how','curriculum','features','coming-soon']
    const onScroll = () => {
      let current = ''
      sections.forEach(id => {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) current = id
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close lang dropdown on outside click
  useEffect(() => {
    const close = () => setLangOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const langs = [
    { code:'EN', label:'🇺🇸 \u00a0English' },
    { code:'አማ', label:'🇪🇹 \u00a0አማርኛ (Amharic)' },
    { code:'FR', label:'🇫🇷 \u00a0Français' },
    { code:'AR', label:'🇸🇦 \u00a0العربية' },
    { code:'IT', label:'🇮🇹 \u00a0Italiano' },
  ]

  const navItems = [
    { href:'#how', label:'How it works', section:'how' },
    { href:'#curriculum', label:'Curriculum', section:'curriculum' },
    { href:'#features', label:'Features', section:'features' },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:'#0A0C14', background:'#fff', overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@400;600;700&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--lnav-h:82px}
        html{scroll-behavior:smooth}

        .landing-h2{font-family:'DM Sans',sans-serif;font-size:clamp(2rem,3.2vw,3.3rem);font-weight:700;letter-spacing:-.03em;line-height:1.07;color:#062651;margin-bottom:14px}
        .landing-h2 em{font-style:normal;font-weight:800;color:#1069DD;background:#e6edff;border-radius:100px;padding:4px 20px 8px;display:inline-block;letter-spacing:-.03em}

        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes cbFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        .nav-link-a{font-size:.9rem;font-weight:500;color:#6B7080;text-decoration:none;padding:7px 16px;border-radius:980px;transition:color .2s,background .2s;white-space:nowrap}
        .nav-link-a:hover{color:#0A0C14;background:rgba(10,12,20,.05)}
        .nav-link-a.active{color:#1069DD;background:#e6edff;font-weight:600}

        /* Default (desktop) padding for all major sections */
        .hero-section{padding-left:100px;padding-right:100px}
        .how-section{padding:100px 100px}
        .learners-section{padding:100px 100px}
        .curriculum-section{padding:100px 100px}
        .coming-wrap{padding:80px 100px 100px}
        .coming-section{padding:100px 120px}
        .feat-header-wrap{padding:80px 100px 56px}
        .feat-sticky-grid{padding:0 100px}
        footer.main-footer{padding:0 100px}
        .btn-nav-outline{background:transparent;color:#1069DD;border:1.5px solid #1069DD;border-radius:980px;padding:8px 20px;font:.79rem/1 'DM Sans',sans-serif;font-weight:700;cursor:pointer;transition:background .2s,color .2s;white-space:nowrap;text-decoration:none;display:inline-block}
        .btn-nav-outline:hover{background:#1069DD;color:#fff}
        .btn-nav-solid{background:#1069DD;color:#fff;border:1.5px solid #1069DD;border-radius:980px;padding:8px 20px;font:.79rem/1 'DM Sans',sans-serif;font-weight:700;cursor:pointer;white-space:nowrap;text-decoration:none;display:inline-block;transition:opacity .2s}
        .btn-nav-solid:hover{opacity:.85}

        .sc-card:hover:not(.sc-feat){border-color:#C5D3FF!important;transform:translateY(-3px);box-shadow:0 8px 32px rgba(26,58,219,.1)}
        .sc-card.sc-feat:hover{transform:translateY(-3px)}

        /* Features card transition — exact HTML .feat-card.exiting / .entering */
        .feat-card-exiting{opacity:0!important;transform:translateY(16px) scale(.98)!important}
        .feat-card-entering{opacity:0!important;transform:translateY(-16px) scale(.98)!important}

        /* Responsive */
        @media(max-width:1200px){
          nav.main-nav{width:calc(100% - 80px)!important}
          .hero-section{padding-left:60px!important;padding-right:60px!important}
          .how-section{padding:80px 60px!important}
          .learners-section{padding:80px 60px!important}
          .curriculum-section{padding:80px 60px!important}
          .curriculum-grid{gap:52px!important}
          .feat-header-wrap{padding:70px 60px 48px!important}
          .feat-sticky-grid{padding:0 60px!important}
          .coming-wrap{padding:60px 60px 80px!important}
          .coming-section{padding:80px 80px!important}
          .cs-right-col{flex:0 0 340px!important;width:340px!important}
          footer.main-footer{padding:0 60px!important}
        }
        @media(max-width:960px){
          :root{--lnav-h:68px}
          nav.main-nav{width:calc(100% - 40px)!important;top:12px!important;height:64px!important;padding:0 12px 0 18px!important}
          .nav-links-row{display:none!important}
          .nav-burger-btn{display:flex!important}
          .btn-desktop-cta{display:none!important}
          .hero-section{flex-direction:column!important;align-items:flex-start!important;min-height:auto!important;padding:calc(var(--lnav-h) + 40px) 40px 0!important;gap:0!important}
          .hero-left-col{flex:none!important;width:100%!important;padding:0!important;margin-bottom:0!important}
          .hero-right-col{width:100%!important;flex:none!important;height:480px!important}
          .how-section{padding:72px 40px!important}
          .how-cards-row{flex-direction:column!important}
          .learners-section{padding:72px 40px!important}
          .service-cards-grid{grid-template-columns:repeat(2,1fr)!important}
          .curriculum-section{padding:72px 40px!important}
          .curriculum-grid{grid-template-columns:1fr!important;gap:40px!important}
          .feat-header-wrap{padding:60px 40px 32px!important}
          .feat-sticky-grid{padding:16px 40px 0!important;grid-template-columns:1fr!important;grid-template-rows:auto auto!important;height:calc(100vh - var(--lnav-h) - 40px);align-content:center;align-items:center}
          .feat-list-col{display:none!important}
          .coming-wrap{padding:48px 24px 60px!important}
          .coming-section{flex-direction:column!important;border-radius:40px!important;padding:56px 40px!important;gap:40px!important}
          .cs-right-col{flex:none!important;width:100%!important}
          footer.main-footer{padding:0 40px!important}
          .footer-phrase{display:none!important}
        }
        @media(max-width:767px){
          :root{--lnav-h:62px}
          nav.main-nav{width:calc(100% - 24px)!important;top:10px!important;height:62px!important;padding:0 10px 0 14px!important}
          .hero-section{padding:calc(var(--lnav-h) + 32px) 24px 0!important}
          .hero-right-col{height:440px!important}
          .how-section{padding:56px 24px!important}
          .learners-section{padding:56px 24px!important}
          .service-cards-grid{grid-template-columns:1fr!important;gap:12px!important}
          .curriculum-section{padding:56px 24px!important}
          .curriculum-grid{gap:28px!important}
          .feat-header-wrap{padding:48px 24px 28px!important}
          .feat-sticky-grid{padding:16px 20px 0!important}
          .coming-wrap{padding:32px 16px 48px!important}
          .coming-section{border-radius:28px!important;padding:40px 24px!important}
          footer.main-footer{padding:0 24px!important}
          .footer-inner-row{flex-direction:column!important;align-items:flex-start!important;height:auto!important;padding:24px 0!important;gap:12px!important}
        }
        @media(max-width:480px){
          nav.main-nav{width:calc(100% - 16px)!important;padding:0 8px 0 12px!important}
          .hero-section{padding:calc(var(--lnav-h) + 28px) 16px 0!important}
          .hero-right-col{height:400px!important}
          .how-section{padding:48px 16px!important}
          .learners-section{padding:48px 16px!important}
          .curriculum-section{padding:48px 16px!important}
          .feat-header-wrap{padding:40px 16px 24px!important}
          .feat-sticky-grid{padding:14px 16px 0!important}
          .coming-wrap{padding:24px 10px 40px!important}
          .coming-section{padding:32px 18px!important;border-radius:22px!important}
          footer.main-footer{padding:0 16px!important}
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav className="main-nav" style={{ position:'fixed', top:16, left:'50%', transform:'translateX(-50%)', zIndex:300, width:'calc(100% - 200px)', maxWidth:1420, height:72, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px 0 20px', background:'rgba(255,255,255,.92)', backdropFilter:'blur(28px)', border:'1px solid rgba(10,12,20,.07)', borderRadius:980, boxShadow:'0 4px 32px rgba(10,12,20,.08)', gap:8 }}>
        <a href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'1.35rem', color:'#0A0C14', textDecoration:'none', letterSpacing:'-.01em', display:'flex', alignItems:'center', gap:9, paddingLeft:4, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#1069DD', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.95rem', color:'#fff', fontWeight:700, flexShrink:0, lineHeight:1 }}>አ</div>
          Amharican
        </a>

        <div className="nav-links-row" style={{ display:'flex', gap:2, padding:4, flex:1, justifyContent:'center' }}>
          {navItems.map(n => (
            <a key={n.href} href={n.href} className={`nav-link-a ${activeSection===n.section?'active':''}`}>{n.label}</a>
          ))}
        </div>

        <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
          {/* Language dropdown */}
          <div style={{ position:'relative' }}>
            <button onClick={e=>{e.stopPropagation();setLangOpen(o=>!o)}} style={{ display:'flex', alignItems:'center', gap:5, background:'#EAF0FF', border:'1.5px solid #C5D3FF', color:'#062651', borderRadius:980, padding:'6px 13px', font:'.75rem/1 DM Sans,sans-serif', fontWeight:600, cursor:'pointer', transition:'background .2s' }}>
              🌐 <span>{langLabel}</span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {langOpen && (
              <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 10px)', right:0, background:'#fff', border:'1px solid rgba(10,12,20,.08)', borderRadius:16, padding:6, boxShadow:'0 8px 32px rgba(10,12,20,.12)', minWidth:162, zIndex:400 }}>
                {langs.map(l => (
                  <div key={l.code} onClick={()=>{setLangLabel(l.code);setLangOpen(false)}}
                    style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 11px', borderRadius:980, cursor:'pointer', fontSize:'.81rem', fontWeight: l.code===langLabel ? 700 : 500, color: l.code===langLabel ? '#1069DD' : '#2E3245', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#F6F7FB'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/login" className="btn-nav-outline btn-desktop-cta">Sign in</Link>
          <Link to="/signup" className="btn-nav-solid btn-desktop-cta">Get started</Link>
          {/* Hamburger */}
          <button className="nav-burger-btn" onClick={()=>setDrawerOpen(true)} style={{ display:'none', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:5, width:36, height:36, background:'none', border:'none', cursor:'pointer', padding:4, borderRadius:'50%', transition:'background .2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(10,12,20,.06)'} onMouseLeave={e=>e.currentTarget.style.background='none'} aria-label="Open menu">
            <span style={{ display:'block', width:18, height:2, borderRadius:2, background:'#0A0C14' }} />
            <span style={{ display:'block', width:18, height:2, borderRadius:2, background:'#0A0C14' }} />
            <span style={{ display:'block', width:18, height:2, borderRadius:2, background:'#0A0C14' }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:290 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(10,12,20,.3)', backdropFilter:'blur(4px)' }} onClick={()=>setDrawerOpen(false)} />
          <div style={{ position:'absolute', top:0, left:0, right:0, background:'#fff', borderRadius:'0 0 28px 28px', padding:'20px 24px 28px', boxShadow:'0 8px 40px rgba(10,12,20,.14)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, paddingTop:8 }}>
              <a href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'1.2rem', color:'#0A0C14', textDecoration:'none', letterSpacing:'-.01em', display:'flex', alignItems:'center', gap:9 }} onClick={()=>setDrawerOpen(false)}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#1069DD', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.95rem', color:'#fff', fontWeight:700 }}>አ</div>
                Amharican
              </a>
              <button onClick={()=>setDrawerOpen(false)} style={{ width:36, height:36, borderRadius:'50%', background:'#F6F7FB', border:'1.5px solid rgba(10,12,20,.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#0A0C14' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {navItems.map(n => (
                <a key={n.href} href={n.href} onClick={()=>setDrawerOpen(false)}
                  style={{ display:'block', padding:'12px 16px', fontSize:'1rem', fontWeight:500, color: activeSection===n.section ? '#1069DD' : '#2E3245', textDecoration:'none', borderRadius:12, background: activeSection===n.section ? '#EAF0FF' : 'transparent', transition:'background .15s,color .15s' }}>{n.label}</a>
              ))}
            </div>
            <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid rgba(10,12,20,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div style={{ display:'flex', gap:6, flex:1 }}>
                <Link to="/login" onClick={()=>setDrawerOpen(false)} className="btn-nav-outline" style={{ flex:1, textAlign:'center' }}>Sign in</Link>
                <Link to="/signup" onClick={()=>setDrawerOpen(false)} className="btn-nav-solid" style={{ flex:1, textAlign:'center' }}>Get started</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO ══ */}
      <section id="hero" className="hero-section" style={{ width:'100%', minHeight:'100vh', display:'flex', flexDirection:'row', alignItems:'center', paddingTop:'calc(var(--lnav-h) + 20px)', paddingBottom:40, overflow:'hidden', position:'relative', background:'#fff', boxSizing:'border-box' }}>
        {/* Left */}
        <div className="hero-left-col" style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 40px 0 0', position:'relative', zIndex:1, flex:'0 0 50%', width:'50%' }}>
          {/* Eyebrow */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:0, marginBottom:20, width:'fit-content', animation:'fadeUp .6s .1s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.71rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#2A55A1' }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:'50%', background:'#2A55A1', color:'#fff', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.65rem', fontWeight:700, flexShrink:0, lineHeight:1 }}>ሀ</span>
              Now available · Amharic for everyone
            </div>
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'clamp(2.2rem,3.4vw,4.2rem)', fontWeight:800, lineHeight:1.06, letterSpacing:'-.03em', color:'#062651', marginBottom:0, animation:'fadeUp .6s .2s both' }}>
            <span style={{ display:'block' }}>Speak Amharic.</span>
            <span style={{ display:'block' }}>Connect with culture,</span>
            <HeroPillRow />
          </h1>

          <p style={{ fontSize:'.9rem', color:'#6B7080', lineHeight:1.72, maxWidth:420, marginTop:18, marginBottom:28, animation:'fadeUp .6s .35s both', fontWeight:400 }}>
            From the Ge'ez alphabet to everyday conversation — <strong style={{ color:'#0A0C14', fontWeight:700 }}>Amharican</strong> guides diaspora, tourists &amp; diplomats through Ethiopia's official language with bite-sized lessons, real pronunciation, and living culture.
          </p>

          <div style={{ display:'flex', gap:12, alignItems:'center', animation:'fadeUp .6s .45s both' }}>
            <Link to="/signup" style={{ background:'#1069DD', color:'#fff', border:'none', borderRadius:980, padding:'10px 10px 10px 22px', font:'.92rem/1 DM Sans,sans-serif', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:10, textDecoration:'none', transition:'opacity .15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='.84'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Start learning for free
              <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
            <button onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}
              style={{ background:'transparent', border:'1.5px solid #C5D3FF', color:'#062651', borderRadius:980, padding:'10px 10px 10px 20px', font:'.9rem/1 DM Sans,sans-serif', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:10, transition:'border-color .2s,background .2s,color .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#1069DD';e.currentTarget.style.color='#1069DD';e.currentTarget.style.background='#EAF0FF'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#C5D3FF';e.currentTarget.style.color='#062651';e.currentTarget.style.background='transparent'}}>
              See how it works
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#EAF0FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#1069DD"><path d="M5 3l14 9-14 9V3z"/></svg>
              </div>
            </button>
          </div>
        </div>

        {/* Right carousel */}
        <div className="hero-right-col" style={{ position:'relative', flex:1, minWidth:0, height:'calc(100vh - var(--lnav-h) - 36px)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <HeroCarousel />
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" className="how-section" style={{ background:'#fff', borderTop:'1px solid rgba(10,12,20,.08)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:60, gap:40 }}>
          <div style={{ maxWidth:420 }}>
            <SectionEyebrow letter="ሁ">How it works</SectionEyebrow>
            <h2 className="landing-h2">Three steps to <em>fluency</em></h2>
          </div>
          <div style={{ maxWidth:340, paddingTop:8 }}>
            <p style={{ fontSize:'.9rem', color:'#6B7080', lineHeight:1.72 }}>From zero to conversational Amharic — a structured path that fits your daily life, whether you have 5 minutes or 50.</p>
          </div>
        </div>
        <div className="how-cards-row">
          <HowCards />
        </div>
      </section>

      {/* ══ LEARNERS ══ */}
      <section id="learners" className="learners-section" style={{ background:'#F6F7FB', borderTop:'1px solid rgba(10,12,20,.08)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:60, marginBottom:52 }}>
          <div style={{ maxWidth:420 }}>
            <SectionEyebrow letter="ሂ">Made for you</SectionEyebrow>
            <h2 className="landing-h2">Built for <em>every</em> kind of learner</h2>
          </div>
          <div style={{ maxWidth:380, paddingTop:8, flexShrink:0 }}>
            <p style={{ fontSize:'.95rem', color:'#6B7080', lineHeight:1.72 }}>Whether Amharic connects you to your roots, your next destination, or your next posting — Amharican was built for the real world it lives in.</p>
          </div>
        </div>
        <ServiceCards />
      </section>

      {/* ══ CURRICULUM ══ */}
      <CurriculumSection />

      {/* ══ FEATURES ══ */}
      <Features />

      {/* ══ COMING SOON / CTA ══ */}
      <div ref={comingSoonRef} id="coming-soon-wrap" className="coming-wrap" style={{ background:'#fff' }}>
        <section id="coming-soon" className="coming-section" style={{ background:'#062651', borderRadius:100, display:'flex', alignItems:'center', justifyContent:'space-between', gap:60, position:'relative', overflow:'hidden', textAlign:'left' }}>
          {/* Radial glows */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 300px 130px at 80% 20%,rgba(255,255,255,.08),transparent 55%),radial-gradient(ellipse 310px 140px at 10% 80%,rgba(255,255,255,.05),transparent 50%)' }} />
          {/* Ethiopic watermark */}
          <div style={{ fontFamily:"'Noto Serif Ethiopic',serif", position:'absolute', fontSize:'clamp(300px,45vw,680px)', color:'rgba(255,255,255,.018)', lineHeight:1, left:'50%', top:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', whiteSpace:'nowrap', zIndex:0 }}>ሰላም</div>

          {/* Left */}
          <div style={{ position:'relative', zIndex:1, flex:1, minWidth:0, maxWidth:560 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.14)', border:'.9px solid rgba(255,255,255,.22)', color:'#fff', borderRadius:980, padding:'5px 16px', fontSize:'.65rem', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:32 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', display:'inline-block' }} />
              Free to get started
            </div>
            <h2 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'clamp(2rem,3.5vw,4rem)', fontWeight:800, letterSpacing:'-.025em', lineHeight:1, color:'#fff', marginBottom:0 }}>
              Start speaking Amharic with confidence.
            </h2>
          </div>

          {/* Right */}
          <div className="cs-right-col" style={{ position:'relative', zIndex:1, flex:'0 0 400px', width:400 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:'.65rem', fontWeight:700, letterSpacing:'.09em', textTransform:'uppercase', color:'#fff', marginBottom:8 }}>
              <span style={{ width:13, height:1.8, background:'#fff', borderRadius:1, display:'inline-block' }} />
              Jump right in
            </div>
            <div style={{ fontSize:'clamp(1.5rem,2.5vw,2rem)', fontWeight:800, color:'#fff', letterSpacing:'-.025em', lineHeight:1.1, marginBottom:8 }}>Your journey starts now</div>
            <p style={{ fontSize:'.82rem', color:'#6B7080', lineHeight:1.62, marginBottom:20 }}>Create a free account in seconds and begin your first Amharic lesson right away — no credit card needed.</p>
            <div style={{ display:'flex', gap:10, width:'100%' }}>
              <Link to="/signup" style={{ flex:1, textAlign:'center', background:'#1069DD', color:'#fff', border:'none', borderRadius:50, padding:'14px 22px', fontSize:'.9rem', fontWeight:700, cursor:'pointer', textDecoration:'none', transition:'opacity .15s', display:'block' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='.82'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Get started</Link>
              <Link to="/login" style={{ flex:1, textAlign:'center', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,.35)', borderRadius:50, padding:'14px 22px', fontSize:'.84rem', fontWeight:700, cursor:'pointer', textDecoration:'none', transition:'border-color .2s,background .2s', display:'block' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#fff';e.currentTarget.style.background='rgba(255,255,255,.08)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.35)';e.currentTarget.style.background='transparent'}}>Sign in</Link>
            </div>
            <p style={{ fontSize:'.68rem', color:'#B0B5C2', fontWeight:500, marginTop:10 }}>Free forever plan available. No credit card required.</p>
          </div>
        </section>
      </div>
      {/* ══ FOOTER ══ */}
      <footer className="main-footer" style={{ background:'#062651', color:'rgba(255,255,255,.55)' }}>
        <div className="footer-inner-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:108, gap:40 }}>
          <a href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'1.35rem', color:'#fff', textDecoration:'none', letterSpacing:'-.01em', display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#1069DD', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.95rem', color:'#fff', fontWeight:700, flexShrink:0, lineHeight:1 }}>አ</div>
            Amharican
          </a>
          <span style={{ fontSize:'.82rem', color:'rgba(255,255,255,.5)' }}>© 2026 Amharican</span>
          <span className="footer-phrase" style={{ fontFamily:"'Noto Serif Ethiopic',serif", fontSize:'.82rem', color:'rgba(255,255,255,.55)' }}>ቋንቋ ድልድይ ነው — Language is a bridge.</span>
        </div>
      </footer>
    </div>
  )
}