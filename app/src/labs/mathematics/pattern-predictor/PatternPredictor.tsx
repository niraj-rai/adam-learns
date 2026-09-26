import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { apSum, apTerm, gpSum, gpTerm, hanoi } from '../_shared/sequences'

type Kind = 'ap' | 'gp' | 'hanoi'

export default function PatternPredictor() {
  const [kind, setKind] = useState<Kind>('ap')
  const [a, setA] = useState(3)
  const [d, setD] = useState(4)
  const [r, setR] = useState(2)
  const [n, setN] = useState(10)
  const [discs, setDiscs] = useState(3)
  const terms = Array.from({ length: Math.min(n, 12) }, (_, i) => (kind === 'ap' ? apTerm(a, d, i + 1) : gpTerm(a, r, i + 1)))
  const nth = kind === 'ap' ? apTerm(a, d, n) : gpTerm(a, r, n)
  const sum = kind === 'ap' ? apSum(a, d, n) : gpSum(a, r, n)
  const maxAbs = Math.max(1, ...terms.map((t) => Math.abs(t)))
  return (
    <LabFrame labId="pattern-predictor" title="Pattern Predictor" subtitle="Find the rule behind a sequence, and you can predict any term without listing them all." howTo={<p>Choose an arithmetic sequence (add the same number) or a geometric one (multiply by the same number). Set the first term and the rule, and jump to any term. Then try the Tower of Hanoi.</p>}>
      <div className="inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['ap', '➕ Arithmetic (AP)'], ['gp', '✖️ Geometric (GP)'], ['hanoi', '🗼 Tower of Hanoi']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cn('rounded-md px-3 py-1', kind === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      {kind !== 'hanoi' ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">First term a = <b>{a}</b><Slider value={[a]} min={-10} max={10} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="first term" /></label>
            {kind === 'ap' ? <label className="text-sm">Common difference d = <b>{d}</b><Slider value={[d]} min={-6} max={6} step={1} onValueChange={([v]) => setD(v)} className="mt-1" aria-label="common difference" /></label> : <label className="text-sm">Common ratio r = <b>{r}</b><Slider value={[r]} min={-3} max={3} step={0.5} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="common ratio" /></label>}
            <label className="text-sm">Term number n = <b>{n}</b><Slider value={[n]} min={1} max={30} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="term number" /></label>
          </div>
          <div className="mt-3 flex h-36 items-end gap-1 overflow-x-auto rounded-2xl border p-2" aria-label="bar chart of the terms">
            {terms.map((t, i) => <div key={i} className="flex min-w-7 flex-1 flex-col items-center justify-end"><span className="text-[10px] tabular-nums">{fmt(t, 1)}</span><div className={cn('w-full rounded-t', t >= 0 ? 'bg-chem' : 'bg-destructive/60')} style={{ height: `${(Math.abs(t) / maxAbs) * 100}px` }} /><span className="text-[10px] text-muted-foreground">{i + 1}</span></div>)}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Readout label="Rule for the nth term" value={kind === 'ap' ? `aₙ = ${a} + (n − 1) × ${d}` : `aₙ = ${a} × ${r}ⁿ⁻¹`} />
            <Readout label={`Term ${n}`} value={fmt(nth, 2)} />
            <Readout label={`Sum of first ${n} terms`} value={fmt(sum, 2)} />
          </div>
          <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{kind === 'ap' ? <>An <b>arithmetic progression</b> grows by adding d each time: its graph is a straight line. The sum is n/2 × (first + last). Young Gauss used this trick to add 1 to 100 in seconds: 50 × 101 = 5050.</> : <>A <b>geometric progression</b> multiplies by r each time: it grows (or shrinks) explosively. That's how compound interest, bacteria and viral videos grow. Legend says the inventor of chess asked for 1 grain of rice on the first square, 2 on the next, 4 on the next…</>}</p>
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block text-sm">Discs <b>{discs}</b><Slider value={[discs]} min={1} max={10} step={1} onValueChange={([v]) => setDiscs(v)} className="mt-1" aria-label="discs" /></label>
          <div className="flex h-28 items-end justify-center gap-2 rounded-2xl border p-2">{Array.from({ length: discs }, (_, i) => <div key={i} className="rounded bg-chem" style={{ width: `${20 + (discs - i) * 12}px`, height: '8px' }} />).reverse()}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Fewest moves" value={`2^${discs} − 1 = ${hanoi(discs)}`} />
            <Readout label="Recursive rule" value={`M(n) = 2 × M(n − 1) + 1`} />
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">To move n discs: move n − 1 discs out of the way, move the biggest disc, then move the n − 1 discs back on top. That gives the <b>recursive</b> rule M(n) = 2M(n − 1) + 1 and the <b>explicit</b> rule M(n) = 2ⁿ − 1. With 64 discs, one move a second would take about 585 billion years!</p>
        </div>
      )}
    </LabFrame>
  )
}
