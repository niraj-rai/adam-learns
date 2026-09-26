import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { CASES } from './model'

const BASE: [number, number][] = [[0, 0], [70, 0], [25, 50]]
const tri = (pts: [number, number][], dx: number, dy: number, k = 1, flip = false) =>
  pts.map(([x, y]) => `${dx + (flip ? 70 - x : x) * k},${dy - y * k}`).join(' ')

function Picture({ code, reveal }: { code: string; reveal: boolean }) {
  if (!reveal) return <svg viewBox="0 0 260 90" className="w-full max-w-xs" aria-hidden><polygon points={tri(BASE, 20, 80)} fill="#6366f133" stroke="#6366f1" strokeWidth={2} /><text x={170} y={50} fontSize={24} fill="currentColor">?</text></svg>
  if (code === 'AAA') return <svg viewBox="0 0 260 90" className="w-full max-w-xs" role="img" aria-label="Same angles, different sizes"><polygon points={tri(BASE, 15, 80, 0.7)} fill="#6366f133" stroke="#6366f1" strokeWidth={2} /><polygon points={tri(BASE, 110, 85, 1.35)} fill="#f59e0b33" stroke="#f59e0b" strokeWidth={2} /></svg>
  if (code === 'SSA') return <svg viewBox="0 0 260 90" className="w-full max-w-xs" role="img" aria-label="Two different triangles from the same information"><polygon points="15,80 95,80 60,25" fill="#6366f133" stroke="#6366f1" strokeWidth={2} /><polygon points="140,80 220,80 175,40" fill="#f59e0b33" stroke="#f59e0b" strokeWidth={2} /></svg>
  return <svg viewBox="0 0 260 90" className="w-full max-w-xs" role="img" aria-label="Two identical triangles, one flipped"><polygon points={tri(BASE, 20, 80)} fill="#6366f133" stroke="#6366f1" strokeWidth={2} /><polygon points={tri(BASE, 150, 80, 1, true)} fill="#10b98133" stroke="#10b981" strokeWidth={2} /></svg>
}

export default function CongruenceChecker() {
  const [round, setRound] = useState(0)
  const cases = useMemo(() => shuffle(CASES), [round])
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const done = i >= cases.length
  const c = cases[i]
  const choose = (v: boolean) => {
    if (pick !== null) return
    setPick(v)
    if (v === c.ok) { setScore((s) => s + 1); sfx.correct() } else sfx.wrong()
  }
  return (
    <LabFrame labId="congruence-checker" title="Geometric Twins" subtitle="Which facts are enough to guarantee two triangles are identical (congruent)?" howTo={<p>For each case, decide: if two triangles share these measurements, must they be congruent? Then see the picture and the reason.</p>}>
      {done ? (
        <div className="rounded-2xl bg-success-soft p-5 text-center">
          <p className="font-heading text-xl font-semibold">{score} / {cases.length} correct</p>
          <p className="mt-2 text-sm">The five congruence tests are <b>SSS, SAS, ASA (or AAS) and RHS</b>. AAA gives the same shape but not the same size; SSA can give two different triangles.</p>
          <Button className="mt-3" variant="outline" onClick={() => { setRound((r) => r + 1); setI(0); setPick(null); setScore(0) }}>Play again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Case {i + 1} / {cases.length}</p>
            <p className="font-heading text-lg font-semibold">{c.given}</p>
            <p className="font-mono text-sm">{c.example}</p>
          </div>
          <Picture code={c.code} reveal={pick !== null} />
          <div className="grid gap-2 sm:grid-cols-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button" disabled={pick !== null} onClick={() => choose(v)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left', pick !== null && v === c.ok && 'border-success bg-success-soft', pick === v && v !== c.ok && 'border-destructive/60 bg-destructive/10')}>
                {v ? '✅ Always congruent' : '🤔 Not guaranteed'}
              </button>
            ))}
          </div>
          {pick !== null && (
            <div role="status" className={cn('rounded-xl px-4 py-2 text-sm', pick === c.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <b>{c.code}</b>: {c.why}
              <div><Button className="mt-2" size="sm" autoFocus onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 < cases.length ? 'Next case →' : 'Finish'}</Button></div>
            </div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
