import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import {
  LayoutDashboard, BookOpen, BookMarked, Dumbbell,
  Trophy, Star, MessageCircle, Users2, Video,
  LogOut, Settings, Flame, Zap, User, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Learn'       },
  { to: '/courses',      icon: BookOpen,         label: 'Courses'     },
  { to: '/vocabulary',   icon: BookMarked,        label: 'Vocabulary'  },
  { to: '/practice',     icon: Dumbbell,          label: 'Practice'    },
  { to: '/conversation', icon: MessageCircle,     label: 'AI Tutor', badge: 'AI' },
  { to: '/videos',       icon: Video,             label: 'Videos'     },
  { to: '/community',    icon: Users2,            label: 'Community', badge: 'NEW' },
  { to: '/leaderboard',  icon: Trophy,            label: 'Leaderboard' },
  { to: '/achievements', icon: Star,              label: 'Achievements'},
]

function NavItem({ to, icon: Icon, label, active, badge }) {
  return (
    <Link to={to}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13.5px] font-semibold transition-all duration-150 group',
        active
          ? 'bg-brand-500 text-white shadow-sm'
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
      )}>
      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all',
        active ? 'bg-white/15' : 'bg-stone-100 group-hover:bg-stone-200')}>
        <Icon size={16} strokeWidth={active ? 2.3 : 1.8} />
      </div>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
          active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600')}>
          {badge}
        </span>
      )}
    </Link>
  )
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation()
  const { signOut, profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const initials = profile?.name
    ? profile.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const levelPct = Math.min(100, ((profile?.xp || 0) % 500) / 5)
  const streakCount = profile?.streak_count || 0
  const xp = profile?.xp || 0

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-[230px] bg-white border-r border-stone-100 fixed h-full z-20 py-5 px-3">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1565E8 0%, #0f4bc9 100%)', boxShadow: '0 3px 0 #0a3496' }}>
            {/* Ethiopian cross-inspired mark */}
            <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
              <path d="M18 6v24M6 18h24" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M10 10l16 16M26 10L10 26" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-extrabold text-[15px] text-stone-900 tracking-tight leading-none">Amharican</p>
            <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Learn Amharic · ኣምሃሪካን</p>
          </div>
        </Link>

        {/* Stats row */}
        <div className="flex gap-2 px-1 mb-4">
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-2.5 py-2 border border-orange-100"
            style={{ background: 'linear-gradient(135deg, #fff7ed, #fff3e0)' }}>
            <span className="text-[15px] animate-flicker">🔥</span>
            <div>
              <p className="text-[13px] font-extrabold text-stone-900 leading-none">{streakCount}</p>
              <p className="text-[9px] text-orange-400 font-semibold leading-none mt-0.5">streak</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-2.5 py-2 border border-amber-100"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
            <span className="text-[15px]">⚡</span>
            <div>
              <p className="text-[13px] font-extrabold text-stone-900 leading-none">{xp}</p>
              <p className="text-[9px] text-amber-500 font-semibold leading-none mt-0.5">XP</p>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="px-2 mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-[9px] font-black text-white">{profile?.level || 'A1'}</span>
              </div>
              <span className="text-[11px] font-bold text-stone-600">Level {profile?.level || 'A1'}</span>
            </div>
            <span className="text-[10px] font-semibold text-stone-400">{Math.round(levelPct)}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${levelPct}%`, background:'linear-gradient(90deg, #1565E8, #4d90fe)' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-hide">
          {NAV.map(item => (
            <NavItem key={item.to} {...item}
              active={pathname === item.to || pathname.startsWith(item.to + '/')} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-0.5 pt-3 border-t border-stone-100 mt-3">
          {profile?.role === 'admin' && (
            <Link to="/admin"
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13.5px] font-semibold transition-all',
                pathname === '/admin' ? 'bg-purple-100 text-purple-700' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800')}>
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <Settings size={15} strokeWidth={1.8} />
              </div>
              Admin
            </Link>
          )}
          <Link to="/profile"
            className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13.5px] font-semibold transition-all',
              pathname === '/profile' ? 'bg-brand-500 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800')}>
            <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-extrabold shrink-0',
              pathname === '/profile' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600')}>
              {initials}
            </div>
            <span className="truncate">{profile?.name?.split(' ')[0] || 'Profile'}</span>
          </Link>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13.5px] font-semibold text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
              <LogOut size={14} strokeWidth={2} />
            </div>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-[230px] pb-24 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-stone-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-1 pt-2 pb-2">
          {[
            { to:'/dashboard',    icon:LayoutDashboard, label:'Learn'    },
            { to:'/vocabulary',   icon:BookMarked,      label:'Words'    },
            { to:'/conversation', icon:MessageCircle,   label:'AI Tutor' },
            { to:'/leaderboard',  icon:Trophy,          label:'Ranks'    },
            { to:'/profile',      icon:User,            label:'Profile'  },
          ].map(({ to, icon: Icon, label }) => {
            const active = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link key={to} to={to}
                className="flex flex-col items-center gap-1 px-3 py-1 transition-all min-w-[52px]">
                <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
                  active
                    ? 'bg-brand-500 shadow-sm'
                    : 'hover:bg-stone-100')}>
                  <Icon size={19} strokeWidth={active ? 2.3 : 1.7}
                    className={active ? 'text-white' : 'text-stone-400'} />
                </div>
                <span className={clsx('text-[10px] font-bold transition-colors',
                  active ? 'text-brand-600' : 'text-stone-400')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}