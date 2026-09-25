import { FlaskConical, Info } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'

type LabFrameProps = {
  labId: string
  title: string
  subtitle?: string
  howTo?: ReactNode
  children: ReactNode
  className?: string
}

/** Shared chrome for every interactive lab: header, "how to use" toggle, and XP on first visit. */
export function LabFrame({ labId, title, subtitle, howTo, children, className }: LabFrameProps) {
  const recordLab = useProgress((s) => s.recordLab)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    // count the lab as explored once the student has spent a few seconds in it
    const t = setTimeout(() => recordLab(labId), 4000)
    return () => clearTimeout(t)
  }, [labId, recordLab])

  return (
    <section
      className={cn(
        'not-prose my-6 overflow-hidden rounded-2xl border-2 border-chem/30 bg-card shadow-sm',
        className,
      )}
      aria-label={`${title} lab`}
    >
      <header className="flex items-center gap-3 border-b bg-chem-soft px-4 py-3">
        <div className="grid size-9 place-items-center rounded-xl bg-chem text-white">
          <FlaskConical className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-chem">Interactive lab</p>
          <h3 className="truncate font-heading text-lg leading-tight font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {howTo && (
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-background"
            aria-expanded={showHelp}
          >
            <Info className="size-4" /> How to use
          </button>
        )}
      </header>
      {showHelp && howTo && <div className="border-b bg-muted/40 px-4 py-3 text-sm">{howTo}</div>}
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Readout({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-background px-3 py-2', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-heading text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
