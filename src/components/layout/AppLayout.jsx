import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import {
  LayoutDashboard, BookOpen, BookMarked, Dumbbell,
  Trophy, Star, MessageCircle, Users2, Video,
  LogOut, Settings, Flame, Zap, User, MoreHorizontal, X
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

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

// Primary tabs in bottom nav bar
const MOBILE_NAV_PRIMARY = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Learn'     },
  { to: '/courses',      icon: BookOpen,         label: 'Courses'   },
  { to: '/conversation', icon: MessageCircle,    label: 'AI Tutor'  },
  { to: '/leaderboard',  icon: Trophy,           label: 'Leaderboard' },
  { to: '/profile',      icon: User,             label: 'Profile'   },
]

// Extra tabs shown in "More" drawer
const MOBILE_NAV_MORE = [
  { to: '/vocabulary',   icon: BookMarked,  label: 'Vocabulary'  },
  { to: '/practice',     icon: Dumbbell,    label: 'Practice'    },
  { to: '/videos',       icon: Video,       label: 'Videos'      },
  { to: '/community',    icon: Users2,      label: 'Community', badge: 'NEW' },
  { to: '/achievements', icon: Star,        label: 'Achievements'},
]

function NavItem({ to, icon: Icon, label, active, badge }) {
  return (
    <Link to={to}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium transition-all duration-150',
        active
          ? 'bg-brand-500 text-white shadow-sm'
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
      )}>
      <Icon size={16} strokeWidth={active ? 2.3 : 1.8} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={clsx(
          'text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
          active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'
        )}>
          {badge}
        </span>
      )}
    </Link>
  )
}

/* Avatar component — shows profile photo if available, else initials */
function UserAvatar({ profile, size = 'md', className = '' }) {
  const initials = profile?.name
    ? profile.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const sizeClass = size === 'lg' ? 'w-10 h-10 text-sm' : size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[11px]'

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.name || 'Avatar'}
        className={clsx('rounded-full object-cover shrink-0', sizeClass, className)}
      />
    )
  }
  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-bold shrink-0',
      sizeClass,
      className
    )}>
      {initials}
    </div>
  )
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation()
  const { signOut, profile } = useAuthStore()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const initials = profile?.name
    ? profile.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const levelPct = Math.min(100, ((profile?.xp || 0) % 500) / 5)

  // Check if current path is in the "more" group
  const moreActive = MOBILE_NAV_MORE.some(item =>
    pathname === item.to || pathname.startsWith(item.to + '/')
  )

  return (
    <div className="min-h-screen bg-stone-50 flex">

      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden md:flex flex-col w-[220px] bg-white border-r border-stone-100 fixed h-full z-20 py-5 px-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 mb-6">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <path d="M6 22L16 10L26 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 28L16 18L23 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-[15px] text-stone-900 tracking-tight leading-none">Amharican</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Learn Amharic</p>
          </div>
        </Link>

        {/* XP + Streak chips */}
        <div className="flex gap-2 px-1 mb-4">
          <div className="flex-1 flex items-center gap-1.5 bg-orange-50 rounded-xl px-2.5 py-2">
            <Flame size={13} className="text-orange-400 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-stone-900 leading-none">{profile?.streak_count || 0}</p>
              <p className="text-[9px] text-stone-400 leading-none mt-0.5">streak</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-1.5 bg-amber-50 rounded-xl px-2.5 py-2">
            <Zap size={13} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-stone-900 leading-none">{profile?.xp || 0}</p>
              <p className="text-[9px] text-stone-400 leading-none mt-0.5">XP</p>
            </div>
          </div>
        </div>

        {/* Level bar */}
        <div className="px-3 mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-stone-500">Level {profile?.level || 'A1'}</span>
            <span className="text-[10px] text-stone-400">{Math.round(levelPct)}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${levelPct}%` }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavItem key={item.to} {...item}
              active={pathname === item.to || pathname.startsWith(item.to + '/')} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="space-y-0.5 pt-3 border-t border-stone-100 mt-3">
          {profile?.role === 'admin' && (
            <Link to="/admin"
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium transition-all',
                pathname === '/admin' ? 'bg-purple-100 text-purple-700' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
              )}>
              <Settings size={16} strokeWidth={1.8} className="shrink-0" />
              Admin
            </Link>
          )}
          <Link to="/profile"
            className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium transition-all',
              pathname === '/profile' ? 'bg-brand-500 text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            )}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar"
                className={clsx('w-6 h-6 rounded-full object-cover shrink-0',
                  pathname === '/profile' ? 'ring-2 ring-white/40' : '')} />
            ) : (
              <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                pathname === '/profile' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600')}>
                {initials}
              </div>
            )}
            <span className="truncate">{profile?.name?.split(' ')[0] || 'Profile'}</span>
          </Link>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] font-medium text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-[220px] pb-24 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-stone-100">
        <div className="flex items-center justify-around px-1 py-1.5">
          {MOBILE_NAV_PRIMARY.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link key={to} to={to}
                className={clsx('flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all min-w-[48px]',
                  active ? 'text-brand-600' : 'text-stone-400')}>
                <div className={clsx('w-7 h-7 rounded-xl flex items-center justify-center relative', active ? 'bg-brand-50' : '')}>
                  {to === '/profile' && profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar"
                      className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                  )}
                </div>
                <span className={clsx('text-[10px] font-medium', active ? 'text-brand-600' : 'text-stone-400')}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={clsx('flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all min-w-[48px]',
              moreActive ? 'text-brand-600' : 'text-stone-400')}>
            <div className={clsx('w-7 h-7 rounded-xl flex items-center justify-center', moreActive ? 'bg-brand-50' : '')}>
              <MoreHorizontal size={18} strokeWidth={moreActive ? 2.2 : 1.7} />
            </div>
            <span className={clsx('text-[10px] font-medium', moreActive ? 'text-brand-600' : 'text-stone-400')}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ── Mobile "More" drawer ── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMoreOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8 pt-4 px-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* Handle + header */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <p className="text-[13px] font-bold text-stone-500 uppercase tracking-widest">More</p>
              <button onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            {/* Grid of extra nav items */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {MOBILE_NAV_MORE.map(({ to, icon: Icon, label, badge }) => {
                const active = pathname === to || pathname.startsWith(to + '/')
                return (
                  <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                    className={clsx(
                      'flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border',
                      active
                        ? 'bg-brand-50 border-brand-200 text-brand-600'
                        : 'bg-stone-50 border-stone-100 text-stone-500'
                    )}>
                    <div className="relative">
                      <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                      {badge && (
                        <span className="absolute -top-1.5 -right-2 text-[8px] font-bold bg-brand-500 text-white px-1 rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
                  </Link>
                )
              })}
            </div>

            {/* User info + sign out */}
            <div className="border-t border-stone-100 pt-4 flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-stone-800 truncate">{profile?.name || 'Learner'}</p>
                <p className="text-[11px] text-stone-400">Level {profile?.level || 'A1'} · {profile?.xp || 0} XP</p>
              </div>
              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all">
                <LogOut size={14} strokeWidth={1.8} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
