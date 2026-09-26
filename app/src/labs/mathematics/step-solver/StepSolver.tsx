import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { show } from '../_shared/fraction'
import { isSolved, moves, PROBLEMS, solutionOf, text, type Eq } from './model'

export default function StepSolver() {
  const [pi, setPi] = useState(0)
  const [hist, setHist] = useState<{ eq: Eq; by?: string }[]>([{ eq: PROBLEMS[0].eq }])
  const cur = hist.at(-1)!.eq
  const solved = isSolved(cur)
  const load = (i: number) => { setPi(i); setHist([{ eq: PROBLEMS[i].eq }]) }
  const ans = show(solutionOf(PROBLEMS[pi].eq)).replace('-', '−')
  return (
    <LabFrame labId="step-solver" title="Step Solver" subtitle="Solve equations one balanced step at a time, including brackets, negatives and fractions." howTo={<p>Pick an equation. At each step choose a move; every move does the same thing to both sides. Aim to get x on its own in as few steps as possible.</p>}>
      <div className="flex flex-wrap gap-1">
        {PROBLEMS.map((p, i) => (
          <button key={i} type="button" aria-pressed={pi === i} onClick={() => load(i)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', pi === i ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{p.text}</button>
        ))}
      </div>
      <ol className="mt-4 space-y-1 rounded-2xl border bg-background p-4">
        {hist.map((h, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-4">
            <span className={cn('font-mono text-xl', i === hist.length - 1 && 'font-bold')}>{i === 0 ? PROBLEMS[pi].text : text(h.eq)}</span>
            {h.by && <span className="text-xs text-muted-foreground">({h.by.toLowerCase()})</span>}
          </li>
        ))}
      </ol>
      {!solved ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {moves(cur).map((m) => (
            <Button key={m.label} variant="outline" onClick={() => { const next = m.apply(cur); setHist((h) => [...h, { eq: next, by: m.label }]); if (isSolved(next)) sfx.win(); else sfx.click() }}>{m.label}</Button>
          ))}
          {hist.length > 1 && <Button variant="ghost" onClick={() => setHist((h) => h.slice(0, -1))}>Undo</Button>}
        </div>
      ) : (
        <div role="status" className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">
          ✅ <b>x = {ans}</b> in {hist.length - 1} step{hist.length > 2 ? 's' : ''}. Always <b>check</b>: substitute x = {ans} into {PROBLEMS[pi].text}. Both sides should come out equal.
          <Button className="ml-2" size="sm" variant="outline" onClick={() => load((pi + 1) % PROBLEMS.length)}>Next equation →</Button>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A good plan: <b>1.</b> Expand brackets. <b>2.</b> Clear fractions by multiplying. <b>3.</b> Collect x terms on one side. <b>4.</b> Collect numbers on the other. <b>5.</b> Divide by the number in front of x.</p>
    </LabFrame>
  )
}
