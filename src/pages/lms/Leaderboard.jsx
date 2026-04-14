import { useEffect, useState } from 'react'
import { supabase }     from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout        from '@/components/layout/AppLayout'
import { Trophy, Flame, Zap } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { id: 'xp',     label: 'All Time',  col: 'xp'           },
  { id: 'streak', label: 'Streaks',   col: 'streak_count' },
]

function Avatar({ name, size = 'md', isMe }) {
  const s = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={clsx(
      'rounded-full flex items-center justify-center font-bold shrink-0',
      s,
      isMe ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-600'
    )}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return (
    <span className="w-7 text-center text-[13px] font-bold text-stone-300 shrink-0">
      {rank}
    </span>
  )
}

export default function Leaderboard() {
  const { user, profile } = useAuthStore()
  const [tab,     setTab]     = useState(0)
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const col = TABS[tab].col
      const { data, error: err } = await supabase
        .from('users')
        .select('id, name, xp, streak_count, level')
        .order(col, { ascending: false })
        .gt(col, 0)          // only users who have activity
        .limit(100)

      if (err) {
        console.error('Leaderboard fetch error:', err.message)
        setError(err.message)
        setLoading(false)
        return
      }

      setUsers(data || [])
      setLoading(false)
    }
    load()
  }, [tab])

  const myRank = users.findIndex(u => u.id === user?.id) + 1
  const top3   = users.slice(0, 3)
  const rest   = users.slice(3)
  const col    = TABS[tab].col

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Trophy size={20} className="text-amber-500" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Leaderboard</h1>
            <p className="text-stone-400 text-sm">{users.length} learners ranked</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setTab(i)}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200',
                tab === i ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-600'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* My rank banner */}
        {myRank > 0 && profile && (
          <div className="card-inset p-4 mb-6 flex items-center gap-3">
            <Avatar name={profile.name} size="sm" isMe />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-stone-800 truncate">
                {profile.name || 'You'}
              </p>
              <p className="text-[11px] text-stone-400">Your current rank</p>
            </div>
            <div className="text-right">
              <p className="text-[20px] font-bold text-brand-600 leading-none">
                #{myRank}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {col === 'xp' ? `${profile.xp || 0} XP` : `${profile.streak_count || 0}-day streak`}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="card-inset p-4 mb-4 text-center">
            <p className="text-red-500 text-sm font-medium">Could not load leaderboard</p>
            <p className="text-stone-400 text-xs mt-1">Run fix_policies_v3.sql in Supabase to fix RLS</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card p-10 text-center">
            <Trophy size={36} className="text-stone-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-semibold text-stone-500">No rankings yet</p>
            <p className="text-sm text-stone-400 mt-1">
              Complete lessons to appear here
            </p>
          </div>
        ) : (
          <>
            {/* ── Top 3 podium ── */}
            {top3.length >= 2 && (
              <div className="card p-6 mb-5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-5 text-center">
                  Top Learners
                </p>
                <div className="flex items-end justify-center gap-3">

                  {/* 2nd place */}
                  {top3[1] && (
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <Avatar name={top3[1].name} size="md" isMe={top3[1].id === user?.id} />
                      <p className="text-[12px] font-semibold text-stone-600 text-center truncate w-full">
                        {top3[1].name || 'User'}
                      </p>
                      <div className="bg-stone-100 rounded-xl py-2 px-2 text-center w-full mt-2 h-16 flex flex-col items-center justify-center">
                        <p className="text-base">🥈</p>
                        <p className="text-[12px] font-bold text-stone-700">
                          {col === 'xp' ? `${top3[1].xp} XP` : `${top3[1].streak_count}d`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1st place — taller */}
                  {top3[0] && (
                    <div className="flex-1 flex flex-col items-center gap-2 -mt-4">
                      <div className="relative">
                        <Avatar name={top3[0].name} size="lg" isMe={top3[0].id === user?.id} />
                        <div className="absolute -top-2 -right-1 text-lg">👑</div>
                      </div>
                      <p className="text-[13px] font-bold text-stone-900 text-center truncate w-full">
                        {top3[0].name || 'User'}
                      </p>
                      <div className="bg-amber-400 rounded-xl py-2 px-2 text-center w-full mt-2 h-24 flex flex-col items-center justify-center">
                        <p className="text-base">🥇</p>
                        <p className="text-[13px] font-bold text-white">
                          {col === 'xp' ? `${top3[0].xp} XP` : `${top3[0].streak_count}d`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3rd place */}
                  {top3[2] && (
                    <div className="flex-1 flex flex-col items-center gap-2 mt-2">
                      <Avatar name={top3[2].name} size="sm" isMe={top3[2].id === user?.id} />
                      <p className="text-[12px] font-semibold text-stone-600 text-center truncate w-full">
                        {top3[2].name || 'User'}
                      </p>
                      <div className="bg-orange-100 rounded-xl py-2 px-2 text-center w-full mt-2 h-12 flex flex-col items-center justify-center">
                        <p className="text-base">🥉</p>
                        <p className="text-[12px] font-bold text-orange-700">
                          {col === 'xp' ? `${top3[2].xp} XP` : `${top3[2].streak_count}d`}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ── Full ranked list ── */}
            {users.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                  Full Rankings
                </p>
                {users.map((u, i) => {
                  const rank = i + 1
                  const isMe = u.id === user?.id
                  return (
                    <div key={u.id}
                      className={clsx(
                        'card p-4 flex items-center gap-3 transition-all duration-200',
                        isMe && 'ring-2 ring-brand-300 bg-brand-50/40'
                      )}
                    >
                      <RankBadge rank={rank} />

                      <Avatar name={u.name} size="sm" isMe={isMe} />

                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-[14px] font-semibold truncate',
                          isMe ? 'text-brand-700' : 'text-stone-800'
                        )}>
                          {u.name || 'Anonymous'}
                          {isMe && (
                            <span className="ml-1.5 text-[11px] text-brand-400 font-normal">you</span>
                          )}
                        </p>
                        <p className="text-[11px] text-stone-400">Level {u.level || 'A1'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        {col === 'xp' ? (
                          <div className="flex items-center gap-1 justify-end">
                            <Zap size={12} className="text-amber-400" />
                            <span className="text-[14px] font-bold text-stone-800">{u.xp}</span>
                            <span className="text-[11px] text-stone-400">XP</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 justify-end">
                            <Flame size={12} className="text-orange-400" />
                            <span className="text-[14px] font-bold text-stone-800">{u.streak_count}</span>
                            <span className="text-[11px] text-stone-400">days</span>
                          </div>
                        )}
                        {/* Show the other metric smaller */}
                        <p className="text-[11px] text-stone-300 mt-0.5">
                          {col === 'xp'
                            ? `${u.streak_count}d streak`
                            : `${u.xp} XP`
                          }
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        <div className="h-6" />
      </div>
    </AppLayout>
  )
}
