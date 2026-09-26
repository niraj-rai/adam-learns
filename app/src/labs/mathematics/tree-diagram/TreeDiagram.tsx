import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { show, value } from '../_shared/fraction'
import { EXPERIMENTS, eventProbability, outcomes } from './model'

export default function TreeDiagram() {
  const [ei, setEi] = useState(0)
  const [evi, setEvi] = useState(0)
  const [trials, setTrials] = useState(0)
  const [hits, setHits] = useState(0)
  const e = EXPERIMENTS[ei]
  const ev = e.events[evi]
  const P = eventProbability(e, ev.test)
  const outs = outcomes(e)
  const sim = (n: number) => {
    let h = 0
    for (let i = 0; i < n; i++) {
      const pick = (bs: { label: string; p: { n: number; d: number } }[]) => { let r = Math.random(); for (const b of bs) { r -= value(b.p); if (r < 0) return b.label } return bs.at(-1)!.label }
      const a = pick(e.first)
      const b = pick(e.second(a))
      if (ev.test(a, b)) h++
    }
    setTrials((t) => t + n)
    setHits((x) => x + h)
  }
  const reset = () => { setTrials(0); setHits(0) }
  const Y1 = [70, 190]
  return (
    <LabFrame labId="tree-diagram" title="Tree Diagrams" subtitle="Multiply along the branches, add the outcomes you want. Then test the theory by simulating thousands of trials." howTo={<p>Choose an experiment and an event. Read the probability from the tree, then run simulations to see the experimental probability get closer to it.</p>}>
      <div className="flex flex-wrap gap-1">{EXPERIMENTS.map((x, i) => <button key={x.id} type="button" aria-pressed={ei === i} onClick={() => { setEi(i); setEvi(0); reset() }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ei === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}</div>
      <div className="mt-2 flex flex-wrap gap-1">{e.events.map((x, i) => <button key={x.name} type="button" aria-pressed={evi === i} onClick={() => { setEvi(i); reset() }} className={cn('rounded-full border px-2.5 py-0.5 text-xs', evi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}</div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 320 260" className="w-full rounded-2xl border bg-background" role="img" aria-label="Tree diagram">
          <circle cx={20} cy={130} r={4} fill="currentColor" />
          {e.first.map((f, i) => (
            <g key={f.label}>
              <line x1={20} y1={130} x2={120} y2={Y1[i]} stroke="currentColor" strokeOpacity={0.6} />
              <text x={65} y={(130 + Y1[i]) / 2 - 6} textAnchor="middle" fontSize={11} fill="#6366f1">{show(f.p)}</text>
              <text x={126} y={Y1[i] + 4} fontSize={13} fontWeight={700} fill="currentColor">{f.label}</text>
              {e.second(f.label).map((s, j) => {
                const y2 = Y1[i] - 30 + j * 60
                const hit = ev.test(f.label, s.label)
                return (
                  <g key={s.label}>
                    <line x1={140} y1={Y1[i]} x2={220} y2={y2} stroke={hit ? '#10b981' : 'currentColor'} strokeOpacity={hit ? 1 : 0.5} strokeWidth={hit ? 2.5 : 1} />
                    <text x={180} y={(Y1[i] + y2) / 2 - 5} textAnchor="middle" fontSize={10} fill="#6366f1">{show(s.p)}</text>
                    <text x={226} y={y2 + 4} fontSize={12} fontWeight={700} fill={hit ? '#10b981' : 'currentColor'}>{f.label}{s.label}</text>
                    <text x={256} y={y2 + 4} fontSize={11} fill={hit ? '#10b981' : 'currentColor'}>{show(outs.find((o) => o.a === f.label && o.b === s.label)!.p)}</text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label={`P(${ev.name.toLowerCase()})`} value={`${show(P)} ≈ ${value(P).toFixed(3)}`} />
            <Readout label="Experimental" value={trials ? `${hits}/${trials} ≈ ${(hits / trials).toFixed(3)}` : '—'} />
          </div>
          <div className="flex flex-wrap gap-2">
            {[10, 100, 1000].map((n) => <Button key={n} variant="outline" size="sm" onClick={() => sim(n)}>Run {n}</Button>)}
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-muted"><div className="h-full bg-chem" style={{ width: `${trials ? (hits / trials) * 100 : 0}%` }} /></div>
          <div className="relative h-2"><div className="absolute top-0 h-3 w-0.5 bg-destructive" style={{ left: `${value(P) * 100}%` }} /></div>
          <p className="text-xs text-muted-foreground">The red mark shows the theoretical probability. The more trials you run, the closer the bar usually gets.</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Theoretical probability</b> comes from reasoning about equally likely outcomes; <b>experimental (empirical) probability</b> = number of times it happened ÷ number of trials. Without replacement, the second branch changes because there is one fewer marble in the bag.</p>
    </LabFrame>
  )
}
