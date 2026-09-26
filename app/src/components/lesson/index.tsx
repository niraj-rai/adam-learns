import katex from 'katex'
import 'katex/contrib/mhchem'
import { AnimatePresence, motion } from 'motion/react'
import { Children, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getLab } from '@/labs/registry'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { criterionName, useRouteSubject, type Criterion } from '@/lib/criteria'

/** Styles for markdown inside not-prose lesson blocks (lists, bold, paragraphs). */
const RICH = '[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_p+p]:mt-2'

// ---------- Lesson loop stage marker ----------

const STAGES = {
  wonder: { emoji: '🤔', label: 'Wonder', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  predict: { emoji: '🔮', label: 'Predict', cls: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200' },
  see: { emoji: '👀', label: 'See', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
  try: { emoji: '🧪', label: 'Try it', cls: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200' },
  explain: { emoji: '💡', label: 'Explain', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
  apply: { emoji: '🌏', label: 'Apply', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
} as const

export function Stage({ kind, title }: { kind: keyof typeof STAGES; title: string }) {
  const s = STAGES[kind]
  return (
    <div className="not-prose mt-10 mb-3 flex items-center gap-3">
      <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide', s.cls)}>
        <span aria-hidden>{s.emoji}</span> {s.label}
      </span>
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
    </div>
  )
}

// ---------- Hook ----------

export function Hook({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="not-prose my-4 flex items-start gap-4 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-5 dark:border-violet-800 dark:bg-violet-950/40">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <div className="font-heading text-xl leading-snug">{children}</div>
    </div>
  )
}

// ---------- Predict first / quick check ----------

type ChoiceProps = {
  question: string
  options: string[]
  /** index of the correct option; omit for open predictions */
  answer?: number
  children?: ReactNode
}

function ChoiceBlock({ question, options, answer, children, variant }: ChoiceProps & { variant: 'predict' | 'check' }) {
  const [picked, setPicked] = useState<number | null>(null)
  const recordPrediction = useProgress((s) => s.recordPrediction)
  const isPredict = variant === 'predict'

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (isPredict) recordPrediction()
    if (answer !== undefined) (i === answer ? sfx.correct : sfx.wrong)()
  }

  return (
    <div
      className={cn(
        'not-prose my-5 rounded-2xl border-2 p-5',
        isPredict ? 'border-fuchsia-300 bg-fuchsia-50/60 dark:border-fuchsia-800 dark:bg-fuchsia-950/30' : 'border-sky-300 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/30',
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{isPredict ? '🔮 Predict first. No wrong answers here!' : '✅ Quick check'}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{question}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((o, i) => {
          const isAnswer = answer !== undefined && i === answer
          const state = picked === null ? 'idle' : isAnswer ? 'right' : picked === i ? 'wrong' : 'dim'
          return (
            <button
              key={o}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={cn(
                'rounded-xl border-2 bg-background px-4 py-3 text-left text-sm transition',
                state === 'idle' && 'hover:border-primary',
                state === 'right' && 'border-success bg-success-soft',
                state === 'wrong' && 'border-destructive/60 bg-destructive/10',
                state === 'dim' && 'opacity-50',
                picked === i && answer === undefined && 'border-primary',
              )}
            >
              {o}
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked !== null && children && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('mt-3 rounded-xl bg-background p-3 text-sm leading-relaxed', RICH)}>
            {isPredict && <p className="mb-1 font-semibold">You predicted: “{options[picked]}”. Now let’s find out!</p>}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const PredictFirst = (p: ChoiceProps) => <ChoiceBlock {...p} variant="predict" />
export const QuickCheck = (p: ChoiceProps) => <ChoiceBlock {...p} variant="check" />

// ---------- Explain ----------

export function ConceptCard({ title, emoji = '💡', children }: { title: string; emoji?: string; children: ReactNode }) {
  return (
    <div className="not-prose my-4 rounded-2xl border bg-card p-5 shadow-sm">
      <p className="flex items-center gap-2 font-heading text-lg font-semibold">
        <span aria-hidden>{emoji}</span> {title}
      </p>
      <div className={cn('mt-2 space-y-2 text-[15px] leading-relaxed', RICH)}>{children}</div>
    </div>
  )
}

export function KeyTerm({ children, def }: { children: ReactNode; def: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="cursor-help font-semibold text-chem underline decoration-dotted underline-offset-4">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">{def}</TooltipContent>
    </Tooltip>
  )
}

export function Compare({ columns }: { columns: { title: string; emoji?: string; points: string[] }[] }) {
  return (
    <div className={cn('not-prose my-5 grid gap-3', columns.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
      {columns.map((c) => (
        <div key={c.title} className="rounded-2xl border bg-card p-4">
          <p className="font-heading text-lg font-semibold">
            {c.emoji} {c.title}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {c.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-chem">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function StepReveal({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children)
  const [shown, setShown] = useState(1)
  return (
    <div className="not-prose my-5 space-y-3">
      {steps.slice(0, shown).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 rounded-xl border bg-card p-4 text-[15px]">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-chem text-sm font-bold text-white">{i + 1}</span>
          <div className={cn('space-y-1', RICH)}>{s}</div>
        </motion.div>
      ))}
      {shown < steps.length && (
        <Button variant="outline" onClick={() => setShown((n) => n + 1)}>
          Next step ({shown}/{steps.length}) →
        </Button>
      )}
    </div>
  )
}

export function Formula({ tex, caption }: { tex: string; caption?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: true }), [tex])
  return (
    <figure className="not-prose my-4 rounded-xl border bg-card px-4 py-3 text-center">
      <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

export function Chem({ children }: { children: string }) {
  const html = useMemo(() => katex.renderToString(`\\ce{${children}}`, { throwOnError: false }), [children])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// ---------- Callouts ----------

function Callout({ emoji, title, tone, children }: { emoji: string; title: string; tone: string; children: ReactNode }) {
  return (
    <aside className={cn('not-prose my-5 rounded-2xl border p-4', tone)}>
      <p className="font-heading font-semibold">
        <span aria-hidden>{emoji}</span> {title}
      </p>
      <div className={cn('mt-1 space-y-2 text-[15px] leading-relaxed', RICH)}>{children}</div>
    </aside>
  )
}

export const DidYouKnow = ({ children }: { children: ReactNode }) => (
  <Callout emoji="✨" title="Did you know?" tone="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
    {children}
  </Callout>
)

export const RealLife = ({ title = 'In real life', children }: { title?: string; children: ReactNode }) => (
  <Callout emoji="🏙️" title={title} tone="border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
    {children}
  </Callout>
)

export function MythFact({ myth, children }: { myth: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="not-prose my-5 overflow-hidden rounded-2xl border-2 border-rose-200 dark:border-rose-900">
      <div className="bg-rose-50 p-4 dark:bg-rose-950/30">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">🚫 Common mix-up</p>
        <p className="mt-1 font-heading text-lg">“{myth}”</p>
        {!open && (
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setOpen(true)}>
            What’s the truth?
          </Button>
        )}
      </div>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-background p-4 text-[15px] leading-relaxed">
          <p className="text-xs font-bold uppercase tracking-wide text-success">✅ Actually…</p>
          <div className={cn('mt-1 space-y-2', RICH)}>{children}</div>
        </motion.div>
      )}
    </div>
  )
}

export function TryAtHome({ title, materials, safety, children }: { title: string; materials: string[]; safety?: string; children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-2xl border-2 border-teal-300 bg-teal-50/60 p-5 dark:border-teal-800 dark:bg-teal-950/30">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">🏠 Try at home</p>
      <p className="font-heading text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm font-semibold">You need:</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {materials.map((m) => (
          <li key={m} className="rounded-full border bg-background px-3 py-1 text-sm">
            {m}
          </li>
        ))}
      </ul>
      <div className={cn('mt-3 space-y-2 text-[15px] leading-relaxed', RICH)}>{children}</div>
      {safety && <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-sm">⚠️ <b>Safety:</b> {safety}</p>}
    </div>
  )
}

// ---------- Board-specific corners ----------

/** IB-style inquiry task, labelled with the MYP criterion it builds. */
export function Inquiry({ criterion, title, children }: { criterion: Criterion; title: string; children: ReactNode }) {
  const subject = useRouteSubject()
  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-ib/40 bg-ib-soft p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-ib">
        🎓 IB MYP · Criterion {criterion}: {criterionName(criterion, subject, true)}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold">{title}</p>
      <div className={cn('mt-2 space-y-2 text-[15px] leading-relaxed', RICH)}>{children}</div>
    </div>
  )
}

/** Where this appears in CBSE/NCERT, plus an exam-style tip. */
export function CbseCorner({ source, children }: { source: string; children: ReactNode }) {
  return (
    <div className="not-prose my-5 rounded-2xl border border-cbse/40 bg-cbse-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-cbse">📘 CBSE / NCERT link · {source}</p>
      <div className={cn('mt-1 space-y-2 text-[15px] leading-relaxed', RICH)}>{children}</div>
    </div>
  )
}

/** Short written reflection saved on this device (IB Criterion D style). */
export function Reflect({ id, prompt }: { id: string; prompt: string }) {
  const key = `reflect:${id}`
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    try {
      setText(localStorage.getItem(key) ?? '')
    } catch {
      /* storage unavailable */
    }
  }, [key])
  return (
    <div className="not-prose my-5 rounded-2xl border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">✍️ Reflect</p>
      <p className="mt-1 font-heading text-lg font-semibold">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
        rows={4}
        placeholder="Write 2–4 sentences. Use a scientific word from this lesson!"
        className="mt-3 w-full rounded-xl border bg-background p-3 text-sm"
        aria-label={prompt}
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          disabled={!text.trim()}
          onClick={() => {
            try {
              localStorage.setItem(key, text)
            } catch {
              /* ignore */
            }
            setSaved(true)
          }}
        >
          Save my answer
        </Button>
        {saved && <span className="text-sm text-success">Saved on this device ✓</span>}
      </div>
    </div>
  )
}

// ---------- Labs inside lessons ----------

export function Lab({ id, ...props }: { id: string } & Record<string, unknown>) {
  const lab = getLab(id)
  if (!lab) return <p className="text-destructive">Unknown lab: {id}</p>
  const C = lab.component
  return (
    <Suspense fallback={<div className="not-prose my-6 grid h-64 animate-pulse place-items-center rounded-2xl border bg-muted text-sm text-muted-foreground">Setting up the lab…</div>}>
      <C {...props} />
    </Suspense>
  )
}

export const lessonComponents = {
  Stage,
  Hook,
  PredictFirst,
  QuickCheck,
  ConceptCard,
  KeyTerm,
  Compare,
  StepReveal,
  Formula,
  Chem,
  DidYouKnow,
  RealLife,
  MythFact,
  TryAtHome,
  Inquiry,
  CbseCorner,
  Reflect,
  Lab,
}
