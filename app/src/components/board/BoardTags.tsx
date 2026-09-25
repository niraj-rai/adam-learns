import type { Topic } from '@/content/loader'
import { cn } from '@/lib/utils'
import { useSettings } from '@/stores/settings'

/** IB tag always shown first; CBSE mapping shown alongside unless the user hides it. */
export function BoardTags({ topic, className, compact = false }: { topic: Topic; className?: string; compact?: boolean }) {
  const boardView = useSettings((s) => s.boardView)
  const { ib, cbse } = topic.grades
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 text-xs', className)}>
      <span className="rounded-full bg-ib-soft px-2 py-0.5 font-semibold text-ib" title={ib.note}>
        IB {ib.programme} {ib.year}
      </span>
      {boardView === 'ib+cbse' &&
        cbse.map((c) => (
          <span key={`${c.class}-${c.chapter}`} className="rounded-full bg-cbse-soft px-2 py-0.5 font-semibold text-cbse" title={c.chapter}>
            CBSE {c.class}
            {!compact && c.chapter ? ` · ${c.chapter}` : ''}
            {!c.verified && !compact ? ' ⚠︎' : ''}
          </span>
        ))}
    </div>
  )
}

export function ComplexityStars({ value }: { value: number }) {
  return (
    <span className="text-xs tracking-tight" aria-label={`Complexity ${value} of 5`} title={`Complexity ${value} of 5`}>
      {'★'.repeat(value)}
      <span className="opacity-25">{'★'.repeat(5 - value)}</span>
    </span>
  )
}
