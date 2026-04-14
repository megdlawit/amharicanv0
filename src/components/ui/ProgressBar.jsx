// ── ProgressBar ─────────────────────────────────────────────
import clsx from 'clsx'

export function ProgressBar({ value, max, className, color = 'bg-brand-500', height = 'h-2.5' }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100))
  return (
    <div className={clsx('w-full bg-stone-200 rounded-full overflow-hidden', height, className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-700 ease-smooth', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
export default ProgressBar
