import { useEffect, useState } from 'react'
import { useAuthStore }  from '@/store/useAuthStore'
import { useLessonStore } from '@/store/useLessonStore'
import AppLayout         from '@/components/layout/AppLayout'
import { Star, Lock }    from 'lucide-react'
import clsx from 'clsx'

// Static achievement definitions — unlock based on user stats
const ACHIEVEMENTS = [
  // Streak
  { id: 'streak_1',  emoji: '🔥', title: 'First Flame',    desc: '1-day streak',         check: (p) => (p?.streak_count||0) >= 1  },
  { id: 'streak_3',  emoji: '🔥', title: 'On Fire',        desc: '3-day streak',         check: (p) => (p?.streak_count||0) >= 3  },
  { id: 'streak_7',  emoji: '🔥', title: 'Week Warrior',   desc: '7-day streak',         check: (p) => (p?.streak_count||0) >= 7  },
  { id: 'streak_30', emoji: '🔥', title: 'Unstoppable',    desc: '30-day streak',        check: (p) => (p?.streak_count||0) >= 30 },
  // XP
  { id: 'xp_50',    emoji: '⚡', title: 'Spark',           desc: 'Earn 50 XP',           check: (p) => (p?.xp||0) >= 50   },
  { id: 'xp_200',   emoji: '⚡', title: 'Charged Up',      desc: 'Earn 200 XP',          check: (p) => (p?.xp||0) >= 200  },
  { id: 'xp_500',   emoji: '⚡', title: 'Powerhouse',      desc: 'Earn 500 XP',          check: (p) => (p?.xp||0) >= 500  },
  { id: 'xp_1000',  emoji: '⚡', title: 'Legend',          desc: 'Earn 1,000 XP',        check: (p) => (p?.xp||0) >= 1000 },
  // Lessons
  { id: 'lessons_1',  emoji: '📖', title: 'First Step',    desc: 'Complete 1 lesson',    check: (_, done) => done >= 1  },
  { id: 'lessons_5',  emoji: '📖', title: 'Getting Going',  desc: 'Complete 5 lessons',  check: (_, done) => done >= 5  },
  { id: 'lessons_10', emoji: '📖', title: 'Dedicated',      desc: 'Complete 10 lessons', check: (_, done) => done >= 10 },
  { id: 'lessons_25', emoji: '📖', title: 'Scholar',        desc: 'Complete 25 lessons', check: (_, done) => done >= 25 },
  // Level
  { id: 'level_a1',  emoji: '🌱', title: 'Seedling',       desc: 'Reach level A1',       check: (p) => ['A1','A1+','A2','B1'].includes(p?.level) },
  { id: 'level_a2',  emoji: '🌿', title: 'Growing',        desc: 'Reach level A2',       check: (p) => ['A2','B1'].includes(p?.level) },
  { id: 'level_b1',  emoji: '🌳', title: 'Rooted',         desc: 'Reach level B1',       check: (p) => p?.level === 'B1' },
  // Script
  { id: 'script_1',  emoji: '✍️', title: 'Script Curious', desc: 'Complete Unit 1',      check: (_, __, unitsDone) => unitsDone >= 1 },
  { id: 'script_2',  emoji: '✍️', title: 'Script Student', desc: 'Complete 2 units',     check: (_, __, unitsDone) => unitsDone >= 2 },
  { id: 'script_3',  emoji: '✍️', title: 'Script Master',  desc: 'Complete 3 units',     check: (_, __, unitsDone) => unitsDone >= 3 },
]

function Badge({ a, unlocked }) {
  return (
    <div className={clsx(
      'card p-4 flex flex-col items-center text-center gap-2 transition-all duration-200',
      unlocked ? 'hover:shadow-lifted' : 'opacity-40'
    )}>
      <div className={clsx(
        'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl',
        unlocked ? 'bg-amber-50' : 'bg-stone-100'
      )}>
        {unlocked ? a.emoji : <Lock size={16} className="text-stone-300" />}
      </div>
      <div>
        <p className={clsx('text-[13px] font-bold', unlocked ? 'text-stone-900' : 'text-stone-400')}>
          {a.title}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">{a.desc}</p>
      </div>
      {unlocked && (
        <div className="w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function Achievements() {
  const { profile }  = useAuthStore()
  const { units, progress, fetchUnits, fetchProgress } = useLessonStore()
  const { user }     = useAuthStore()

  useEffect(() => { fetchUnits() }, [])
  useEffect(() => { if (user?.id) fetchProgress(user.id) }, [user?.id])

  const completedIds = new Set(progress.map(p => p.lesson_id))
  const doneCount    = completedIds.size

  const unitsDone = units.filter(unit => {
    const lessons = (unit.lessons||[]).filter(l => l.is_published !== false)
    return lessons.length > 0 && lessons.every(l => completedIds.has(l.id))
  }).length

  const unlocked   = ACHIEVEMENTS.filter(a => a.check(profile, doneCount, unitsDone))
  const locked     = ACHIEVEMENTS.filter(a => !a.check(profile, doneCount, unitsDone))

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Star size={20} className="text-amber-500" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-stone-900 tracking-tight">Achievements</h1>
            <p className="text-stone-400 text-sm">{unlocked.length} / {ACHIEVEMENTS.length} unlocked</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card-inset p-4 mb-7">
          <div className="flex justify-between text-[13px] mb-2">
            <span className="font-semibold text-stone-700">Overall progress</span>
            <span className="text-stone-400">{unlocked.length}/{ACHIEVEMENTS.length}</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-8">
            <p className="text-[13px] font-bold text-stone-500 uppercase tracking-widest mb-4">
              Unlocked ({unlocked.length})
            </p>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map(a => <Badge key={a.id} a={a} unlocked={true} />)}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <p className="text-[13px] font-bold text-stone-300 uppercase tracking-widest mb-4">
              Locked ({locked.length})
            </p>
            <div className="grid grid-cols-3 gap-3">
              {locked.map(a => <Badge key={a.id} a={a} unlocked={false} />)}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
