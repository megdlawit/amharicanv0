import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase }     from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Eye, EyeOff, Phone, Mail, ArrowLeft }  from 'lucide-react'

export default function Login() {
  const [mode,       setMode]       = useState('email')   // 'email' | 'phone'
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [otp,        setOtp]        = useState('')
  const [otpSent,    setOtpSent]    = useState(false)
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [resendCd,   setResendCd]   = useState(0)
  const { fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    await fetchProfile(data.user.id)
    navigate('/dashboard')
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError(''); setLoading(true)
    const normalised = phone.trim().replace(/\s+/g, '')
    const fullPhone  = normalised.startsWith('+') ? normalised : `+${normalised}`
    const { error: err } = await supabase.auth.signInWithOtp({ phone: fullPhone })
    if (err) {
      // Give a friendlier message when phone auth isn't configured yet
      const msg = err.message.includes('phone') || err.message.includes('SMS') || err.message.includes('provider')
        ? 'Phone sign-in is not yet configured. Please use email or Google, or contact your admin to set up SMS.'
        : err.message
      setError(msg); setLoading(false); return
    }
    setOtpSent(true); setLoading(false)
    setResendCd(60)
    const iv = setInterval(() => setResendCd(c => { if (c <= 1) { clearInterval(iv); return 0 } return c - 1 }), 1000)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const normalised = phone.trim().replace(/\s+/g, '')
    const fullPhone  = normalised.startsWith('+') ? normalised : `+${normalised}`
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: fullPhone, token: otp, type: 'sms',
    })
    if (err) { setError(err.message); setLoading(false); return }
    await fetchProfile(data.user.id)
    navigate('/dashboard')
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                <path d="M6 22L16 10L26 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 28L16 18L23 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[18px] text-stone-900">Amharican</span>
          </Link>
          <h1 className="text-[26px] font-bold text-stone-900 tracking-tight">Welcome back</h1>
          <p className="text-stone-400 text-sm mt-1">Continue your Amharic journey</p>
        </div>

        <div className="card p-7">
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl py-3 text-[14px] font-semibold text-stone-700 transition-all active:scale-[0.98] mb-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[12px] text-stone-400">or continue with</span>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-stone-100 p-1 mb-5 gap-1">
            <button onClick={() => { setMode('email'); setError(''); setOtpSent(false) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${mode === 'email' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>
              <Mail size={14} /> Email
            </button>
            <button onClick={() => { setMode('phone'); setError(''); setOtpSent(false) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${mode === 'phone' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>
              <Phone size={14} /> Phone
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-2xl mb-4">{error}</div>
          )}

          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="you@example.com" autoComplete="email" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pr-11" placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'phone' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    className="input pl-10" placeholder="+1 555 123 4567" autoComplete="tel" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">Include country code (e.g. +1 for US, +251 for Ethiopia)</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Send Code'}
              </button>
            </form>
          )}

          {mode === 'phone' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <button type="button" onClick={() => setOtpSent(false)}
                className="flex items-center gap-1.5 text-[13px] text-stone-400 hover:text-stone-600 transition-colors mb-1">
                <ArrowLeft size={13} /> Change number
              </button>
              <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 text-[13px] text-brand-700 mb-1">
                We sent a 6-digit code to <strong>{phone}</strong>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Verification Code</label>
                <input type="text" required value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-[20px] tracking-[0.3em] font-bold"
                  placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" />
              </div>
              <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Verify & Sign In'}
              </button>
              <div className="text-center">
                {resendCd > 0
                  ? <p className="text-[12px] text-stone-400">Resend in {resendCd}s</p>
                  : <button type="button" onClick={handleSendOtp} className="text-[12px] text-brand-600 font-semibold hover:underline">Resend code</button>
                }
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-stone-500 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
