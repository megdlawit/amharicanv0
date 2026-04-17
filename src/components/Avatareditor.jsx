import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Check, RotateCcw, Save, X } from 'lucide-react'

const AVATAR_CONFIG = {
  body: {
    label: 'Body',
    emoji: '🧍',
    options: [
      { id: 'round', label: 'Round', color: '#58CC02' },
      { id: 'slim', label: 'Slim', color: '#1CB0F6' },
      { id: 'strong', label: 'Strong', color: '#FF9600' },
    ],
  },
  skin: {
    label: 'Skin Tone',
    emoji: '✋',
    options: [
      { id: 's1', color: '#FDDBB4' },
      { id: 's2', color: '#F5C89A' },
      { id: 's3', color: '#E8A97A' },
      { id: 's4', color: '#C98B52' },
      { id: 's5', color: '#A0612A' },
      { id: 's6', color: '#6B3A1F' },
    ],
  },
  hair: {
    label: 'Hair Style',
    emoji: '💇',
    options: [
      { id: 'short', label: 'Short' },
      { id: 'medium', label: 'Medium' },
      { id: 'long', label: 'Long' },
      { id: 'curly', label: 'Curly' },
      { id: 'bun', label: 'Bun' },
      { id: 'bald', label: 'Bald' },
    ],
  },
  hairColor: {
    label: 'Hair Color',
    emoji: '🎨',
    options: [
      { id: 'hc1', color: '#1A1A1A' },
      { id: 'hc2', color: '#5C3A1E' },
      { id: 'hc3', color: '#A0522D' },
      { id: 'hc4', color: '#D4A017' },
      { id: 'hc5', color: '#FF4500' },
      { id: 'hc6', color: '#FF69B4' },
      { id: 'hc7', color: '#9B59B6' },
      { id: 'hc8', color: '#1CB0F6' },
    ],
  },
  eyes: {
    label: 'Eyes',
    emoji: '👀',
    options: [
      { id: 'normal', label: 'Normal' },
      { id: 'wide', label: 'Wide' },
      { id: 'squint', label: 'Squint' },
      { id: 'star', label: 'Star' },
    ],
  },
  eyeColor: {
    label: 'Eye Color',
    emoji: '🔵',
    options: [
      { id: 'ec1', color: '#2C3E50' },
      { id: 'ec2', color: '#1CB0F6' },
      { id: 'ec3', color: '#27AE60' },
      { id: 'ec4', color: '#8B5CF6' },
      { id: 'ec5', color: '#A0522D' },
    ],
  },
  outfit: {
    label: 'Outfit',
    emoji: '👕',
    options: [
      { id: 'casual', label: 'Casual', color: '#58CC02' },
      { id: 'formal', label: 'Formal', color: '#1CB0F6' },
      { id: 'sporty', label: 'Sporty', color: '#FF9600' },
      { id: 'cool', label: 'Cool', color: '#FF4B4B' },
      { id: 'cozy', label: 'Cozy', color: '#9B59B6' },
    ],
  },
  accessory: {
    label: 'Accessory',
    emoji: '🎭',
    options: [
      { id: 'none', label: 'None' },
      { id: 'glasses', label: 'Glasses' },
      { id: 'cap', label: 'Cap' },
      { id: 'headband', label: 'Band' },
      { id: 'earrings', label: 'Earrings' },
    ],
  },
}

const DEFAULT_AVATAR = {
  body: 'round',
  skin: 's3',
  hair: 'medium',
  hairColor: 'hc1',
  eyes: 'normal',
  eyeColor: 'ec1',
  outfit: 'casual',
  accessory: 'none',
}

function AvatarSVG({ config, size = 180 }) {
  const skinColors = {
    s1: '#FDDBB4', s2: '#F5C89A', s3: '#E8A97A',
    s4: '#C98B52', s5: '#A0612A', s6: '#6B3A1F',
  }
  const hairColors = {
    hc1: '#1A1A1A', hc2: '#5C3A1E', hc3: '#A0522D',
    hc4: '#D4A017', hc5: '#FF4500', hc6: '#FF69B4',
    hc7: '#9B59B6', hc8: '#1CB0F6',
  }
  const eyeColors = {
    ec1: '#2C3E50', ec2: '#1CB0F6', ec3: '#27AE60',
    ec4: '#8B5CF6', ec5: '#A0522D',
  }
  const outfitColors = {
    casual: '#58CC02', formal: '#1CB0F6', sporty: '#FF9600',
    cool: '#FF4B4B', cozy: '#9B59B6',
  }

  const skin = skinColors[config.skin] || skinColors.s3
  const hair = hairColors[config.hairColor] || hairColors.hc1
  const eye = eyeColors[config.eyeColor] || eyeColors.ec1
  const outfit = outfitColors[config.outfit] || outfitColors.casual
  const bodyW = config.body === 'slim' ? 56 : config.body === 'strong' ? 80 : 68

  const renderHair = () => {
    if (config.hair === 'bald') return null
    if (config.hair === 'short')
      return <ellipse cx="100" cy="58" rx="36" ry="28" fill={hair} />
    if (config.hair === 'medium')
      return <>
        <ellipse cx="100" cy="52" rx="38" ry="30" fill={hair} />
        <rect x="64" y="60" width="12" height="22" rx="6" fill={hair} />
        <rect x="124" y="60" width="12" height="22" rx="6" fill={hair} />
      </>
    if (config.hair === 'long')
      return <>
        <ellipse cx="100" cy="52" rx="38" ry="30" fill={hair} />
        <rect x="62" y="60" width="12" height="50" rx="6" fill={hair} />
        <rect x="126" y="60" width="12" height="50" rx="6" fill={hair} />
      </>
    if (config.hair === 'curly')
      return <>
        <ellipse cx="100" cy="52" rx="40" ry="30" fill={hair} />
        {[70, 85, 100, 115, 130].map((x, i) =>
          <circle key={i} cx={x} cy="38" r="10" fill={hair} />
        )}
      </>
    if (config.hair === 'bun')
      return <>
        <ellipse cx="100" cy="55" rx="36" ry="25" fill={hair} />
        <circle cx="100" cy="36" r="14" fill={hair} />
      </>
    return <ellipse cx="100" cy="52" rx="38" ry="30" fill={hair} />
  }

  const renderEyes = () => {
    if (config.eyes === 'wide')
      return <>
        <circle cx="84" cy="84" r="9" fill="white" />
        <circle cx="116" cy="84" r="9" fill="white" />
        <circle cx="84" cy="85" r="5" fill={eye} />
        <circle cx="116" cy="85" r="5" fill={eye} />
        <circle cx="85" cy="83" r="2" fill="white" />
        <circle cx="117" cy="83" r="2" fill="white" />
      </>
    if (config.eyes === 'squint')
      return <>
        <path d="M76 84 Q84 78 92 84" stroke={eye} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M108 84 Q116 78 124 84" stroke={eye} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    if (config.eyes === 'star')
      return <>
        <text x="80" y="90" textAnchor="middle" fontSize="18" fill={eye}>⭐</text>
        <text x="120" y="90" textAnchor="middle" fontSize="18" fill={eye}>⭐</text>
      </>
    return <>
      <circle cx="84" cy="85" r="8" fill="white" />
      <circle cx="116" cy="85" r="8" fill="white" />
      <circle cx="84" cy="86" r="4.5" fill={eye} />
      <circle cx="116" cy="86" r="4.5" fill={eye} />
      <circle cx="85.5" cy="84" r="1.8" fill="white" />
      <circle cx="117.5" cy="84" r="1.8" fill="white" />
    </>
  }

  const renderAccessory = () => {
    if (config.accessory === 'glasses')
      return <>
        <rect x="73" y="79" width="22" height="14" rx="7" fill="none" stroke="#333" strokeWidth="2.5" />
        <rect x="105" y="79" width="22" height="14" rx="7" fill="none" stroke="#333" strokeWidth="2.5" />
        <line x1="95" y1="86" x2="105" y2="86" stroke="#333" strokeWidth="2" />
        <line x1="62" y1="84" x2="73" y2="85" stroke="#333" strokeWidth="2" />
        <line x1="127" y1="85" x2="138" y2="84" stroke="#333" strokeWidth="2" />
      </>
    if (config.accessory === 'cap')
      return <>
        <ellipse cx="100" cy="62" rx="42" ry="14" fill={hair} />
        <rect x="70" y="38" width="60" height="28" rx="12" fill={hair} />
        <rect x="58" y="60" width="22" height="8" rx="4" fill={hair} />
      </>
    if (config.accessory === 'headband')
      return <rect x="63" y="68" width="74" height="10" rx="5" fill={hair} opacity="0.9" />
    if (config.accessory === 'earrings')
      return <>
        <circle cx="64" cy="96" r="5" fill="#FFD700" />
        <circle cx="136" cy="96" r="5" fill="#FFD700" />
      </>
    return null
  }

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="100" cy="175" rx={bodyW / 2 + 4} ry="28" fill={outfit} opacity="0.3" />
      <rect x={100 - bodyW / 2} y="130" width={bodyW} height="55" rx="16" fill={outfit} />

      {/* Neck */}
      <rect x="91" y="115" width="18" height="22" rx="6" fill={skin} />

      {/* Head */}
      <ellipse cx="100" cy="84" rx="38" ry="40" fill={skin} />

      {/* Hair (behind face elements if long) */}
      {renderHair()}

      {/* Ears */}
      <ellipse cx="63" cy="88" rx="7" ry="9" fill={skin} />
      <ellipse cx="137" cy="88" rx="7" ry="9" fill={skin} />

      {/* Eyes */}
      {renderEyes()}

      {/* Eyebrows */}
      <path d="M76 74 Q84 69 92 73" stroke={hair === '#FDDBB4' || hair === '#F5C89A' ? '#555' : hair} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M108 73 Q116 69 124 74" stroke={hair === '#FDDBB4' || hair === '#F5C89A' ? '#555' : hair} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="100" cy="98" rx="5" ry="3.5" fill={skin} stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />

      {/* Mouth — smile */}
      <path d="M88 110 Q100 120 112 110" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Cheek blush */}
      <ellipse cx="73" cy="104" rx="10" ry="7" fill="#FF9999" opacity="0.3" />
      <ellipse cx="127" cy="104" rx="10" ry="7" fill="#FF9999" opacity="0.3" />

      {/* Accessory */}
      {renderAccessory()}
    </svg>
  )
}

const SECTION_ORDER = ['body', 'skin', 'hair', 'hairColor', 'eyes', 'eyeColor', 'outfit', 'accessory']

export default function AvatarEditor({ onClose, onSave }) {
  const { user, refreshProfile } = useAuthStore()
  const [config, setConfig] = useState(DEFAULT_AVATAR)
  const [activeSection, setActiveSection] = useState('skin')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const avatarJson = JSON.stringify({ type: 'avatarConfig', config })
    await supabase.from('users').update({ avatar_url: avatarJson }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onSave?.(config)
    }, 1200)
  }

  const section = AVATAR_CONFIG[activeSection]

  const isColorSection = activeSection === 'skin' || activeSection === 'hairColor' || activeSection === 'eyeColor'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'var(--color-background-primary)',
        borderRadius: '24px',
        width: '100%', maxWidth: '420px',
        overflow: 'hidden',
        border: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh',
      }}>

        {/* Header */}
        <div style={{
          background: '#58CC02',
          padding: '16px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>Build your avatar</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>Make it yours!</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div style={{
          background: 'linear-gradient(180deg, #E8F9D0 0%, #F0FBE4 100%)',
          padding: '24px 0 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '50%',
            padding: '8px',
            boxShadow: '0 4px 20px rgba(88,204,2,0.25)',
          }}>
            <AvatarSVG config={config} size={140} />
          </div>
          <button onClick={() => setConfig(DEFAULT_AVATAR)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '20px',
            padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}>
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex', overflowX: 'auto', gap: '4px',
          padding: '12px 16px 8px',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          scrollbarWidth: 'none',
        }}>
          {SECTION_ORDER.map(key => {
            const s = AVATAR_CONFIG[key]
            const isActive = activeSection === key
            return (
              <button key={key} onClick={() => setActiveSection(key)} style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '20px',
                border: isActive ? '2px solid #58CC02' : '2px solid transparent',
                background: isActive ? '#E8F9D0' : 'var(--color-background-secondary)',
                cursor: 'pointer',
                fontSize: '12px', fontWeight: 600,
                color: isActive ? '#3A8F00' : 'var(--color-text-secondary)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontSize: '14px' }}>{s.emoji}</span>
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Options */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {section.label}
          </p>

          {isColorSection ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {section.options.map(opt => {
                const isSelected = config[activeSection] === opt.id
                return (
                  <button key={opt.id} onClick={() => setConfig(c => ({ ...c, [activeSection]: opt.id }))}
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: opt.color,
                      border: isSelected ? '3px solid #58CC02' : '3px solid transparent',
                      cursor: 'pointer',
                      outline: isSelected ? '2px solid white' : 'none',
                      outlineOffset: '2px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    }}>
                    {isSelected && <Check size={18} color="white" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {section.options.map(opt => {
                const isSelected = config[activeSection] === opt.id
                return (
                  <button key={opt.id} onClick={() => setConfig(c => ({ ...c, [activeSection]: opt.id }))}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '16px',
                      border: isSelected ? '2.5px solid #58CC02' : '2px solid var(--color-border-tertiary)',
                      background: isSelected ? '#E8F9D0' : 'var(--color-background-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600,
                      color: isSelected ? '#3A8F00' : 'var(--color-text-primary)',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                    {opt.color && (
                      <span style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: opt.color, display: 'inline-block',
                      }} />
                    )}
                    {opt.label}
                    {isSelected && <Check size={13} color="#3A8F00" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: '12px 16px 16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <button onClick={handleSave} disabled={saving} style={{
            width: '100%', padding: '14px',
            borderRadius: '16px', border: 'none',
            background: saved ? '#3A8F00' : '#58CC02',
            color: 'white', fontSize: '16px', fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
            transform: saving ? 'scale(0.98)' : 'scale(1)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
          }}>
            {saved ? (
              <><Check size={20} strokeWidth={3} /> Saved!</>
            ) : saving ? (
              <span style={{
                width: '20px', height: '20px', border: '3px solid white',
                borderTopColor: 'transparent', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <><Save size={18} /> Save Avatar</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export function AvatarDisplay({ avatarUrl, initials, size = 56 }) {
  if (!avatarUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: '#E8F9D0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.3, fontWeight: 700, color: '#3A8F00',
      }}>
        {initials || '?'}
      </div>
    )
  }

  try {
    const parsed = JSON.parse(avatarUrl)
    if (parsed?.type === 'avatarConfig') {
      return (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', background: '#E8F9D0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AvatarSVG config={parsed.config} size={size * 1.1} />
        </div>
      )
    }
  } catch {}

  return (
    <img src={avatarUrl} alt="avatar" style={{
      width: size, height: size, borderRadius: '50%',
      objectFit: 'cover', border: '2px solid #E8F9D0',
    }} />
  )
}