import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { OBJECTS, pow10, sci, toSci } from './model'

export default function ScaleOfUniverse() {
  const [tab, setTab] = useState<'zoom' | 'write'>('zoom')
  return (
    <LabFrame labId="scale-of-universe" title="Scale of the Universe" subtitle="From atoms to galaxies: standard form tames huge and tiny numbers." howTo={<p>Zoom: slide from the tiniest to the biggest things and read their sizes in standard form. Write it: turn ordinary numbers into a × 10ⁿ.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['zoom', '🔭 Zoom'], ['write', '✍️ Write it']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'zoom' ? <Zoom /> : <Write />}
    </LabFrame>
  )
}

const plain = (m: number) => (m >= 1 ? m.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : m.toFixed(Math.min(20, -Math.floor(Math.log10(m)) + 2)).replace(/0+$/, ''))

function Zoom() {
  const [i, setI] = useState(5)
  const o = OBJECTS[i]
  const { n } = toSci(o.m)
  const lo = -11
  const hi = 27
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-background p-5 text-center">
        <p className="text-6xl" aria-hidden>{o.emoji}</p>
        <p className="mt-2 font-heading text-xl font-semibold">{o.name}</p>
        <p className="mt-1 font-mono text-2xl">{sci(o.m)} m</p>
      </div>
      <label className="block text-sm">Zoom
        <Slider value={[i]} min={0} max={OBJECTS.length - 1} step={1} onValueChange={([v]) => setI(v)} className="mt-1.5" aria-label="Object" />
      </label>
      <div className="relative h-8 rounded-full bg-gradient-to-r from-sky-200 via-emerald-200 to-violet-300 dark:from-sky-900 dark:via-emerald-900 dark:to-violet-900" aria-hidden>
        {OBJECTS.map((x, k) => (
          <span key={x.name} className={cn('absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm transition', k === i ? 'scale-150' : 'opacity-50')} style={{ left: `${((Math.log10(x.m) - lo) / (hi - lo)) * 100}%` }}>{x.emoji}</span>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="Written out in full" value={`${plain(o.m)} m`} />
        <Readout label="Power of ten" value={`about ${pow10(n)} m`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each step of the power of ten is <b>10 times</b> bigger. The observable universe is about 10³⁷ times wider than a hydrogen atom. Writing all those zeros is impractical; standard form a × 10ⁿ (with 1 ≤ a &lt; 10) keeps it short.</p>
    </div>
  )
}

const WRITE = [384_400_000, 0.00045, 6_020_000, 0.0000075, 149_600_000_000, 0.012, 1_380_000_000, 0.000000001]

function Write() {
  const items = useMemo(() => shuffle(WRITE), [])
  const [k, setK] = useState(0)
  const [a, setA] = useState('')
  const [n, setN] = useState('')
  const [res, setRes] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const x = items[k % items.length]
  const target = toSci(x)
  const check = () => {
    const ok = Math.abs(Number(a) - target.a) < 1e-9 && Number(n.replace(/[−–]/g, '-')) === target.n
    setRes(ok)
    if (ok) { setScore((s) => s + 1); sfx.correct() } else sfx.wrong()
  }
  return (
    <div className="space-y-3">
      <p className="text-center font-mono text-2xl">{plain(x)}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xl">
        <input value={a} onChange={(e) => { setA(e.target.value); setRes(null) }} aria-label="a" placeholder="a" className="w-24 rounded-lg border-2 bg-background px-2 py-1 text-center" />
        <span>× 10</span>
        <input value={n} onChange={(e) => { setN(e.target.value); setRes(null) }} aria-label="exponent n" placeholder="n" className="-mt-4 w-16 rounded-lg border-2 bg-background px-2 py-0.5 text-center text-base" />
        <Button onClick={check}>Check</Button>
      </div>
      {res !== null && (
        <p role="status" className={cn('rounded-xl px-4 py-2 text-center text-sm', res ? 'bg-success-soft' : 'bg-warn-soft')}>
          {res ? '✅ Correct! ' : '❌ Not quite. '}{plain(x)} = <b>{sci(x)}</b>. {target.n < 0 ? `Move the point ${-target.n} places right to get a number between 1 and 10, so n = ${target.n}.` : `Move the point ${target.n} places left to get a number between 1 and 10, so n = ${target.n}.`}
        </p>
      )}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => { setK(k + 1); setA(''); setN(''); setRes(null) }}>Next number →</Button>
        <span className="text-sm text-muted-foreground">✅ {score} correct</span>
      </div>
    </div>
  )
}
