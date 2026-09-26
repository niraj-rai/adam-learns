import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { frac, show, sub, value, type Frac } from '../_shared/fraction'
import { expand, midpoint, primeFactors, terminates } from './model'

export default function RationalZoom() {
  const [tab, setTab] = useState<'decimal' | 'between'>('decimal')
  return (
    <LabFrame labId="rational-zoom" title="Rational Zoom" subtitle="Which fractions make decimals that stop, and which repeat forever? And how many numbers hide between two fractions?" howTo={<p>Decimal detective: choose a fraction and see its decimal by long division. Always another: keep zooming in to find a fraction between two others.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['decimal', '🔎 Decimal detective'], ['between', '🔭 Always another']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'decimal' ? <Decimal /> : <Between />}
    </LabFrame>
  )
}

function Decimal() {
  const [p, setP] = useState(1)
  const [q, setQ] = useState(7)
  const f = frac(p, q)
  const { int, digits, repeatStart } = expand(f.n, f.d)
  const ends = terminates(f.d)
  const pf = primeFactors(f.d)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Numerator <b>{p}</b><Slider value={[p]} min={1} max={30} step={1} onValueChange={([v]) => setP(v)} className="mt-1.5" aria-label="Numerator" /></label>
        <label className="text-sm">Denominator <b>{q}</b><Slider value={[q]} min={2} max={20} step={1} onValueChange={([v]) => setQ(v)} className="mt-1.5" aria-label="Denominator" /></label>
      </div>
      <div className="rounded-2xl border bg-background p-5 text-center">
        <p className="text-sm text-muted-foreground">{p}/{q}{show(f) !== `${p}/${q}` && <> = {show(f)}</>} =</p>
        <p className="mt-1 break-all font-mono text-3xl" aria-label={`decimal ${int}.${digits.join('')}${repeatStart >= 0 ? ' repeating' : ''}`}>
          {int}{digits.length > 0 && '.'}
          {digits.map((d, i) => (
            <span key={i} className={cn(repeatStart >= 0 && i >= repeatStart && 'text-chem underline decoration-2 underline-offset-8')}>{d}</span>
          ))}
          {repeatStart >= 0 && <span className="text-muted-foreground">…</span>}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="Type" value={ends ? 'Terminating (stops)' : `Recurring: ${digits.length - repeatStart} digit${digits.length - repeatStart > 1 ? 's' : ''} repeat`} />
        <Readout label="Denominator in lowest terms" value={f.d === 1 ? '1' : pf.length === 1 ? `${f.d} (prime)` : `${f.d} = ${pf.join(' × ')}`} />
      </div>
      <p className={cn('rounded-xl px-4 py-2 text-sm', ends ? 'bg-success-soft' : 'bg-chem-soft')}>
        {ends
          ? <>The denominator's only prime factors are <b>2s and 5s</b>, the factors of 10. So {show(f)} can be written over 10, 100, 1000… and the decimal <b>stops</b>.</>
          : <>The denominator has a prime factor other than 2 or 5 ({[...new Set(pf.filter((x) => x !== 2 && x !== 5))].join(', ')}), so it never divides a power of 10. In long division the remainders must eventually repeat, so the digits <b>repeat forever</b> (underlined).</>}
      </p>
    </div>
  )
}

function Between() {
  const START: [Frac, Frac] = [frac(1, 3), frac(1, 2)]
  const [lo] = useState<Frac>(START[0])
  const [hi, setHi] = useState<Frac>(START[1])
  const [found, setFound] = useState<Frac[]>([])
  const W = 600
  const x = (v: number) => 20 + ((v - value(lo)) / (value(hi) - value(lo))) * (W - 40)
  const zoom = () => {
    const m = midpoint(lo, hi)
    setFound((f) => [...f, m])
    // zoom into the left half next time, so the gap keeps shrinking
    setHi(m)
  }
  const reset = () => { setHi(START[1]); setFound([]) }
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 110`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Number line from ${show(lo)} to ${show(hi)}`}>
        <line x1={10} y1={55} x2={W - 10} y2={55} stroke="currentColor" strokeWidth={2} />
        {[lo, hi].map((f, i) => (
          <g key={i}><circle cx={x(value(f))} cy={55} r={6} fill="#6366f1" /><text x={x(value(f))} y={85} textAnchor="middle" fontSize={13} fill="currentColor" fontWeight={700}>{show(f)}</text></g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-2">
        <Button onClick={zoom} disabled={found.length >= 12}>🔭 Find one in between and zoom in</Button>
        <Button variant="outline" onClick={reset}>Start again</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="Fractions found" value={found.length ? found.map(show).join(', ') : '—'} />
        <Readout label="Gap now" value={`${show(sub(hi, lo))} ≈ ${value(sub(hi, lo)).toPrecision(2)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The <b>average</b> of two fractions always lies between them: (a + b) ÷ 2. However close two rational numbers are, you can always find another one in between, so there are <b>infinitely many</b> rational numbers between any two. Integers aren't like that: there's no integer between 3 and 4!</p>
    </div>
  )
}
