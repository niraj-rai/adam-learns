import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { frac, show } from '../_shared/fraction'
import { count, EVENTS, TWO_DICE } from './model'

export default function SampleSpace() {
  const [ei, setEi] = useState(0)
  const [comp, setComp] = useState(false)
  const e = EVENTS[ei]
  const test = comp ? (o: [number, number]) => !e.test(o) : e.test
  const k = count(test)
  return (
    <LabFrame labId="sample-space" title="Sample Space" subtitle="List every possible outcome, then count the ones you want. Probability = favourable ÷ total." howTo={<p>Pick an event. The grid shows all 36 equally likely outcomes of rolling two dice; the highlighted ones are favourable. Switch to ‘NOT’ to see the complement.</p>}>
      <div className="flex flex-wrap gap-1">
        {EVENTS.map((x, i) => <button key={x.id} type="button" aria-pressed={ei === i} onClick={() => setEi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ei === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={comp} onChange={(ev) => setComp(ev.target.checked)} className="size-4" /> NOT this event (the complement)</label>
      <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="inline-grid grid-cols-7 gap-1 text-center text-xs" role="grid" aria-label="Outcomes of two dice">
          <span className="font-semibold">+</span>
          {[1, 2, 3, 4, 5, 6].map((b) => <span key={b} className="font-semibold"><span className="hidden sm:inline">🎲</span>{b}</span>)}
          {[1, 2, 3, 4, 5, 6].map((a) => (
            <div key={a} className="contents">
              <span className="self-center font-semibold"><span className="hidden sm:inline">🎲</span>{a}</span>
              {TWO_DICE.filter(([x]) => x === a).map((o) => (
                <span key={o.join()} className={cn('grid size-8 place-items-center sm:size-10 rounded-md border font-mono text-sm', test(o) ? 'border-success bg-success-soft font-bold' : 'text-muted-foreground')}>{o[0] + o[1]}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Readout label="Favourable outcomes" value={`${k}`} />
          <Readout label="Total outcomes" value="36" />
          <Readout label={`P(${comp ? 'not ' : ''}${e.name.toLowerCase()})`} value={`${k}/36${show(frac(k, 36)) !== `${k}/36` ? ` = ${show(frac(k, 36))}` : ''} ≈ ${(k / 36).toFixed(3)}`} />
          <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">The two dice make 6 × 6 = 36 outcomes, all equally likely. P(event) + P(not event) = 1, so P(not) = 1 − P(event). Here: {count(e.test)}/36 + {36 - count(e.test)}/36 = 1.</p>
        </div>
      </div>
    </LabFrame>
  )
}
