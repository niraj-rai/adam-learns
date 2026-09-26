import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { PROBLEMS } from './model'

export default function WordProblems() {
  const [i, setI] = useState(0)
  const p = PROBLEMS[i]
  const opts = useMemo(() => shuffle(p.options.map((o, k) => ({ o, ok: k === p.answer }))), [p])
  const [picked, setPicked] = useState<string | null>(null)
  const [val, setVal] = useState('')
  const [solved, setSolved] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const pickedOk = picked !== null && opts.find((x) => x.o === picked)?.ok
  const reset = (k: number) => { setI(k); setPicked(null); setVal(''); setSolved(null) }
  const check = () => {
    const v = Number(val.replace(/[₹,\s]/g, ''))
    const ok = v === p.value
    setSolved(ok)
    if (ok) { sfx.correct(); setScore((s) => s + 1) } else sfx.wrong()
  }
  return (
    <LabFrame labId="word-problems" title="Story to Equation" subtitle="Turn a story into an equation, solve it, then check the answer makes sense." howTo={<p>Read the story. Step 1: choose the equation that matches it. Step 2: solve it and type the answer.</p>}>
      <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
        <span className="text-4xl" aria-hidden>{p.emoji}</span>
        <div>
          <p className="text-[15px]">{p.story} <b>{p.ask}</b></p>
          <p className="mt-1 text-sm text-muted-foreground">Let {p.letter}.</p>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold">Step 1: Which equation matches the story?</p>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {opts.map(({ o, ok }) => (
          <button key={o} type="button" onClick={() => { setPicked(o); if (ok) sfx.correct(); else sfx.wrong() }} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left font-mono', picked === o && (ok ? 'border-success bg-success-soft' : 'border-destructive/60 bg-destructive/10'))}>{o}</button>
        ))}
      </div>
      {picked && !pickedOk && <p className="mt-2 text-sm text-destructive">Not quite. Read the story again: what adds up, and to what?</p>}
      {pickedOk && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold">Step 2: Solve it. {p.ask}</p>
          <div className="flex flex-wrap items-center gap-2">
            <input value={val} onChange={(e) => { setVal(e.target.value); setSolved(null) }} onKeyDown={(e) => e.key === 'Enter' && check()} aria-label="Your answer" className="w-32 rounded-lg border-2 bg-background px-3 py-1.5 font-mono" />
            <span className="text-sm text-muted-foreground">{p.unit}</span>
            <Button onClick={check}>Check</Button>
          </div>
          {solved !== null && (
            <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', solved ? 'bg-success-soft' : 'bg-warn-soft')}>
              {solved ? <>✅ Correct: {p.value} {p.unit}. Does it make sense in the story? Check it: {p.letter.split(' ')[0]} = {p.value} makes the equation true.</> : <>❌ Try again. Substitute your answer into the equation: are both sides equal?</>}
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => reset((i + 1) % PROBLEMS.length)}>Next story →</Button>
        <span className="text-sm text-muted-foreground">Story {i + 1} / {PROBLEMS.length} · ✅ {score} solved</span>
      </div>
    </LabFrame>
  )
}
