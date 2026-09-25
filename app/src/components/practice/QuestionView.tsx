import { ArrowDown, ArrowUp, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Question } from '@/content/schema'
import { emptyResponse, grade, isComplete, shuffle, shuffleNotIdentity, type Grade, type Response } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'

export type QuestionResult = { correct: boolean; firstTry: boolean }

const CRITERION_NAMES = { A: 'Knowing', B: 'Inquiring', C: 'Processing', D: 'Reflecting' } as const
const TYPE_HELP: Record<Question['type'], string> = {
  mcq: 'Choose one answer',
  'multi-select': 'Choose all that apply',
  'sort-bins': 'Tap an item, then tap the group it belongs to',
  'match-pairs': 'Tap an item on the left, then its partner on the right',
  'order-steps': 'Use the arrows to put the steps in order',
  'fill-blank': 'Fill in the blanks',
  numeric: 'Type a number',
  'short-answer': 'Write your answer, then mark it against the checklist',
}

/**
 * One practice question with two attempts: a wrong first try shows the hint,
 * a wrong second try shows the worked explanation.
 */
export function QuestionView({ q, onDone }: { q: Question; onDone: (r: QuestionResult) => void }) {
  const steps = useMemo(() => (q.type === 'order-steps' ? shuffleNotIdentity(q.steps) : undefined), [q])
  const [response, setResponse] = useState<Response>(() => emptyResponse(q, steps))
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState<Grade | null>(null)
  const [finished, setFinished] = useState(false)
  const [misconception, setMisconception] = useState<string | null>(null)

  const complete = isComplete(q, response)
  const showHint = attempts === 1 && !finished

  const check = () => {
    const g = grade(q, response)
    const n = attempts + 1
    setAttempts(n)
    setResult(g)
    if (g.correct) {
      sfx.correct()
      setFinished(true)
    } else {
      sfx.wrong()
      // targeted feedback for a known wrong option (MCQ misconceptions)
      setMisconception(q.type === 'mcq' && response.type === 'mcq' && response.choice !== null ? (q.feedback?.[String(response.choice)] ?? null) : null)
      if (n >= 2 || q.type === 'short-answer') setFinished(true)
    }
  }

  const update = (r: Response) => {
    setResponse(r)
    if (!finished) setResult(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" className="border-ib/40 text-ib">
          IB Criterion {q.ibCriterion} · {CRITERION_NAMES[q.ibCriterion]}
        </Badge>
        {q.cbseStyle && (
          <Badge variant="outline" className="border-cbse/40 text-cbse">
            CBSE style
          </Badge>
        )}
        <span className="text-muted-foreground">{'⭐'.repeat(q.difficulty)}</span>
      </div>

      <div>
        <p className="font-heading text-xl leading-snug font-semibold">{q.prompt}</p>
        <p className="mt-1 text-sm text-muted-foreground">{TYPE_HELP[q.type]}</p>
      </div>

      <Answer q={q} response={response} onChange={update} locked={finished} grade={result} />

      {showHint && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 rounded-xl border border-warn/50 bg-warn-soft p-3 text-sm" role="status">
          <Lightbulb className="mt-0.5 size-4 shrink-0" />
          <div>
            <b>Not yet. Have another go!</b> {misconception ?? q.hint ?? 'Read the question again carefully and check each part.'}
            {misconception && q.hint && <span className="mt-1 block">💡 {q.hint}</span>}
          </div>
        </motion.div>
      )}

      {finished && result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={cn('rounded-xl border p-4 text-sm leading-relaxed', result.correct ? 'border-success/50 bg-success-soft' : 'border-destructive/40 bg-destructive/5')}
        >
          <p className="font-heading text-base font-semibold">{result.correct ? (attempts === 1 ? '🎉 Correct, first try!' : '👍 Got it on the second try!') : '📖 Let’s look at the answer'}</p>
          <p className="mt-1">{q.explain}</p>
        </motion.div>
      )}

      <div className="flex gap-2">
        {!finished ? (
          <Button size="lg" onClick={check} disabled={!complete || (result !== null && !result.correct)}>
            {attempts === 0 ? 'Check' : 'Check again'}
          </Button>
        ) : (
          <Button size="lg" autoFocus onClick={() => onDone({ correct: result!.correct, firstTry: result!.correct && attempts === 1 })}>
            Continue →
          </Button>
        )}
      </div>
    </div>
  )
}

function Answer({ q, response, onChange, locked, grade }: { q: Question; response: Response; onChange: (r: Response) => void; locked: boolean; grade: Grade | null }) {
  switch (q.type) {
    case 'mcq':
      return <Mcq q={q} r={response as Extract<Response, { type: 'mcq' }>} onChange={onChange} locked={locked} />
    case 'multi-select':
      return <MultiSelect q={q} r={response as Extract<Response, { type: 'multi-select' }>} onChange={onChange} locked={locked} />
    case 'sort-bins':
      return <SortBins q={q} r={response as Extract<Response, { type: 'sort-bins' }>} onChange={onChange} locked={locked} grade={grade} />
    case 'match-pairs':
      return <MatchPairs q={q} r={response as Extract<Response, { type: 'match-pairs' }>} onChange={onChange} locked={locked} grade={grade} />
    case 'order-steps':
      return <OrderSteps q={q} r={response as Extract<Response, { type: 'order-steps' }>} onChange={onChange} locked={locked} grade={grade} />
    case 'fill-blank':
      return <FillBlank q={q} r={response as Extract<Response, { type: 'fill-blank' }>} onChange={onChange} locked={locked} grade={grade} />
    case 'numeric':
      return <Numeric q={q} r={response as Extract<Response, { type: 'numeric' }>} onChange={onChange} locked={locked} />
    case 'short-answer':
      return <ShortAnswer q={q} r={response as Extract<Response, { type: 'short-answer' }>} onChange={onChange} locked={locked} />
  }
}

type Q<T extends Question['type']> = Extract<Question, { type: T }>
type R<T extends Response['type']> = Extract<Response, { type: T }>

function OptionButton({ selected, state, onClick, children, disabled }: { selected: boolean; state?: 'right' | 'wrong'; onClick: () => void; children: ReactNode; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-xl border-2 bg-background px-4 py-3 text-left text-[15px] transition',
        !disabled && 'hover:border-primary/60',
        selected && 'border-primary bg-primary/5',
        state === 'right' && 'border-success bg-success-soft',
        state === 'wrong' && 'border-destructive/60 bg-destructive/10',
      )}
    >
      {children}
    </button>
  )
}

function Mcq({ q, r, onChange, locked }: { q: Q<'mcq'>; r: R<'mcq'>; onChange: (r: Response) => void; locked: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {q.options.map((o, i) => (
        <OptionButton
          key={o}
          selected={r.choice === i}
          disabled={locked}
          state={locked ? (i === q.answer ? 'right' : r.choice === i ? 'wrong' : undefined) : undefined}
          onClick={() => onChange({ type: 'mcq', choice: i })}
        >
          {o}
          {locked && r.choice === i && i !== q.answer && q.feedback?.[String(i)] && <span className="mt-1 block text-sm text-muted-foreground">{q.feedback[String(i)]}</span>}
        </OptionButton>
      ))}
    </div>
  )
}

function MultiSelect({ q, r, onChange, locked }: { q: Q<'multi-select'>; r: R<'multi-select'>; onChange: (r: Response) => void; locked: boolean }) {
  const toggle = (i: number) => onChange({ type: 'multi-select', choices: r.choices.includes(i) ? r.choices.filter((x) => x !== i) : [...r.choices, i] })
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {q.options.map((o, i) => (
        <OptionButton
          key={o}
          selected={r.choices.includes(i)}
          disabled={locked}
          state={locked ? (q.answer.includes(i) ? 'right' : r.choices.includes(i) ? 'wrong' : undefined) : undefined}
          onClick={() => toggle(i)}
        >
          <span className="mr-2">{r.choices.includes(i) ? '☑️' : '⬜'}</span>
          {o}
        </OptionButton>
      ))}
    </div>
  )
}

function SortBins({ q, r, onChange, locked, grade }: { q: Q<'sort-bins'>; r: R<'sort-bins'>; onChange: (r: Response) => void; locked: boolean; grade: Grade | null }) {
  const [active, setActive] = useState<number | null>(null)
  const order = useMemo(() => shuffle(q.items.map((_, i) => i)), [q])
  const unplaced = order.filter((i) => r.placement[i] === undefined)

  const place = (bin: number) => {
    if (active === null || locked) return
    onChange({ type: 'sort-bins', placement: { ...r.placement, [active]: bin } })
    setActive(null)
  }
  const unplace = (i: number) => {
    if (locked) return
    const next = { ...r.placement }
    delete next[i]
    onChange({ type: 'sort-bins', placement: next })
  }

  const chip = (i: number, inBin: boolean) => {
    const wrong = grade && grade.wrongParts.includes(i)
    return (
      <motion.button
        layout
        key={i}
        type="button"
        disabled={locked && !inBin}
        onClick={() => (inBin ? unplace(i) : setActive(active === i ? null : i))}
        className={cn(
          'rounded-full border-2 bg-background px-3 py-1.5 text-sm',
          active === i && 'border-primary bg-primary/10 ring-2 ring-primary/30',
          inBin && grade && (wrong ? 'border-destructive/60 bg-destructive/10' : 'border-success bg-success-soft'),
        )}
      >
        {q.items[i].label}
        {locked && wrong && <span className="ml-1 text-xs text-muted-foreground">→ {q.bins[q.items[i].bin]}</span>}
      </motion.button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed p-3">
        {unplaced.length === 0 ? <span className="text-sm text-muted-foreground">All sorted! Tap an item in a group to move it back.</span> : unplaced.map((i) => chip(i, false))}
      </div>
      <div className={cn('grid gap-3', q.bins.length === 3 ? 'sm:grid-cols-3' : q.bins.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2')}>
        {q.bins.map((b, bi) => (
          <div
            key={b}
            role="button"
            tabIndex={0}
            onClick={() => place(bi)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && place(bi)}
            className={cn('min-h-28 rounded-2xl border-2 bg-muted/40 p-3 transition', active !== null && 'cursor-pointer border-primary/50 bg-primary/5 hover:bg-primary/10')}
            aria-label={`Group: ${b}`}
          >
            <p className="mb-2 font-heading font-semibold">{b}</p>
            <div className="flex flex-wrap gap-2">{order.filter((i) => r.placement[i] === bi).map((i) => chip(i, true))}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAIR_COLORS = ['bg-sky-200 dark:bg-sky-900', 'bg-amber-200 dark:bg-amber-900', 'bg-emerald-200 dark:bg-emerald-900', 'bg-fuchsia-200 dark:bg-fuchsia-900', 'bg-rose-200 dark:bg-rose-900', 'bg-indigo-200 dark:bg-indigo-900']

function MatchPairs({ q, r, onChange, locked, grade }: { q: Q<'match-pairs'>; r: R<'match-pairs'>; onChange: (r: Response) => void; locked: boolean; grade: Grade | null }) {
  const [activeLeft, setActiveLeft] = useState<number | null>(null)
  const rights = useMemo(() => shuffle(q.pairs.map((p) => p.right)), [q])
  const leftForRight = (right: string) => Object.entries(r.matches).find(([, v]) => v === right)?.[0]

  const pickRight = (right: string) => {
    if (activeLeft === null || locked) return
    const next = { ...r.matches }
    for (const [k, v] of Object.entries(next)) if (v === right) delete next[Number(k)]
    next[activeLeft] = right
    onChange({ type: 'match-pairs', matches: next })
    setActiveLeft(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {q.pairs.map((p, i) => {
          const matched = r.matches[i] !== undefined
          const wrong = grade?.wrongParts.includes(i)
          return (
            <button
              key={p.left}
              type="button"
              disabled={locked}
              onClick={() => setActiveLeft(activeLeft === i ? null : i)}
              className={cn(
                'w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm',
                matched ? PAIR_COLORS[i % PAIR_COLORS.length] : 'bg-background',
                activeLeft === i && 'border-primary ring-2 ring-primary/30',
                locked && grade && (wrong ? 'border-destructive' : 'border-success'),
              )}
            >
              {p.left}
              {locked && wrong && <span className="mt-1 block text-xs text-muted-foreground">✓ {p.right}</span>}
            </button>
          )
        })}
      </div>
      <div className="space-y-2">
        {rights.map((right) => {
          const li = leftForRight(right)
          return (
            <button
              key={right}
              type="button"
              disabled={locked || activeLeft === null}
              onClick={() => pickRight(right)}
              className={cn('w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm disabled:cursor-default', li !== undefined ? PAIR_COLORS[Number(li) % PAIR_COLORS.length] : 'bg-background', activeLeft !== null && !locked && 'hover:border-primary')}
            >
              {right}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OrderSteps({ q, r, onChange, locked, grade }: { q: Q<'order-steps'>; r: R<'order-steps'>; onChange: (r: Response) => void; locked: boolean; grade: Grade | null }) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= r.order.length) return
    const next = [...r.order]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange({ type: 'order-steps', order: next })
  }
  return (
    <ol className="space-y-2">
      {r.order.map((s, i) => (
        <motion.li
          layout
          key={s}
          className={cn('flex items-center gap-3 rounded-xl border-2 bg-background px-3 py-2 text-[15px]', grade && (grade.wrongParts.includes(i) ? 'border-destructive/60' : 'border-success'))}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">{i + 1}</span>
          <span className="flex-1">
            {s}
            {locked && grade?.wrongParts.includes(i) && <span className="block text-xs text-muted-foreground">Correct step {i + 1}: {q.steps[i]}</span>}
          </span>
          {!locked && (
            <span className="flex gap-1">
              <Button size="icon-sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move “${s}” up`}>
                <ArrowUp />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === r.order.length - 1} aria-label={`Move “${s}” down`}>
                <ArrowDown />
              </Button>
            </span>
          )}
        </motion.li>
      ))}
    </ol>
  )
}

function FillBlank({ q, r, onChange, locked, grade }: { q: Q<'fill-blank'>; r: R<'fill-blank'>; onChange: (r: Response) => void; locked: boolean; grade: Grade | null }) {
  const parts = q.text.split('___')
  const set = (i: number, v: string) => {
    const values = [...r.values]
    values[i] = v
    onChange({ type: 'fill-blank', values })
  }
  return (
    <div className="space-y-3">
      <p className="text-[17px] leading-[2.4]">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 &&
              (q.wordBank ? (
                <select
                  value={r.values[i]}
                  disabled={locked}
                  onChange={(e) => set(i, e.target.value)}
                  className={cn('mx-1 rounded-lg border-2 bg-background px-2 py-1 text-[15px]', grade && (grade.wrongParts.includes(i) ? 'border-destructive' : 'border-success'))}
                  aria-label={`Blank ${i + 1}`}
                >
                  <option value="">choose…</option>
                  {q.wordBank.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={r.values[i]}
                  disabled={locked}
                  onChange={(e) => set(i, e.target.value)}
                  className={cn('mx-1 w-32 rounded-lg border-2 bg-background px-2 py-1 text-[15px]', grade && (grade.wrongParts.includes(i) ? 'border-destructive' : 'border-success'))}
                  aria-label={`Blank ${i + 1}`}
                />
              ))}
          </span>
        ))}
      </p>
      {locked && grade && grade.wrongParts.length > 0 && <p className="text-sm text-muted-foreground">Answers: {q.blanks.map((b) => b[0]).join(' · ')}</p>}
    </div>
  )
}

function Numeric({ q, r, onChange, locked }: { q: Q<'numeric'>; r: R<'numeric'>; onChange: (r: Response) => void; locked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input
        inputMode="decimal"
        value={r.value}
        disabled={locked}
        onChange={(e) => onChange({ type: 'numeric', value: e.target.value })}
        className="h-11 w-40 rounded-xl border-2 bg-background px-3 text-lg tabular-nums"
        aria-label="Your answer"
        placeholder="0"
      />
      {q.unit && <span className="text-lg text-muted-foreground">{q.unit}</span>}
    </div>
  )
}

function ShortAnswer({ q, r, onChange, locked }: { q: Q<'short-answer'>; r: R<'short-answer'>; onChange: (r: Response) => void; locked: boolean }) {
  return (
    <div className="space-y-3">
      <textarea
        value={r.text}
        disabled={r.revealed}
        onChange={(e) => onChange({ ...r, text: e.target.value })}
        rows={4}
        className="w-full rounded-xl border-2 bg-background p-3 text-[15px]"
        placeholder="Explain in your own words…"
        aria-label="Your answer"
      />
      {!r.revealed ? (
        <Button variant="outline" disabled={r.text.trim().length < 10} onClick={() => onChange({ ...r, revealed: true })}>
          Compare with a model answer
        </Button>
      ) : (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Model answer</p>
            <p className="mt-1 text-[15px]">{q.modelAnswer}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tick what your answer included</p>
            <div className="mt-2 space-y-1.5">
              {q.rubric.map((item, i) => (
                <label key={item} className="flex items-start gap-2 text-[15px]">
                  <input
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={r.checks[i]}
                    disabled={locked}
                    onChange={(e) => {
                      const checks = [...r.checks]
                      checks[i] = e.target.checked
                      onChange({ ...r, checks })
                    }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
