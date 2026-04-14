import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Link }     from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutDashboard, BookOpen, FileText, BookMarked, Users, Mic,
  Plus, Trash2, Save, Edit2, X, ChevronDown, ChevronRight,
  RefreshCw, Volume2, Upload, Play, Pause, CheckCircle2,
  ToggleLeft, ToggleRight, Search, Filter, ArrowUp, ArrowDown,
  AlertCircle, Eye, EyeOff, Zap, Flame, TrendingUp, Award,
  Download, Globe, Lock, Video, Shield, CheckSquare, Square
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const EX_TYPES = ['multiple_choice', 'word_match', 'listen_select']
const EX_LABELS = {
  multiple_choice: { label: 'Multiple Choice', icon: '🔤', color: 'bg-blue-50 text-blue-600'   },
  word_match:      { label: 'Word Match',       icon: '🔗', color: 'bg-purple-50 text-purple-600' },
  listen_select:   { label: 'Listen & Select',  icon: '🔊', color: 'bg-brand-50 text-brand-600'  },
}
const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'content',   label: 'Content',    icon: BookOpen        },
  { id: 'videos',    label: 'Videos',     icon: Video           },
  { id: 'vocab',     label: 'Vocabulary', icon: BookMarked      },
  { id: 'audio',     label: 'Audio',      icon: Mic             },
  { id: 'users',     label: 'Users',      icon: Users           },
  { id: 'settings',  label: 'Settings',   icon: FileText        },
]

// Granular admin permission keys → labels
const ALL_PERMISSIONS = {
  manage_content:  { label: 'Manage Content',    desc: 'Create / edit / delete units, lessons & exercises' },
  manage_videos:   { label: 'Manage Videos',     desc: 'Upload and manage video lessons' },
  manage_vocab:    { label: 'Manage Vocabulary', desc: 'Add / edit / delete vocabulary words' },
  manage_audio:    { label: 'Manage Audio',      desc: 'Upload and manage audio files' },
  manage_users:    { label: 'Manage Users',      desc: 'View user profiles and manage roles' },
  grant_admin:     { label: 'Grant Admin',       desc: 'Promote or demote other admins' },
  manage_settings: { label: 'Manage Settings',   desc: 'Edit platform-wide settings' },
}

function hasPermission(profile, key) {
  if (!profile) return false
  if (profile.role === 'admin' && !profile.admin_permissions) return true // legacy full admin
  if (profile.role === 'admin' && profile.admin_permissions === 'all') return true
  try {
    const perms = typeof profile.admin_permissions === 'string'
      ? JSON.parse(profile.admin_permissions)
      : (profile.admin_permissions || {})
    return !!perms[key]
  } catch { return false }
}

// ─────────────────────────────────────────────────────────────
// REUSABLE UI
// ─────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className={clsx(
        'bg-white rounded-3xl shadow-float w-full max-h-[92vh] overflow-y-auto',
        wide ? 'max-w-2xl' : 'max-w-lg'
      )} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-start justify-between px-6 py-5 border-b border-stone-100 z-10">
          <div>
            <h3 className="font-bold text-[17px] text-stone-900">{title}</h3>
            {subtitle && <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-stone-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center mb-3', accent)}>
        <Icon size={18} className="text-white" strokeWidth={2} />
      </div>
      <p className="text-[26px] font-bold text-stone-900 leading-none">{value ?? '—'}</p>
      <p className="text-[13px] text-stone-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold', color)}>
      {label}
    </span>
  )
}

// Audio player for preview
function AudioPreview({ url, text }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const toggle = (e) => {
    e?.stopPropagation()
    if (!url && !text) return
    if (url) {
      if (!audioRef.current) { audioRef.current = new Audio(url) }
      if (playing) { audioRef.current.pause(); setPlaying(false) }
      else {
        audioRef.current.src = url
        audioRef.current.play()
        audioRef.current.onended = () => setPlaying(false)
        setPlaying(true)
      }
    } else {
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'am-ET'; utt.rate = 0.85
      utt.onend = () => setPlaying(false)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utt)
      setPlaying(true)
    }
  }

  if (!url && !text) return null
  return (
    <button onClick={toggle}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all shrink-0',
        playing ? 'bg-brand-100 text-brand-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
      )}>
      {playing ? <Pause size={12} /> : <Play size={12} />}
      {url ? (playing ? 'Pause' : 'Play') : (playing ? 'Playing…' : 'TTS Preview')}
    </button>
  )
}

// ── Upload a file to Supabase Storage bucket "audio" ──
// Returns the public URL or throws
async function uploadAudioFile(file, folder) {
  // Compress before uploading
  const compressed = await compressAudio(file)
  const safeName   = compressed.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
  const path       = `${folder}/${Date.now()}_${safeName}`
  file             = compressed

  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(data.path)

  return publicUrl
}

// ── Compress audio using Web Audio API + OfflineAudioContext ──
// Converts to mono, resamples to 22050Hz, exports as WAV (~64kbps equivalent)
async function compressAudio(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const audioCtx    = new AudioContext()
    const decoded     = await audioCtx.decodeAudioData(arrayBuffer)
    audioCtx.close()

    const targetSampleRate = 22050
    const duration         = decoded.duration
    const offlineCtx       = new OfflineAudioContext(1, Math.ceil(duration * targetSampleRate), targetSampleRate)
    const source           = offlineCtx.createBufferSource()
    source.buffer          = decoded
    source.connect(offlineCtx.destination)
    source.start(0)
    const rendered = await offlineCtx.startRendering()

    // Convert to 16-bit WAV
    const numSamples = rendered.length
    const buffer     = new ArrayBuffer(44 + numSamples * 2)
    const view       = new DataView(buffer)
    const writeStr   = (off, str) => { for (let i=0; i<str.length; i++) view.setUint8(off+i, str.charCodeAt(i)) }
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); writeStr(8, 'WAVE')
    writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true)
    view.setUint16(22, 1, true); view.setUint32(24, targetSampleRate, true)
    view.setUint32(28, targetSampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
    writeStr(36, 'data'); view.setUint32(40, numSamples * 2, true)
    const samples = rendered.getChannelData(0)
    let offset = 44
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      offset += 2
    }
    const compressed = new File([buffer], file.name.replace(/.[^.]+$/, '.wav'), { type: 'audio/wav' })
    console.log(`Audio compressed: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB`)
    return compressed
  } catch (err) {
    console.warn('Compression failed, using original:', err.message)
    return file  // fallback to original
  }
}

// ── Delete a file from Supabase Storage given its public URL ──
async function deleteAudioFile(url) {
  if (!url) return
  try {
    // Extract path after "/object/public/audio/"
    const marker = '/object/public/audio/'
    const idx    = url.indexOf(marker)
    if (idx === -1) return
    const path   = url.slice(idx + marker.length)
    await supabase.storage.from('audio').remove([path])
  } catch (e) {
    console.warn('Could not delete old audio file:', e.message)
  }
}


// ─────────────────────────────────────────────────────────────
// EXERCISE WIZARD — Step-by-step guided exercise creation
// ─────────────────────────────────────────────────────────────
const OPTION_TEMPLATES = {
  multiple_choice: { label: 'Multiple Choice', hint: 'Type Amharic word → enter 4 English options → pick correct one', optionsLabel: 'Answer options (4 choices)', optionsPlaceholder: 'Hello, Goodbye, Thank you, Please', correct_type: 'select' },
  word_match:      { label: 'Word Match',      hint: 'Enter 4 Amharic-English pairs to match', optionsLabel: 'Pairs (am:en format, one per line)', optionsPlaceholder: 'ሰላም:Hello\nደህና ሁን:Goodbye\nአዎ:Yes\nአይ:No', correct_type: 'auto' },
  listen_select:   { label: 'Listen & Select', hint: 'Show 4 Amharic options — student picks the one they heard', optionsLabel: 'Amharic options (4 choices)', optionsPlaceholder: 'ሰላም, ደህና ሁን, አዎ, አይ', correct_type: 'select_am' },
}

function ExerciseWizard({ lessonId, saving, onAdd }) {
  const [step,      setStep]      = useState(1)  // 1=type 2=content 3=options 4=audio
  const [data,      setData]      = useState({ type:'', prompt_am:'', prompt_en:'', romanization:'', options:'', correct_answer:'', audio_url:'' })
  const [audioFile, setAudioFile] = useState(null)
  const [preview,   setPreview]   = useState(null)
  const fileRef = useRef(null)

  const tmpl     = data.type ? OPTION_TEMPLATES[data.type] : null
  const canNext1 = !!data.type
  const canNext2 = data.prompt_am.trim().length > 0
  const canNext3 = data.options.trim().length > 0 && data.correct_answer.trim().length > 0

  const buildOptions = (raw) => {
    if (!raw) return []
    if (data.type === 'word_match') {
      return raw.trim().split('\n').map(l => {
        const [am, en] = l.split(':').map(s => s.trim())
        return { am: am || '', en: en || '' }
      }).filter(p => p.am && p.en)
    }
    try { return JSON.parse(raw) } catch { return raw.split(',').map(s => s.trim()).filter(Boolean) }
  }

  const reset = () => {
    setStep(1); setData({ type:'', prompt_am:'', prompt_en:'', romanization:'', options:'', correct_answer:'', audio_url:'' })
    setAudioFile(null); setPreview(null)
  }

  const handleSubmit = async () => {
    const finalData = { ...data, options: JSON.stringify(buildOptions(data.options)) }
    if (data.type === 'word_match') finalData.correct_answer = 'matched'
    await onAdd(lessonId, finalData, audioFile)
    reset()
  }

  const STEPS = ['Type', 'Content', 'Options', 'Audio']

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4">
      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={clsx(
              'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all',
              step > i+1 ? 'bg-brand-500 text-white' : step === i+1 ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-300' : 'bg-stone-100 text-stone-400'
            )}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <span className={clsx('text-[10px] font-semibold', step === i+1 ? 'text-brand-600' : 'text-stone-300')}>
              {s}
            </span>
            {i < STEPS.length-1 && <div className="w-4 h-px bg-stone-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Type */}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-[12px] font-bold text-stone-500 uppercase tracking-widest">Choose exercise type</p>
          {EX_TYPES.map(t => (
            <button key={t} onClick={() => setData(d => ({ ...d, type: t }))}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                data.type === t ? 'border-brand-400 bg-brand-50' : 'border-stone-100 hover:border-stone-200'
              )}>
              <span className="text-xl">{EX_LABELS[t].icon}</span>
              <div>
                <p className={clsx('text-[13px] font-bold', data.type===t?'text-brand-700':'text-stone-800')}>{EX_LABELS[t].label}</p>
                <p className="text-[11px] text-stone-400">{OPTION_TEMPLATES[t].hint}</p>
              </div>
            </button>
          ))}
          <button onClick={() => canNext1 && setStep(2)} disabled={!canNext1}
            className="btn-primary w-full mt-2 text-sm">Next →</button>
        </div>
      )}

      {/* Step 2 — Content */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-stone-500 uppercase tracking-widest">
            {EX_LABELS[data.type].icon} {EX_LABELS[data.type].label} — Enter content
          </p>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">Amharic word / prompt *</label>
            <input className="input am text-lg" placeholder="e.g. ሰላም" value={data.prompt_am}
              onChange={e => setData(d => ({ ...d, prompt_am: e.target.value }))} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-stone-500 mb-1 block">English translation</label>
              <input className="input text-sm" placeholder="e.g. Hello" value={data.prompt_en}
                onChange={e => setData(d => ({ ...d, prompt_en: e.target.value }))} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-500 mb-1 block">Romanization</label>
              <input className="input text-sm" placeholder="e.g. Selam" value={data.romanization}
                onChange={e => setData(d => ({ ...d, romanization: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm">← Back</button>
            <button onClick={() => canNext2 && setStep(3)} disabled={!canNext2} className="btn-primary flex-1 text-sm">Next →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Options */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="bg-stone-50 rounded-xl p-3 flex items-center gap-2">
            <p className="am text-2xl font-bold text-stone-900">{data.prompt_am}</p>
            {data.prompt_en && <p className="text-stone-400 text-sm">= {data.prompt_en}</p>}
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-500 mb-1 block">{tmpl?.optionsLabel}</label>
            <textarea className="input text-sm h-20 resize-none font-mono" value={data.options}
              placeholder={tmpl?.optionsPlaceholder}
              onChange={e => setData(d => ({ ...d, options: e.target.value }))} />
          </div>
          {data.type !== 'word_match' && (
            <div>
              <label className="text-[11px] font-semibold text-stone-500 mb-1 block">Correct answer *</label>
              <input className="input text-sm" value={data.correct_answer}
                placeholder={data.type === 'listen_select' ? 'The Amharic word that is correct (e.g. ሰላም)' : 'The correct English answer (e.g. Hello)'}
                onChange={e => setData(d => ({ ...d, correct_answer: e.target.value }))} />
            </div>
          )}
          {data.type === 'word_match' && (
            <div className="bg-blue-50 rounded-xl p-2 text-[11px] text-blue-700">
              Word Match auto-sets the answer. Just enter the pairs above.
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 text-sm">← Back</button>
            <button onClick={() => (data.type==='word_match'||canNext3) && setStep(4)}
              disabled={data.type !== 'word_match' && !canNext3} className="btn-primary flex-1 text-sm">Next →</button>
          </div>
        </div>
      )}

      {/* Step 4 — Audio */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="am text-3xl font-bold text-stone-900">{data.prompt_am}</p>
            <p className="text-[12px] text-stone-400 mt-1">Add audio for this word (optional)</p>
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all',
              audioFile ? 'border-brand-400 bg-brand-50' : 'border-stone-200 hover:border-brand-300'
            )}>
            <Mic size={15} className={audioFile ? 'text-brand-500' : 'text-stone-400'} />
            {audioFile ? (
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <p className="text-[12px] font-semibold text-stone-800 truncate">{audioFile.name}</p>
                <p className="text-[11px] text-stone-400 shrink-0">{(audioFile.size/1024).toFixed(0)}KB</p>
                {preview && <AudioPreview url={preview} text={null} />}
              </div>
            ) : (
              <p className="text-[12px] text-stone-400">Click to choose audio file (mp3, wav…) — will be compressed</p>
            )}
            {audioFile && (
              <button type="button" onClick={e=>{e.stopPropagation();setAudioFile(null);setPreview(null)}}
                className="text-red-400 shrink-0"><X size={13}/></button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f){setAudioFile(f);setPreview(URL.createObjectURL(f))};e.target.value=''}} />
          {!audioFile && (
            <input className="input text-sm" placeholder="Or paste an audio URL" value={data.audio_url}
              onChange={e => setData(d => ({ ...d, audio_url: e.target.value }))} />
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1 text-sm">← Back</button>
            <button onClick={handleSubmit} disabled={saving}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <><Plus size={13}/> Add Exercise</>}
            </button>
          </div>
          <button onClick={reset} className="w-full text-[11px] text-stone-400 hover:text-stone-600 py-1">
            Cancel & reset
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AUDIO UPLOAD MODAL
// ─────────────────────────────────────────────────────────────
function AudioUploadModal({ item, saving, onSave, onRemove, onClose }) {
  const [file,    setFile]    = useState(null)
  const [url,     setUrl]     = useState(item.url || '')
  const [preview, setPreview] = useState(null)  // local blob URL
  const [tab,     setTab]     = useState(item.url ? 'url' : 'upload')
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = () => {
    if (tab === 'upload') {
      onSave(item.id, null, item.type, file, item.url)
    } else {
      onSave(item.id, url, item.type, null, item.url)
    }
  }

  const canSave = tab === 'upload' ? !!file : url !== (item.url || '')

  return (
    <Modal title="Manage Audio" subtitle={item.label} onClose={onClose}>
      <div className="space-y-4">
        {/* Amharic label preview */}
        <div className="bg-stone-50 rounded-2xl p-5 text-center">
          <p className="am text-[42px] font-bold text-stone-900 leading-tight">{item.label}</p>
          {item.url && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <AudioPreview url={item.url} text={null} />
              <span className="text-[11px] text-stone-400">Current audio</span>
              <button
                onClick={() => onRemove(item.id, item.type, item.url)}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 font-semibold">
                <Trash2 size={11} /> Remove
              </button>
            </div>
          )}
        </div>

        {/* Tab selector */}
        <div className="flex bg-stone-100 p-1 rounded-2xl">
          {[
            { id: 'upload', label: '📁 Upload File' },
            { id: 'url',    label: '🔗 Paste URL'   },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx(
                'flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all',
                tab === t.id ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div>
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={clsx(
                'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all',
                file ? 'border-brand-400 bg-brand-50' : 'border-stone-200 hover:border-brand-300 hover:bg-stone-50'
              )}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Mic size={20} className="text-brand-600" />
                  </div>
                  <p className="font-semibold text-[14px] text-stone-900">{file.name}</p>
                  <p className="text-[12px] text-stone-400">{(file.size / 1024).toFixed(0)} KB</p>
                  {preview && <AudioPreview url={preview} text={null} />}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload size={20} className="text-stone-400" />
                  </div>
                  <p className="font-semibold text-[14px] text-stone-700">Click or drag & drop</p>
                  <p className="text-[12px] text-stone-400">MP3, WAV, OGG — max 5 MB</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />

            {file && (
              <button onClick={() => { setFile(null); setPreview(null) }}
                className="mt-2 text-[12px] text-red-400 hover:text-red-600 font-medium">
                × Remove selected file
              </button>
            )}

            <div className="bg-blue-50 rounded-xl p-3 mt-3 text-[11px] text-blue-700">
              <p className="font-bold mb-1">Before uploading:</p>
              <p>Run <strong>storage_setup.sql</strong> in Supabase SQL Editor to create the audio bucket. Do this once.</p>
            </div>
          </div>
        )}

        {/* URL tab */}
        {tab === 'url' && (
          <div className="space-y-3">
            <Field label="Audio URL" hint="Paste a direct link to an mp3, wav, or ogg file">
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="input"
                placeholder="https://…/audio/selam.mp3"
              />
            </Field>
            {url && (
              <div className="flex items-center gap-2">
                <AudioPreview url={url} text={null} />
                <span className="text-[12px] text-stone-400">Test the URL</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Upload size={15} /> {tab === 'upload' ? 'Upload & Save' : 'Save URL'}</>
            }
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN ADMIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [tab,      setTab]      = useState('dashboard')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null) // { msg, type }

  // Data
  const [stats,    setStats]    = useState({})
  const [units,    setUnits]    = useState([])
  const [vocab,    setVocab]    = useState([])
  const [users,    setUsers]    = useState([])
  const [allAudio, setAllAudio] = useState([]) // exercises + vocab with audio

  // UI state
  const [expanded,    setExpanded]    = useState({})
  const [userSearch,  setUserSearch]  = useState('')
  const [vocabSearch, setVocabSearch] = useState('')
  const [vocabTag,    setVocabTag]    = useState('all')
  const [viewUser,    setViewUser]    = useState(null) // { user, progress, streaks }
  const [loadingUser, setLoadingUser] = useState(false)
  const [vocabAudioFile, setVocabAudioFile] = useState(null)  // for add-vocab file upload
  const vocabAudioRef = useRef(null)

  // Videos
  const [videos,    setVideos]    = useState([])
  const [videoForm, setVideoForm] = useState({ title_en: '', title_am: '', description_en: '', video_url: '', thumbnail_url: '', level: 'A1', is_published: false })
  const [editVideo, setEditVideo] = useState(null)

  // Permissions modal
  const [permUser,  setPermUser]  = useState(null)

  // Forms
  const [unitForm,    setUnitForm]    = useState({ title_en: '', title_am: '', order_index: '' })
  const [lessonForms, setLessonForms] = useState({})
  const [exForms,     setExForms]     = useState({})
  const [vocabForm,   setVocabForm]   = useState({ word_am: '', word_en: '', romanization: '', audio_url: '', topic_tag: '' })

  // Modals
  const [editUnit,    setEditUnit]    = useState(null)
  const [editLesson,  setEditLesson]  = useState(null)
  const [editExercise,setEditExercise]= useState(null)
  const [editVocab,   setEditVocab]   = useState(null)
  const [addingAudio, setAddingAudio] = useState(null) // exercise or vocab id

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch ───────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [
      { data: u },
      { data: v },
      { data: us },
      { data: vid },
      { count: uCount },
      { count: pCount },
      { count: sCount },
    ] = await Promise.all([
      supabase.from('units').select('*, lessons(*, exercises(*))').order('order_index'),
      supabase.from('vocabulary').select('*').order('word_en'),
      supabase.from('users').select('id,name,email,xp,streak_count,role,level,admin_permissions,created_at,last_active_at').order('xp', { ascending: false }),
      supabase.from('video_lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('user_progress').select('*', { count: 'exact', head: true }),
      supabase.from('user_streaks').select('*', { count: 'exact', head: true }),
    ])

    const lessons   = (u || []).flatMap(u2 => u2.lessons || [])
    const exercises = lessons.flatMap(l => l.exercises || [])
    const audioItems = [
      ...exercises.map(e => ({ ...e, _type: 'exercise', _label: e.prompt_am })),
      ...(v || []).map(w => ({ ...w, _type: 'vocab', _label: w.word_am })),
    ]

    setUnits(u || [])
    setVocab(v || [])
    setUsers(us || [])
    setVideos(vid || [])
    setAllAudio(audioItems)
    setStats({
      users:       uCount || 0,
      units:       (u || []).length,
      lessons:     lessons.length,
      exercises:   exercises.length,
      vocab:       (v || []).length,
      videos:      (vid || []).length,
      completions: pCount || 0,
      streakDays:  sCount || 0,
      withAudio:   audioItems.filter(a => a.audio_url).length,
      noAudio:     audioItems.filter(a => !a.audio_url).length,
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }))

  // ── UNIT ────────────────────────────────────────────────────
  const addUnit = async () => {
    if (!unitForm.title_en.trim()) return
    setSaving(true)
    const { error } = await supabase.from('units').insert({
      title_en: unitForm.title_en.trim(), title_am: unitForm.title_am.trim() || null,
      order_index: parseInt(unitForm.order_index) || units.length + 1, is_published: true,
    })
    setSaving(false)
    if (error) { notify('Error: ' + error.message, 'error'); return }
    setUnitForm({ title_en: '', title_am: '', order_index: '' })
    notify('Unit added')
    fetchAll()
  }

  const saveUnit = async () => {
    if (!editUnit) return
    setSaving(true)
    await supabase.from('units').update({
      title_en: editUnit.title_en, title_am: editUnit.title_am || null,
      order_index: parseInt(editUnit.order_index) || 1,
    }).eq('id', editUnit.id)
    setSaving(false)
    setEditUnit(null)
    notify('Unit saved')
    fetchAll()
  }

  const deleteUnit = async (id) => {
    if (!confirm('Delete this unit and ALL its lessons and exercises?')) return
    await supabase.from('units').delete().eq('id', id)
    notify('Unit deleted', 'error')
    fetchAll()
  }

  const toggleUnitPublish = async (id, cur) => {
    await supabase.from('units').update({ is_published: !cur }).eq('id', id)
    notify(!cur ? 'Unit published' : 'Unit unpublished')
    fetchAll()
  }

  // ── LESSON ──────────────────────────────────────────────────
  const lf = (uid, k, v) => setLessonForms(f => ({ ...f, [uid]: { ...f[uid], [k]: v } }))

  const addLesson = async (unitId) => {
    const f = lessonForms[unitId] || {}
    if (!f.title_en?.trim()) return
    const unit = units.find(u => u.id === unitId)
    setSaving(true)
    await supabase.from('lessons').insert({
      unit_id: unitId, title_en: f.title_en.trim(), title_am: f.title_am?.trim() || null,
      order_index: (unit?.lessons?.length || 0) + 1,
      xp_reward: parseInt(f.xp_reward) || 10, is_published: true,
    })
    setSaving(false)
    setLessonForms(f2 => ({ ...f2, [unitId]: {} }))
    notify('Lesson added')
    fetchAll()
  }

  const saveLesson = async () => {
    if (!editLesson) return
    setSaving(true)
    await supabase.from('lessons').update({
      title_en: editLesson.title_en, title_am: editLesson.title_am || null,
      xp_reward: parseInt(editLesson.xp_reward) || 10, is_published: editLesson.is_published,
    }).eq('id', editLesson.id)
    setSaving(false); setEditLesson(null)
    notify('Lesson saved')
    fetchAll()
  }

  const deleteLesson = async (id) => {
    if (!confirm('Delete this lesson and all its exercises?')) return
    await supabase.from('lessons').delete().eq('id', id)
    notify('Lesson deleted', 'error')
    fetchAll()
  }

  // ── EXERCISE ────────────────────────────────────────────────
  const ef = (lid, k, v) => setExForms(f => ({ ...f, [lid]: { ...f[lid], [k]: v } }))

  const parseOptions = (raw) => {
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return raw.split(',').map(s => s.trim()).filter(Boolean) }
  }

  const addExercise = async (lessonId) => {
    const f = exForms[lessonId] || {}
    if (!f.type || !f.prompt_am?.trim()) return
    setSaving(true)
    const { error } = await supabase.from('exercises').insert({
      lesson_id: lessonId, type: f.type,
      prompt_am: f.prompt_am.trim(), prompt_en: f.prompt_en?.trim() || null,
      romanization: f.romanization?.trim() || null,
      options: parseOptions(f.options),
      correct_answer: f.correct_answer?.trim() || '',
      audio_url: f.audio_url?.trim() || null,
    })
    setSaving(false)
    if (error) { notify('Error: ' + error.message, 'error'); return }
    setExForms(f2 => ({ ...f2, [lessonId]: {} }))
    notify('Exercise added')
    fetchAll()
  }

  const saveExercise = async () => {
    if (!editExercise) return
    setSaving(true)
    await supabase.from('exercises').update({
      type: editExercise.type, prompt_am: editExercise.prompt_am,
      prompt_en: editExercise.prompt_en || null, romanization: editExercise.romanization || null,
      options: parseOptions(typeof editExercise.options === 'string' ? editExercise.options : JSON.stringify(editExercise.options)),
      correct_answer: editExercise.correct_answer, audio_url: editExercise.audio_url || null,
    }).eq('id', editExercise.id)
    setSaving(false); setEditExercise(null)
    notify('Exercise saved')
    fetchAll()
  }

  const deleteExercise = async (id) => {
    await supabase.from('exercises').delete().eq('id', id)
    notify('Exercise deleted', 'error')
    fetchAll()
  }

  // ── VOCABULARY ──────────────────────────────────────────────
  const addVocab = async () => {
    if (!vocabForm.word_am.trim() || !vocabForm.word_en.trim()) return
    setSaving(true)
    await supabase.from('vocabulary').insert({
      word_am: vocabForm.word_am.trim(), word_en: vocabForm.word_en.trim(),
      romanization: vocabForm.romanization.trim() || null,
      audio_url: vocabForm.audio_url.trim() || null,
      topic_tag: vocabForm.topic_tag.trim() || null,
    })
    setSaving(false)
    setVocabForm({ word_am: '', word_en: '', romanization: '', audio_url: '', topic_tag: '' })
    notify('Word added')
    fetchAll()
  }

  const saveVocab = async () => {
    if (!editVocab) return
    setSaving(true)
    await supabase.from('vocabulary').update({
      word_am: editVocab.word_am, word_en: editVocab.word_en,
      romanization: editVocab.romanization || null, audio_url: editVocab.audio_url || null,
      topic_tag: editVocab.topic_tag || null,
    }).eq('id', editVocab.id)
    setSaving(false); setEditVocab(null)
    notify('Word saved')
    fetchAll()
  }

  const deleteVocab = async (id) => {
    if (!confirm('Delete this word?')) return
    await supabase.from('vocabulary').delete().eq('id', id)
    notify('Word deleted', 'error')
    fetchAll()
  }

  // ── AUDIO: upload file + save URL ───────────────────────────
  const handleAudioUpload = async (file, itemId, itemType, oldUrl) => {
    if (!file) return null
    setSaving(true)
    try {
      const folder = itemType === 'exercise' ? 'exercises' : 'vocabulary'
      const publicUrl = await uploadAudioFile(file, folder)
      // Delete the old file from storage if it exists
      if (oldUrl) await deleteAudioFile(oldUrl)
      // Save the new URL to the database
      if (itemType === 'exercise') {
        await supabase.from('exercises').update({ audio_url: publicUrl }).eq('id', itemId)
      } else {
        await supabase.from('vocabulary').update({ audio_url: publicUrl }).eq('id', itemId)
      }
      setSaving(false)
      return publicUrl
    } catch (err) {
      setSaving(false)
      notify('Upload failed: ' + err.message, 'error')
      return null
    }
  }

  const saveAudioUrl = async (id, url, type, file, oldUrl) => {
    if (file) {
      // File chosen — upload it
      const uploaded = await handleAudioUpload(file, id, type, oldUrl)
      if (!uploaded) return
      notify('Audio uploaded and saved!')
    } else if (url !== oldUrl) {
      // Manual URL changed — just save it (delete old file if it was from our bucket)
      if (oldUrl && oldUrl.includes('/storage/v1/object/public/audio/')) {
        await deleteAudioFile(oldUrl)
      }
      if (type === 'exercise') await supabase.from('exercises').update({ audio_url: url || null }).eq('id', id)
      else await supabase.from('vocabulary').update({ audio_url: url || null }).eq('id', id)
      notify('Audio URL saved')
    }
    setAddingAudio(null)
    fetchAll()
  }

  const removeAudio = async (id, type, url) => {
    if (!confirm('Remove this audio file?')) return
    // Delete from storage
    if (url && url.includes('/storage/v1/object/public/audio/')) {
      await deleteAudioFile(url)
    }
    // Clear the URL in DB
    if (type === 'exercise') await supabase.from('exercises').update({ audio_url: null }).eq('id', id)
    else await supabase.from('vocabulary').update({ audio_url: null }).eq('id', id)
    notify('Audio removed')
    fetchAll()
  }

  // ── USERS ───────────────────────────────────────────────────
  // Demote immediately; promote by opening permissions modal first
  const toggleAdmin = async (id, newRole) => {
    if (newRole === 'admin') {
      // Open permissions modal first — role is saved when they click "Save Permissions"
      const target = users.find(u => u.id === id)
      if (target) setPermUser({ ...target, _pendingPromotion: true, role: 'admin', admin_permissions: null })
      return
    }
    // Demoting: write immediately
    await supabase.from('users').update({ role: 'user', admin_permissions: null }).eq('id', id)
    notify('Admin access removed')
    fetchAll()
  }

  const savePermissions = async (userId, perms) => {
    const target = users.find(u => u.id === userId)
    const isPendingPromotion = permUser?._pendingPromotion
    const permObj = Object.fromEntries(
      Object.entries(perms).map(([k, v]) => [k, Boolean(v)])
    )

    // Use rpc to bypass RLS recursion — the SQL function runs as DB owner
    const { data, error } = await supabase.rpc('admin_update_user_role', {
      target_user_id:    userId,
      new_role:          isPendingPromotion ? 'admin' : undefined,
      new_permissions:   permObj,
    })

    // Fallback: if rpc not yet deployed, try direct update
    if (error && error.message?.includes('function') && error.message?.includes('does not exist')) {
      console.warn('[Admin] RPC not found, falling back to direct update. Run fix_admin_permissions.sql first.')
      const update = { admin_permissions: permObj }
      if (isPendingPromotion) update.role = 'admin'
      const { error: updateErr } = await supabase
        .from('users')
        .update(update)
        .eq('id', userId)
      if (updateErr) {
        notify(`Failed: ${updateErr.message} — Run fix_admin_permissions.sql in Supabase`, 'error')
        return
      }
    } else if (error) {
      notify(`Failed: ${error.message}`, 'error')
      return
    }

    notify(isPendingPromotion ? `✓ Admin access granted to ${target?.name || 'user'}` : '✓ Permissions updated')
    setPermUser(null)
    fetchAll()
  }

  // ── VIDEO LESSONS ─────────────────────────────────────────────
  const saveVideo = async (e) => {
    e.preventDefault()
    setSaving(true)
    const form = editVideo ? editVideo : videoForm
    if (editVideo?.id) {
      await supabase.from('video_lessons').update(form).eq('id', editVideo.id)
      notify('Video updated')
      setEditVideo(null)
    } else {
      await supabase.from('video_lessons').insert(form)
      notify('Video added')
      setVideoForm({ title_en: '', title_am: '', description_en: '', video_url: '', thumbnail_url: '', level: 'A1', is_published: false })
    }
    setSaving(false)
    fetchAll()
  }

  const deleteVideo = async (id) => {
    if (!confirm('Delete this video lesson?')) return
    await supabase.from('video_lessons').delete().eq('id', id)
    notify('Video deleted')
    fetchAll()
  }

  const toggleVideoPublished = async (id, cur) => {
    await supabase.from('video_lessons').update({ is_published: !cur }).eq('id', id)
    fetchAll()
  }

  const openUserProfile = async (u) => {
    setLoadingUser(true)
    setViewUser({ user: u, progress: [], streaks: [] })
    const [{ data: prog }, { data: stk }] = await Promise.all([
      supabase.from('user_progress')
        .select('lesson_id, completed_at, xp_earned, errors_count, lessons(title_en, title_am, units(title_en))')
        .eq('user_id', u.id)
        .order('completed_at', { ascending: false }),
      supabase.from('user_streaks')
        .select('date, xp_earned')
        .eq('user_id', u.id)
        .order('date', { ascending: false })
        .limit(60),
    ])
    setViewUser({ user: u, progress: prog || [], streaks: stk || [] })
    setLoadingUser(false)
  }

  const deleteUser = async (id) => {
    const target = users.find(u => u.id === id)
    if (!confirm('Permanently delete ' + (target?.name || 'this user') + ' (' + (target?.email || '') + ')? All their data and login will be removed. This cannot be undone.')) return

    setSaving(true)

    // Use the admin_delete_user RPC which deletes from auth.users too
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: id })

    setSaving(false)

    if (error) {
      // RPC not available — fall back to deleting only the public rows
      console.warn('RPC unavailable, deleting public rows only:', error.message)
      await supabase.from('user_progress').delete().eq('user_id', id)
      await supabase.from('user_streaks').delete().eq('user_id', id)
      await supabase.from('users').delete().eq('id', id)
      notify('Profile deleted. Run storage_setup.sql to also enable full auth deletion.')
    } else {
      notify('User fully deleted (profile + auth account)')
    }

    fetchAll()
  }

  // ── Filtered lists ───────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )
  const vocabTags     = ['all', ...new Set(vocab.map(w => w.topic_tag).filter(Boolean))]
  const filteredVocab = vocab.filter(w => {
    const matchTag   = vocabTag === 'all' || w.topic_tag === vocabTag
    const matchQuery = !vocabSearch || w.word_am.includes(vocabSearch) || w.word_en.toLowerCase().includes(vocabSearch.toLowerCase())
    return matchTag && matchQuery
  })

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 flex">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-100 fixed h-full z-20 px-3 py-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 mb-7">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
<svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                <path d="M6 22L16 10L26 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 28L16 18L23 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          </div>
          <div>
            <p className="font-bold text-[14px] text-stone-900 leading-tight">Admin</p>
            <p className="text-[10px] text-stone-400">Amharican CMS</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[13px] font-medium transition-all',
                tab === id ? 'bg-brand-500 text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
              )}>
              <Icon size={15} strokeWidth={tab === id ? 2.2 : 1.8} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-100 pt-3">
          <Link to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-stone-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Eye size={13} /> View App
          </Link>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-stone-100 px-4 py-3 flex gap-2 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold shrink-0',
              tab === id ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-500')}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-56 pt-16 md:pt-0">

        {/* Toast */}
        {toast && (
          <div className={clsx(
            'fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lifted text-[13px] font-semibold animate-rise',
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'
          )}>
            {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            {toast.msg}
          </div>
        )}

        {/* Refresh + header */}
        <div className="sticky top-0 md:top-0 bg-stone-50/90 backdrop-blur z-20 px-5 md:px-8 py-4 flex items-center justify-between border-b border-stone-100">
          <h1 className="font-bold text-[18px] text-stone-900 capitalize">
            {TABS.find(t => t.id === tab)?.label}
          </h1>
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-brand-600 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="px-5 md:px-8 py-7 max-w-5xl">

          {/* ════ DASHBOARD ════ */}
          {tab === 'dashboard' && (
            <div className="space-y-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={Users}    label="Total Users"    value={stats.users}       sub={`${users.filter(u=>u.role==='admin').length} admin`}  accent="bg-brand-500" />
                <StatCard icon={BookOpen} label="Lessons"        value={stats.lessons}     sub={`${stats.units} units`}      accent="bg-blue-500" />
                <StatCard icon={Zap}      label="Exercises"      value={stats.exercises}   sub={`${stats.completions} completions`} accent="bg-amber-400" />
                <StatCard icon={Video}    label="Video Lessons"  value={stats.videos ?? 0} sub={`${videos.filter(v=>v.is_published).length} published`} accent="bg-rose-500" />
                <StatCard icon={Mic}      label="Audio Missing"  value={stats.noAudio}     sub={`${stats.withAudio} have audio`}    accent={stats.noAudio > 0 ? 'bg-red-400' : 'bg-brand-500'} />
                <StatCard icon={BookMarked} label="Vocabulary"   value={stats.vocab}       sub="words in library"           accent="bg-purple-500" />
                <StatCard icon={Flame}    label="Streak Days"    value={stats.streakDays}  sub="total logged"               accent="bg-orange-400" />
                <StatCard icon={Award}    label="Active Users"   value={users.filter(u=>(u.xp||0)>0).length} sub="with XP"  accent="bg-pink-500" />
              </div>

              {/* Top 5 users */}
              <div className="bg-white rounded-3xl border border-stone-100">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-bold text-[15px] text-stone-900">Top Learners</p>
                  <button onClick={() => setTab('users')} className="text-[12px] text-brand-600 font-medium hover:underline">
                    View all
                  </button>
                </div>
                {users.slice(0, 5).map((u, i) => (
                  <div key={u.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-stone-50 last:border-b-0">
                    <span className="w-5 text-[13px] font-bold text-stone-300">#{i+1}</span>
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-[12px] shrink-0">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-stone-800 truncate">{u.name || '—'}</p>
                      <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[13px] font-bold text-amber-500">{u.xp} XP</span>
                      {u.role === 'admin' && <Tag label="admin" color="bg-purple-100 text-purple-600" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Content summary */}
              <div className="bg-white rounded-3xl border border-stone-100">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-bold text-[15px] text-stone-900">Content Overview</p>
                  <button onClick={() => setTab('content')} className="text-[12px] text-brand-600 font-medium hover:underline">Manage</button>
                </div>
                {units.map(unit => {
                  const lessons   = unit.lessons || []
                  const exercises = lessons.flatMap(l => l.exercises || [])
                  const noAudio   = exercises.filter(e => !e.audio_url).length
                  return (
                    <div key={unit.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-stone-50 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-stone-800">{unit.title_en}</p>
                        {unit.title_am && <p className="am text-[12px] text-stone-400">{unit.title_am}</p>}
                      </div>
                      <span className="text-[12px] text-stone-400">{lessons.length} lessons · {exercises.length} ex</span>
                      {noAudio > 0 && <Tag label={`${noAudio} no audio`} color="bg-red-50 text-red-500" />}
                      <Tag
                        label={unit.is_published ? 'Live' : 'Draft'}
                        color={unit.is_published ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-400'}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ════ CONTENT ════ */}
          {tab === 'content' && (
            <div className="space-y-5">
              {/* Add unit */}
              <div className="bg-white rounded-3xl border border-stone-100 p-6">
                <p className="font-bold text-[15px] text-stone-900 mb-4">Add New Unit</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input placeholder="English title *" value={unitForm.title_en}
                    onChange={e => setUnitForm(f => ({ ...f, title_en: e.target.value }))} className="input" />
                  <input placeholder="Amharic title (አማርኛ)" value={unitForm.title_am}
                    onChange={e => setUnitForm(f => ({ ...f, title_am: e.target.value }))} className="input am" />
                  <input type="number" placeholder="Order (1, 2, 3…)" value={unitForm.order_index}
                    onChange={e => setUnitForm(f => ({ ...f, order_index: e.target.value }))} className="input" />
                </div>
                <button onClick={addUnit} disabled={saving || !unitForm.title_en.trim()}
                  className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={15} /> Add Unit
                </button>
              </div>

              {/* Units */}
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-3xl" />)}</div>
              ) : (
                units.map(unit => (
                  <div key={unit.id} className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                    {/* Unit row */}
                    <div className="flex items-center gap-3 px-5 py-4 bg-brand-50 border-b border-brand-100">
                      <button onClick={() => toggle(unit.id)} className="text-stone-400 hover:text-stone-600 transition-colors">
                        {expanded[unit.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px] text-stone-900">{unit.title_en}</p>
                        {unit.title_am && <p className="am text-[13px] text-stone-500">{unit.title_am}</p>}
                      </div>
                      <span className="text-[12px] text-stone-400 shrink-0">{unit.lessons?.length || 0} lessons</span>
                      <button onClick={() => toggleUnitPublish(unit.id, unit.is_published)}
                        className={clsx('shrink-0 text-[12px] px-3 py-1 rounded-full font-bold transition-all',
                          unit.is_published ? 'bg-brand-100 text-brand-600 hover:bg-brand-200' : 'bg-stone-100 text-stone-400 hover:bg-stone-200')}>
                        {unit.is_published ? '● Live' : '○ Draft'}
                      </button>
                      <button onClick={() => setEditUnit({ ...unit })} className="text-stone-300 hover:text-blue-500 transition-colors shrink-0">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => deleteUnit(unit.id)} className="text-stone-200 hover:text-red-500 transition-colors shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {expanded[unit.id] && (
                      <div className="p-5 space-y-4">
                        {/* Add lesson form */}
                        <div className="card-inset p-4">
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Add Lesson</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                            <input placeholder="English title *"
                              value={lessonForms[unit.id]?.title_en || ''}
                              onChange={e => lf(unit.id, 'title_en', e.target.value)} className="input text-sm" />
                            <input placeholder="Amharic title (optional)"
                              value={lessonForms[unit.id]?.title_am || ''}
                              onChange={e => lf(unit.id, 'title_am', e.target.value)} className="input text-sm am" />
                            <input type="number" placeholder="XP reward (default 10)"
                              value={lessonForms[unit.id]?.xp_reward || ''}
                              onChange={e => lf(unit.id, 'xp_reward', e.target.value)} className="input text-sm" />
                          </div>
                          <button onClick={() => addLesson(unit.id)} disabled={saving}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                            <Plus size={13} /> Add Lesson
                          </button>
                        </div>

                        {/* Lesson list */}
                        {(unit.lessons || []).sort((a,b) => a.order_index - b.order_index).map(lesson => (
                          <div key={lesson.id} className="border border-stone-100 rounded-2xl overflow-hidden">
                            {/* Lesson row */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white">
                              <button onClick={() => toggle(lesson.id)} className="text-stone-300 hover:text-stone-500">
                                {expanded[lesson.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[14px] text-stone-800">{lesson.title_en}</p>
                                {lesson.title_am && <p className="am text-[12px] text-stone-400">{lesson.title_am}</p>}
                              </div>
                              <span className="text-[11px] text-stone-400 shrink-0">
                                {lesson.exercises?.length || 0} ex · {lesson.xp_reward} XP
                              </span>
                              <Tag
                                label={lesson.is_published ? 'Live' : 'Draft'}
                                color={lesson.is_published ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-400'}
                              />
                              <button onClick={() => setEditLesson({ ...lesson })} className="text-stone-300 hover:text-blue-400 shrink-0"><Edit2 size={13} /></button>
                              <button onClick={() => deleteLesson(lesson.id)} className="text-stone-200 hover:text-red-400 shrink-0"><Trash2 size={13} /></button>
                            </div>

                            {expanded[lesson.id] && (
                              <div className="bg-stone-50 p-4 space-y-3">
                                {/* ── Smart Exercise Wizard ── */}
                                <ExerciseWizard
                                  lessonId={lesson.id}
                                  saving={saving}
                                  onAdd={async (lessonId, data, audioFile) => {
                                    setSaving(true)
                                    let audioUrl = data.audio_url || null
                                    if (audioFile) {
                                      try { audioUrl = await uploadAudioFile(audioFile, 'exercises') }
                                      catch(e) { notify('Audio upload failed: '+e.message,'error'); setSaving(false); return }
                                    }
                                    const { error } = await supabase.from('exercises').insert({
                                      lesson_id: lessonId, type: data.type,
                                      prompt_am: data.prompt_am.trim(), prompt_en: data.prompt_en?.trim()||null,
                                      romanization: data.romanization?.trim()||null,
                                      options: parseOptions(data.options),
                                      correct_answer: data.correct_answer.trim(),
                                      audio_url: audioUrl,
                                    })
                                    setSaving(false)
                                    if (error) { notify('Error: '+error.message,'error'); return }
                                    notify('Exercise added' + (audioUrl?' with audio':''))
                                    fetchAll()
                                  }}
                                />

                                {(!lesson.exercises || lesson.exercises.length === 0) && (
                                  <p className="text-center text-[12px] text-stone-300 py-3">No exercises yet — add one above</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {(!unit.lessons || unit.lessons.length === 0) && (
                          <p className="text-center text-[12px] text-stone-300 py-2">No lessons yet</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ VOCABULARY ════ */}
          {tab === 'vocab' && (
            <div className="space-y-5">
              {/* Add word */}
              <div className="bg-white rounded-3xl border border-stone-100 p-6">
                <p className="font-bold text-[15px] text-stone-900 mb-4">Add Vocabulary Word</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <input placeholder="Amharic * (ሰላም)"
                    value={vocabForm.word_am} onChange={e => setVocabForm(f => ({ ...f, word_am: e.target.value }))}
                    className="input am" />
                  <input placeholder="English *"
                    value={vocabForm.word_en} onChange={e => setVocabForm(f => ({ ...f, word_en: e.target.value }))}
                    className="input" />
                  <input placeholder="Romanization (e.g. Selam)"
                    value={vocabForm.romanization} onChange={e => setVocabForm(f => ({ ...f, romanization: e.target.value }))}
                    className="input" />
                  <input placeholder="Topic tag (greetings, numbers…)"
                    value={vocabForm.topic_tag} onChange={e => setVocabForm(f => ({ ...f, topic_tag: e.target.value }))}
                    className="input" />
                  <input placeholder="Audio URL (optional)"
                    value={vocabForm.audio_url} onChange={e => setVocabForm(f => ({ ...f, audio_url: e.target.value }))}
                    className="input" />
                </div>
                {/* Audio file picker for new vocab */}
                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-stone-500 mb-2">Or choose an audio file to upload</p>
                  <div
                    onClick={() => vocabAudioRef.current?.click()}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
                      vocabAudioFile ? 'border-brand-400 bg-brand-50' : 'border-stone-200 hover:border-brand-300 hover:bg-stone-50'
                    )}
                  >
                    <Mic size={16} className={vocabAudioFile ? 'text-brand-500' : 'text-stone-400'} />
                    {vocabAudioFile ? (
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-stone-800 truncate">{vocabAudioFile.name}</p>
                          <p className="text-[11px] text-stone-400">{(vocabAudioFile.size/1024).toFixed(0)} KB → will be compressed</p>
                        </div>
                        <AudioPreview url={URL.createObjectURL(vocabAudioFile)} text={null} />
                      </div>
                    ) : (
                      <p className="text-[13px] text-stone-400">Click to choose audio file (mp3, wav…)</p>
                    )}
                    {vocabAudioFile && (
                      <button type="button" onClick={e => { e.stopPropagation(); setVocabAudioFile(null) }}
                        className="text-red-400 hover:text-red-600 shrink-0"><X size={14} /></button>
                    )}
                  </div>
                  <input ref={vocabAudioRef} type="file" accept="audio/*" className="hidden"
                    onChange={e => { const f=e.target.files?.[0]; if(f) setVocabAudioFile(f); e.target.value='' }} />
                </div>
                <button
                  onClick={async () => {
                    if (!vocabForm.word_am.trim() || !vocabForm.word_en.trim()) return
                    setSaving(true)
                    let audioUrl = vocabForm.audio_url.trim() || null
                    if (vocabAudioFile) {
                      try {
                        audioUrl = await uploadAudioFile(vocabAudioFile, 'vocabulary')
                      } catch(err) { notify('Upload failed: ' + err.message, 'error'); setSaving(false); return }
                    }
                    await supabase.from('vocabulary').insert({
                      word_am: vocabForm.word_am.trim(), word_en: vocabForm.word_en.trim(),
                      romanization: vocabForm.romanization.trim() || null,
                      audio_url: audioUrl, topic_tag: vocabForm.topic_tag.trim() || null,
                    })
                    setSaving(false)
                    setVocabForm({ word_am:'', word_en:'', romanization:'', audio_url:'', topic_tag:'' })
                    setVocabAudioFile(null)
                    notify('Word added' + (audioUrl ? ' with audio' : ''))
                    fetchAll()
                  }}
                  disabled={saving || !vocabForm.word_am.trim() || !vocabForm.word_en.trim()}
                  className="btn-primary text-sm flex items-center gap-2">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Plus size={15} /> Add Word{vocabAudioFile ? ' + Upload Audio' : ''}</>
                  }
                </button>
              </div>

              {/* Search + filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input value={vocabSearch} onChange={e => setVocabSearch(e.target.value)}
                    placeholder="Search vocabulary…" className="input pl-10" />
                </div>
                <select value={vocabTag} onChange={e => setVocabTag(e.target.value)} className="input w-40">
                  {vocabTags.map(t => <option key={t} value={t}>{t === 'all' ? 'All topics' : t}</option>)}
                </select>
              </div>

              {/* Word list */}
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-bold text-[15px] text-stone-900">{filteredVocab.length} words</p>
                  <Tag label={`${vocab.filter(w=>w.audio_url).length} with audio`} color="bg-brand-50 text-brand-600" />
                </div>
                <div className="divide-y divide-stone-50 max-h-[600px] overflow-y-auto">
                  {filteredVocab.map(w => (
                    <div key={w.id} className="flex items-center gap-4 px-6 py-3.5">
                      <span className="am text-[24px] font-bold text-stone-900 w-16 shrink-0">{w.word_am}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-stone-800">{w.word_en}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {w.romanization && <span className="text-[11px] text-stone-400 italic">{w.romanization}</span>}
                          {w.topic_tag && <Tag label={w.topic_tag} color="bg-stone-100 text-stone-500" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {w.audio_url
                          ? <AudioPreview url={w.audio_url} text={null} />
                          : <AudioPreview url={null} text={w.word_am} />
                        }
                        {w.audio_url
                          ? <Tag label="🔊" color="bg-brand-50 text-brand-600" />
                          : <Tag label="No audio" color="bg-red-50 text-red-400" />
                        }
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditVocab({ ...w })}
                          className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => deleteVocab(w.id)}
                          className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ AUDIO ════ */}
          {tab === 'audio' && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
                  <p className="text-[26px] font-bold text-stone-900">{stats.withAudio || 0}</p>
                  <p className="text-[12px] text-stone-500 mt-0.5">Have Audio</p>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${stats.withAudio && stats.withAudio + stats.noAudio ? (stats.withAudio/(stats.withAudio+stats.noAudio))*100 : 0}%` }} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
                  <p className="text-[26px] font-bold text-red-500">{stats.noAudio || 0}</p>
                  <p className="text-[12px] text-stone-500 mt-0.5">Missing Audio</p>
                  <p className="text-[11px] text-red-400 mt-1">Needs attention</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
                  <p className="text-[26px] font-bold text-stone-900">{(stats.withAudio || 0) + (stats.noAudio || 0)}</p>
                  <p className="text-[12px] text-stone-500 mt-0.5">Total Items</p>
                  <p className="text-[11px] text-stone-400 mt-1">Exercises + vocab</p>
                </div>
              </div>

              {/* TTS guide */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <p className="font-bold text-[14px] text-blue-800 mb-2 flex items-center gap-2">
                  <Mic size={15} /> Audio Setup Guide
                </p>
                <div className="space-y-2 text-[12px] text-blue-700">
                  <p><strong>Option A — Google Cloud TTS (recommended):</strong> Generate mp3 files using the Google Cloud TTS API with language code <code className="bg-blue-100 px-1 rounded">am-ET</code>, upload to Supabase Storage, and paste the public URL into the Audio URL field.</p>
                  <p><strong>Option B — Browser TTS (fallback):</strong> Leave Audio URL empty. The app uses the browser's built-in speech synthesis with Amharic language. Quality varies by device.</p>
                  <p><strong>File format:</strong> mp3 or wav, uploaded to Supabase Storage bucket. Copy the public URL from the bucket → paste into Audio URL field on each exercise or vocabulary word.</p>
                </div>
              </div>

              {/* Items missing audio */}
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100">
                  <p className="font-bold text-[15px] text-stone-900">Items Missing Audio</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">Add a URL or test browser TTS for each</p>
                </div>
                <div className="divide-y divide-stone-50 max-h-[500px] overflow-y-auto">
                  {allAudio.filter(a => !a.audio_url).slice(0, 50).map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Tag
                            label={item._type === 'exercise' ? (EX_LABELS[item.type]?.label || 'Exercise') : 'Vocab'}
                            color={item._type === 'exercise' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
                          />
                        </div>
                        <p className="am text-[20px] font-bold text-stone-900">{item._label || item.word_am}</p>
                        {(item.prompt_en || item.word_en) && (
                          <p className="text-[12px] text-stone-400">{item.prompt_en || item.word_en}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <AudioPreview url={null} text={item._label || item.word_am} />
                        <button
                          onClick={() => setAddingAudio({ id: item.id, type: item._type, label: item._label || item.word_am, url: '' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 text-[12px] font-semibold hover:bg-brand-100 transition-colors">
                          <Plus size={12} /> Add URL
                        </button>
                      </div>
                    </div>
                  ))}
                  {allAudio.filter(a => !a.audio_url).length === 0 && (
                    <div className="py-10 text-center">
                      <CheckCircle2 size={28} className="text-brand-400 mx-auto mb-2" strokeWidth={1.8} />
                      <p className="font-semibold text-stone-500 text-sm">All items have audio!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items WITH audio */}
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100">
                  <p className="font-bold text-[15px] text-stone-900">Items With Audio ({allAudio.filter(a=>a.audio_url).length})</p>
                </div>
                <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
                  {allAudio.filter(a => a.audio_url).map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="am text-[18px] font-bold text-stone-900">{item._label}</p>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">{item.audio_url}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <AudioPreview url={item.audio_url} text={null} />
                        <button
                          onClick={() => setAddingAudio({ id: item.id, type: item._type, label: item._label, url: item.audio_url })}
                          className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ VIDEOS ════ */}
          {tab === 'videos' && (
            <div className="space-y-5">
              {/* Add / Edit Video form */}
              <div className="bg-white rounded-3xl border border-stone-100 p-6">
                <p className="font-bold text-[15px] text-stone-900 mb-4">{editVideo ? 'Edit Video' : 'Add Video Lesson'}</p>
                <form onSubmit={saveVideo} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Title (English) *</label>
                      <input required className="input" placeholder="Greetings in Amharic"
                        value={editVideo ? editVideo.title_en : videoForm.title_en}
                        onChange={e => editVideo ? setEditVideo(v => ({...v, title_en: e.target.value})) : setVideoForm(v => ({...v, title_en: e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Title (Amharic)</label>
                      <input className="input" placeholder="ሰላምታዎች"
                        value={editVideo ? editVideo.title_am : videoForm.title_am}
                        onChange={e => editVideo ? setEditVideo(v => ({...v, title_am: e.target.value})) : setVideoForm(v => ({...v, title_am: e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Description</label>
                    <textarea className="input min-h-[70px] resize-none" placeholder="What will students learn?"
                      value={editVideo ? editVideo.description_en : videoForm.description_en}
                      onChange={e => editVideo ? setEditVideo(v => ({...v, description_en: e.target.value})) : setVideoForm(v => ({...v, description_en: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Video URL * <span className="text-stone-400 font-normal">(YouTube, Vimeo, or direct mp4)</span></label>
                    <input required className="input" placeholder="https://youtube.com/embed/... or https://..."
                      value={editVideo ? editVideo.video_url : videoForm.video_url}
                      onChange={e => editVideo ? setEditVideo(v => ({...v, video_url: e.target.value})) : setVideoForm(v => ({...v, video_url: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Thumbnail URL</label>
                      <input className="input" placeholder="https://..."
                        value={editVideo ? editVideo.thumbnail_url : videoForm.thumbnail_url}
                        onChange={e => editVideo ? setEditVideo(v => ({...v, thumbnail_url: e.target.value})) : setVideoForm(v => ({...v, thumbnail_url: e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Level</label>
                      <select className="input"
                        value={editVideo ? editVideo.level : videoForm.level}
                        onChange={e => editVideo ? setEditVideo(v => ({...v, level: e.target.value})) : setVideoForm(v => ({...v, level: e.target.value}))}>
                        {['A1','A2','B1','B2','C1'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="vid_pub" className="rounded"
                      checked={editVideo ? editVideo.is_published : videoForm.is_published}
                      onChange={e => editVideo ? setEditVideo(v => ({...v, is_published: e.target.checked})) : setVideoForm(v => ({...v, is_published: e.target.checked}))} />
                    <label htmlFor="vid_pub" className="text-[13px] font-semibold text-stone-600">Published (visible to learners)</label>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                      {editVideo ? 'Save Changes' : 'Add Video'}
                    </button>
                    {editVideo && (
                      <button type="button" onClick={() => setEditVideo(null)}
                        className="px-4 py-2 rounded-2xl bg-stone-100 text-stone-600 text-[13px] font-semibold hover:bg-stone-200 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Video list */}
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-bold text-[15px] text-stone-900">{videos.length} video lessons</p>
                  <Tag label={`${videos.filter(v=>v.is_published).length} published`} color="bg-brand-50 text-brand-600" />
                </div>
                {videos.length === 0 ? (
                  <div className="px-6 py-10 text-center text-stone-400 text-[14px]">No videos yet — add one above.</div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {videos.map(v => (
                      <div key={v.id} className="flex items-start gap-4 px-6 py-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-14 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {v.thumbnail_url
                            ? <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : <Video size={20} className="text-stone-400" />
                          }
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-[14px] font-semibold text-stone-800 truncate">{v.title_en}</p>
                            <Tag label={v.level} color="bg-stone-100 text-stone-500" />
                            {v.is_published
                              ? <Tag label="Published" color="bg-green-100 text-green-600" />
                              : <Tag label="Draft" color="bg-amber-100 text-amber-600" />
                            }
                          </div>
                          {v.title_am && <p className="text-[12px] text-stone-400">{v.title_am}</p>}
                          {v.description_en && <p className="text-[11px] text-stone-400 mt-0.5 truncate">{v.description_en}</p>}
                          <p className="text-[10px] text-stone-300 mt-0.5 truncate">{v.video_url}</p>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => toggleVideoPublished(v.id, v.is_published)}
                            className={clsx('w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                              v.is_published ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-stone-100 text-stone-400 hover:bg-stone-200')}
                            title={v.is_published ? 'Unpublish' : 'Publish'}>
                            {v.is_published ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button onClick={() => setEditVideo(v)}
                            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteVideo(v.id)}
                            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ USERS ════ */}
          {tab === 'users' && (
            <div className="space-y-5">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email…" className="input pl-10" />
              </div>

              {/* User list */}
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <p className="font-bold text-[15px] text-stone-900">
                    {filteredUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <Tag label={`${users.filter(u=>u.role==='admin').length} admins`} color="bg-purple-50 text-purple-600" />
                    <Tag label={`${users.filter(u=>(u.xp||0)>0).length} active`} color="bg-brand-50 text-brand-600" />
                  </div>
                </div>
                <div className="divide-y divide-stone-50 max-h-[600px] overflow-y-auto">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-4">
                      {/* Avatar */}
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0',
                        u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-brand-100 text-brand-600'
                      )}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-semibold text-stone-800 truncate">{u.name || 'Anonymous'}</p>
                          {u.role === 'admin' && <Tag label="Admin" color="bg-purple-100 text-purple-600" />}
                        </div>
                        <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                        {u.last_active_at && (
                          <p className="text-[10px] text-stone-300 mt-0.5">
                            Last active: {new Date(u.last_active_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[13px] font-bold text-amber-500">{u.xp || 0} XP</p>
                        <p className="text-[11px] text-stone-400">{u.streak_count || 0}d streak · Lv {u.level || 'A1'}</p>
                        <p className="text-[10px] text-stone-300">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 shrink-0 items-center">
                        <button onClick={() => openUserProfile(u)}
                          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="View profile">
                          <Eye size={14} />
                        </button>

                        {/* Role / Admin control */}
                        {u.role === 'admin' ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPermUser(u)}
                              title="Edit admin permissions"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                              <Shield size={12} /> Admin
                            </button>
                            <button
                              onClick={() => toggleAdmin(u.id, 'user')}
                              title="Remove admin"
                              className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-400 transition-colors">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleAdmin(u.id, 'admin')}
                            title="Grant admin access"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-bold bg-stone-100 text-stone-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <Shield size={12} /> Make Admin
                          </button>
                        )}

                        <button onClick={() => deleteUser(u.id)}
                          className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          title="Delete user">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ SETTINGS ════ */}
          {tab === 'settings' && (
            <div className="space-y-5 max-w-xl">
              <div className="bg-white rounded-3xl border border-stone-100 p-6 space-y-4">
                <p className="font-bold text-[15px] text-stone-900">Platform Settings</p>

                {[
                  { label: 'Platform Name',    val: 'Amharican',              hint: 'Displayed in the app header and emails' },
                  { label: 'Default Language', val: 'Amharic (አማርኛ)',         hint: 'Primary language taught on this platform' },
                  { label: 'TTS Language Code',val: 'am-ET',                  hint: 'Used for browser speech synthesis fallback' },
                  { label: 'Max Hearts',        val: '3',                     hint: 'Lives per lesson before fail screen' },
                  { label: 'Default XP Reward', val: '10',                   hint: 'XP awarded per lesson if not set individually' },
                ].map(({ label, val, hint }) => (
                  <Field key={label} label={label} hint={hint}>
                    <input defaultValue={val} className="input" readOnly
                      title="Edit these in your .env or database config" />
                  </Field>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-stone-100 p-6">
                <p className="font-bold text-[15px] text-stone-900 mb-4">Database Quick Actions</p>
                <div className="space-y-2">
                  {[
                    { label: 'Export all vocabulary (CSV)',     action: () => {
                      const rows = [['word_am','word_en','romanization','topic_tag','audio_url'], ...vocab.map(w=>[w.word_am,w.word_en,w.romanization||'',w.topic_tag||'',w.audio_url||''])]
                      const csv  = rows.map(r => r.join(',')).join('\n')
                      const a    = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = 'amharican_vocab.csv'; a.click()
                      notify('Vocabulary exported')
                    }},
                    { label: 'View Supabase Dashboard',        action: () => window.open('https://supabase.com/dashboard', '_blank') },
                    { label: 'Docs: Audio setup guide',        action: () => setTab('audio') },
                  ].map(({ label, action }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-stone-100 text-[14px] font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                      {label}
                      <ChevronRight size={15} className="text-stone-300" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="font-bold text-[13px] text-amber-700 mb-1">ℹ️ Admin access</p>
                <p className="text-[12px] text-amber-600">
                  To grant admin access to another user, go to the Users tab and click their role badge. Or run in Supabase SQL Editor:
                </p>
                <code className="block mt-2 bg-amber-100 rounded-xl px-3 py-2 text-[11px] text-amber-800 font-mono">
                  update public.users set role = 'admin' where email = 'user@email.com';
                </code>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══ MODALS ══ */}

      {/* Edit Unit */}
      {editUnit && (
        <Modal title="Edit Unit" onClose={() => setEditUnit(null)}>
          <div className="space-y-3">
            <Field label="English title *">
              <input value={editUnit.title_en} onChange={e => setEditUnit(u => ({ ...u, title_en: e.target.value }))} className="input" />
            </Field>
            <Field label="Amharic title">
              <input value={editUnit.title_am || ''} onChange={e => setEditUnit(u => ({ ...u, title_am: e.target.value }))} className="input am" />
            </Field>
            <Field label="Order index">
              <input type="number" value={editUnit.order_index} onChange={e => setEditUnit(u => ({ ...u, order_index: parseInt(e.target.value) }))} className="input" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={saveUnit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save
              </button>
              <button onClick={() => setEditUnit(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Lesson */}
      {editLesson && (
        <Modal title="Edit Lesson" onClose={() => setEditLesson(null)}>
          <div className="space-y-3">
            <Field label="English title *">
              <input value={editLesson.title_en} onChange={e => setEditLesson(l => ({ ...l, title_en: e.target.value }))} className="input" />
            </Field>
            <Field label="Amharic title">
              <input value={editLesson.title_am || ''} onChange={e => setEditLesson(l => ({ ...l, title_am: e.target.value }))} className="input am" />
            </Field>
            <Field label="XP Reward">
              <input type="number" value={editLesson.xp_reward || 10} onChange={e => setEditLesson(l => ({ ...l, xp_reward: parseInt(e.target.value) }))} className="input" />
            </Field>
            <label className="flex items-center gap-2.5 text-[14px] text-stone-700 font-medium cursor-pointer">
              <div onClick={() => setEditLesson(l => ({ ...l, is_published: !l.is_published }))}>
                {editLesson.is_published
                  ? <ToggleRight size={24} className="text-brand-500" />
                  : <ToggleLeft  size={24} className="text-stone-300" />
                }
              </div>
              {editLesson.is_published ? 'Published (visible to users)' : 'Draft (hidden from users)'}
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={saveLesson} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save
              </button>
              <button onClick={() => setEditLesson(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Exercise */}
      {editExercise && (
        <Modal title="Edit Exercise" subtitle={EX_LABELS[editExercise.type]?.label} onClose={() => setEditExercise(null)} wide>
          <div className="space-y-3">
            <Field label="Exercise type">
              <select value={editExercise.type} onChange={e => setEditExercise(ex => ({ ...ex, type: e.target.value }))} className="input">
                {EX_TYPES.map(t => <option key={t} value={t}>{EX_LABELS[t].icon} {EX_LABELS[t].label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amharic prompt *">
                <input value={editExercise.prompt_am} onChange={e => setEditExercise(ex => ({ ...ex, prompt_am: e.target.value }))} className="input am" />
              </Field>
              <Field label="English translation">
                <input value={editExercise.prompt_en || ''} onChange={e => setEditExercise(ex => ({ ...ex, prompt_en: e.target.value }))} className="input" />
              </Field>
              <Field label="Romanization">
                <input value={editExercise.romanization || ''} onChange={e => setEditExercise(ex => ({ ...ex, romanization: e.target.value }))} className="input" />
              </Field>
              <Field label="Correct answer *">
                <input value={editExercise.correct_answer} onChange={e => setEditExercise(ex => ({ ...ex, correct_answer: e.target.value }))} className="input" />
              </Field>
            </div>
            <Field label="Options (JSON or comma-separated)" hint='e.g. ["Hello","Goodbye","Thank you","Please"]'>
              <textarea value={editExercise.options} onChange={e => setEditExercise(ex => ({ ...ex, options: e.target.value }))}
                className="input h-20 resize-none font-mono text-sm" />
            </Field>
            <Field label="Audio" hint="Upload a file or paste a URL. Leave empty to use browser TTS.">
              <div className="flex items-center gap-2">
                {editExercise.audio_url
                  ? <div className="flex-1 flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2">
                      <Mic size={14} className="text-brand-500 shrink-0" />
                      <p className="text-[12px] text-stone-600 truncate flex-1">{editExercise.audio_url.split('/').pop()}</p>
                      <AudioPreview url={editExercise.audio_url} text={null} />
                      <button onClick={() => setEditExercise(ex => ({ ...ex, audio_url: '' }))}
                        className="text-red-400 hover:text-red-600"><X size={13} /></button>
                    </div>
                  : <div className="flex-1 bg-stone-50 rounded-xl px-3 py-2 text-[12px] text-stone-400">No audio — browser TTS will be used</div>
                }
                <button
                  onClick={() => setAddingAudio({ id: editExercise.id, type: 'exercise', label: editExercise.prompt_am, url: editExercise.audio_url || '' })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 text-brand-600 text-[12px] font-semibold hover:bg-brand-100 transition-colors shrink-0">
                  <Upload size={13} /> {editExercise.audio_url ? 'Change' : 'Add Audio'}
                </button>
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={saveExercise} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save Exercise
              </button>
              <button onClick={() => setEditExercise(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Vocab */}
      {editVocab && (
        <Modal title="Edit Vocabulary Word" onClose={() => setEditVocab(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amharic *">
                <input value={editVocab.word_am} onChange={e => setEditVocab(v => ({ ...v, word_am: e.target.value }))} className="input am" />
              </Field>
              <Field label="English *">
                <input value={editVocab.word_en} onChange={e => setEditVocab(v => ({ ...v, word_en: e.target.value }))} className="input" />
              </Field>
              <Field label="Romanization">
                <input value={editVocab.romanization || ''} onChange={e => setEditVocab(v => ({ ...v, romanization: e.target.value }))} className="input" />
              </Field>
              <Field label="Topic tag">
                <input value={editVocab.topic_tag || ''} onChange={e => setEditVocab(v => ({ ...v, topic_tag: e.target.value }))} className="input" />
              </Field>
            </div>
            <Field label="Audio" hint="Upload a file or paste a URL. Leave empty for browser TTS.">
              <div className="flex items-center gap-2">
                {editVocab.audio_url
                  ? <div className="flex-1 flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2">
                      <Mic size={14} className="text-brand-500 shrink-0" />
                      <p className="text-[12px] text-stone-600 truncate flex-1">{editVocab.audio_url.split('/').pop()}</p>
                      <AudioPreview url={editVocab.audio_url} text={null} />
                      <button onClick={() => setEditVocab(v => ({ ...v, audio_url: '' }))}
                        className="text-red-400 hover:text-red-600"><X size={13} /></button>
                    </div>
                  : <div className="flex-1 bg-stone-50 rounded-xl px-3 py-2 text-[12px] text-stone-400">No audio — browser TTS will be used</div>
                }
                <button
                  onClick={() => setAddingAudio({ id: editVocab.id, type: 'vocab', label: editVocab.word_am, url: editVocab.audio_url || '' })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 text-brand-600 text-[12px] font-semibold hover:bg-brand-100 transition-colors shrink-0">
                  <Upload size={13} /> {editVocab.audio_url ? 'Change' : 'Add Audio'}
                </button>
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={saveVocab} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save Word
              </button>
              <button onClick={() => setEditVocab(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── User Profile Modal ── */}
      {viewUser && (
        <Modal title="User Profile" subtitle={viewUser.user.email} onClose={() => setViewUser(null)} wide>
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className={clsx(
                'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0',
                viewUser.user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-brand-100 text-brand-600'
              )}>
                {viewUser.user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-[18px] text-stone-900">{viewUser.user.name || 'Anonymous'}</p>
                  <Tag label={viewUser.user.role === 'admin' ? '★ Admin' : 'User'}
                    color={viewUser.user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-stone-100 text-stone-500'} />
                </div>
                <p className="text-[13px] text-stone-400">{viewUser.user.email}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'XP',           val: viewUser.user.xp || 0,           color: 'bg-amber-50 text-amber-600'   },
                { label: 'Streak',       val: (viewUser.user.streak_count||0)+'d', color: 'bg-orange-50 text-orange-500' },
                { label: 'Lessons done', val: viewUser.progress.length,          color: 'bg-brand-50 text-brand-600' },
                { label: 'Level',        val: viewUser.user.level || 'A1',       color: 'bg-blue-50 text-blue-600'    },
              ].map(({ label, val, color }) => (
                <div key={label} className={clsx('rounded-2xl p-4 text-center', color.split(' ')[0])}>
                  <p className={`text-[22px] font-bold ${color.split(' ')[1]}`}>{val}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Dates */}
            <div className="card-inset p-4 grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <p className="text-stone-400">Joined</p>
                <p className="font-semibold text-stone-800">{new Date(viewUser.user.created_at).toLocaleDateString('en-GB', { day:'numeric',month:'short',year:'numeric' })}</p>
              </div>
              <div>
                <p className="text-stone-400">Last active</p>
                <p className="font-semibold text-stone-800">
                  {viewUser.user.last_active_at
                    ? new Date(viewUser.user.last_active_at).toLocaleDateString('en-GB', { day:'numeric',month:'short',year:'numeric' })
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-stone-400">Daily goal</p>
                <p className="font-semibold text-stone-800">{viewUser.user.goal_minutes || 10} min/day</p>
              </div>
              <div>
                <p className="text-stone-400">Learning reason</p>
                <p className="font-semibold text-stone-800 capitalize">{viewUser.user.learning_reason || '—'}</p>
              </div>
            </div>

            {/* Activity streak heatmap */}
            {viewUser.streaks.length > 0 && (
              <div>
                <p className="text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-3">Recent Activity</p>
                <div className="flex flex-wrap gap-1.5">
                  {viewUser.streaks.slice(0, 30).map(s => (
                    <div key={s.date} title={`${s.date}: +${s.xp_earned} XP`}
                      className="w-5 h-5 bg-brand-500 rounded-md" />
                  ))}
                </div>
              </div>
            )}

            {/* Completed lessons */}
            {loadingUser ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : viewUser.progress.length > 0 && (
              <div>
                <p className="text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-3">
                  Completed Lessons ({viewUser.progress.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {viewUser.progress.map(p => (
                    <div key={p.lesson_id} className="flex items-center gap-3 px-4 py-2.5 bg-stone-50 rounded-xl">
                      <CheckCircle2 size={14} className="text-brand-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-stone-800 truncate">
                          {p.lessons?.units?.title_en && <span className="text-stone-400">{p.lessons.units.title_en} › </span>}
                          {p.lessons?.title_en || p.lesson_id}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-amber-500">+{p.xp_earned} XP</p>
                        <p className="text-[10px] text-stone-400">{new Date(p.completed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  if (viewUser.user.role === 'admin') {
                    toggleAdmin(viewUser.user.id, 'user')
                    setViewUser(v => v ? ({ ...v, user: { ...v.user, role: 'user' } }) : v)
                  } else {
                    toggleAdmin(viewUser.user.id, 'admin')
                    setViewUser(null)
                  }
                }}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all',
                  viewUser.user.role === 'admin'
                    ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                )}>
                {viewUser.user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </button>
              <button
                onClick={() => { deleteUser(viewUser.user.id); setViewUser(null) }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-[13px] font-bold transition-all">
                <Trash2 size={14} /> Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audio Upload Modal */}
      {addingAudio && (
        <AudioUploadModal
          item={addingAudio}
          saving={saving}
          onSave={saveAudioUrl}
          onRemove={removeAudio}
          onClose={() => setAddingAudio(null)}
        />
      )}

      {/* ── PERMISSIONS MODAL ── */}
      {permUser && (
        <PermissionsModal
          user={permUser}
          onSave={savePermissions}
          onClose={() => setPermUser(null)}
        />
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PERMISSIONS MODAL
// ─────────────────────────────────────────────────────────────
function PermissionsModal({ user, onSave, onClose }) {
  const isPendingPromotion = user._pendingPromotion
  const [perms, setPerms] = useState(() => {
    if (!user.admin_permissions || user.admin_permissions === 'all') {
      // full admin — all perms on
      return Object.fromEntries(Object.keys(ALL_PERMISSIONS).map(k => [k, true]))
    }
    try {
      const p = typeof user.admin_permissions === 'string'
        ? JSON.parse(user.admin_permissions)
        : user.admin_permissions
      return Object.fromEntries(Object.keys(ALL_PERMISSIONS).map(k => [k, !!p[k]]))
    } catch { return Object.fromEntries(Object.keys(ALL_PERMISSIONS).map(k => [k, false])) }
  })
  const [saving, setSaving] = useState(false)

  const toggle = (key) => setPerms(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(user.id, perms)
    setSaving(false)
  }

  const allOn  = Object.values(perms).every(Boolean)
  const allOff = Object.values(perms).every(v => !v)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-start justify-between px-6 py-5 border-b border-stone-100 z-10">
          <div>
            <h3 className="font-bold text-[17px] text-stone-900">
              {isPendingPromotion ? 'Grant Admin Access' : 'Edit Admin Permissions'}
            </h3>
            <p className="text-sm text-stone-400 mt-0.5">{user.name || user.email}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-[13px] text-indigo-700 flex items-start gap-2">
            <Shield size={14} className="mt-0.5 shrink-0" />
            {isPendingPromotion
              ? 'Choose what this user can access as an admin, then click Grant Access.'
              : 'Choose exactly which parts of the admin panel this user can access.'}
          </div>

          {/* Select all / none */}
          <div className="flex gap-2">
            <button onClick={() => setPerms(Object.fromEntries(Object.keys(ALL_PERMISSIONS).map(k => [k, true])))}
              className={clsx('flex-1 py-2 rounded-xl text-[12px] font-bold transition-all border',
                allOn ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-stone-600 border-stone-200 hover:border-indigo-300')}>
              All Access
            </button>
            <button onClick={() => setPerms(Object.fromEntries(Object.keys(ALL_PERMISSIONS).map(k => [k, false])))}
              className={clsx('flex-1 py-2 rounded-xl text-[12px] font-bold transition-all border',
                allOff ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
              Read Only
            </button>
          </div>

          {/* Individual permissions */}
          <div className="space-y-2">
            {Object.entries(ALL_PERMISSIONS).map(([key, { label, desc }]) => (
              <button key={key} onClick={() => toggle(key)}
                className={clsx(
                  'w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition-all',
                  perms[key]
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : 'bg-stone-50 border-stone-100 text-stone-500 hover:border-stone-200'
                )}>
                <div className={clsx('mt-0.5 shrink-0', perms[key] ? 'text-indigo-500' : 'text-stone-300')}>
                  {perms[key] ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{label}</p>
                  <p className="text-[11px] mt-0.5 opacity-70">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isPendingPromotion
                ? <><Shield size={14} /> Grant Admin Access</>
                : <><Save size={14} /> Save Permissions</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
