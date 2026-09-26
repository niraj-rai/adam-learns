import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { primeFactors } from '../_shared/number'
import { bracket, refine, simplifyRoot } from './model'

const PAIR_NUMBERS = [36, 144, 196, 324, 576, 1764, 72, 50, 200, 1000]

export default function RootFinder() {
  const [tab, setTab] = useState<'estimate' | 'pairs' | 'refine'>('estimate')
  return (
    <LabFrame labId="root-finder" title="Root Finder" subtitle="Three ways to find a square root: squeeze it, pair it, refine it." howTo={<p>Squeeze: trap √n between two perfect squares, then guess its decimal. Pair: group prime factors in pairs. Refine: use the ancient “guess, divide, average” method.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['estimate', '🗜️ Squeeze'], ['pairs', '👯 Pair primes'], ['refine', '🎯 Refine']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'estimate' ? <Estimate /> : tab === 'pairs' ? <Pairs /> : <Refine />}
    </LabFrame>
  )
}

function Estimate() {
  const [n, setN] = useState(50)
  const { lo, hi } = bracket(n)
  const [g, setG] = useState(7.0)
  const [show, setShow] = useState(false)
  const W = 560
  const x = (v: number) => 30 + ((v - lo * lo) / Math.max(1, hi * hi - lo * lo)) * (W - 60)
  const exact = lo === hi
  const diff = g * g - n
  return (
    <div className="space-y-3">
      <label className="block text-sm">Number <b>{n}</b>
        <Slider value={[n]} min={2} max={400} step={1} onValueChange={([v]) => { setN(v); const b = bracket(v); setG(b.lo); setShow(false) }} className="mt-1.5" aria-label="Number" />
      </label>
      {exact ? (
        <p className="rounded-xl bg-success-soft px-4 py-3 text-center text-lg">{n} is a perfect square: √{n} = <b>{lo}</b></p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} 90`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${n} lies between ${lo * lo} and ${hi * hi}`}>
            <line x1={20} y1={40} x2={W - 20} y2={40} stroke="currentColor" strokeWidth={2} />
            {[lo * lo, hi * hi].map((v) => (
              <g key={v}><line x1={x(v)} y1={30} x2={x(v)} y2={50} stroke="currentColor" strokeWidth={2} /><text x={x(v)} y={70} textAnchor="middle" fontSize={13} fill="currentColor">{v} = {Math.sqrt(v)}²</text></g>
            ))}
            <circle cx={x(n)} cy={40} r={7} fill="#6366f1" />
            <text x={x(n)} y={22} textAnchor="middle" fontSize={13} fontWeight={700} fill="#6366f1">{n}</text>
          </svg>
          <p className="text-center">{lo * lo} &lt; {n} &lt; {hi * hi}, so <b>{lo} &lt; √{n} &lt; {hi}</b></p>
          <label className="block text-sm">Your guess for √{n}: <b>{g.toFixed(1)}</b>
            <Slider value={[g]} min={lo} max={hi} step={0.1} onValueChange={([v]) => setG(v)} className="mt-1.5" aria-label="Guess" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Guess squared" value={`${g.toFixed(1)}² = ${(g * g).toFixed(2)}`} />
            <Readout label="Verdict" value={Math.abs(diff) < 0.5 ? 'Very close! 🎯' : diff > 0 ? 'Too big ↓' : 'Too small ↑'} />
          </div>
          <Button variant="outline" onClick={() => setShow(true)}>Reveal √{n}</Button>
          {show && <p className="text-sm">√{n} ≈ <b>{Math.sqrt(n).toFixed(4)}</b>. It never ends or repeats: √{n} is <b>irrational</b>.</p>}
        </>
      )}
    </div>
  )
}

function Pairs() {
  const [n, setN] = useState(324)
  const ps = primeFactors(n)
  const { outside, inside } = simplifyRoot(n)
  const groups: number[][] = []
  for (let i = 0; i < ps.length; ) {
    if (ps[i] === ps[i + 1]) { groups.push([ps[i], ps[i + 1]]); i += 2 } else { groups.push([ps[i]]); i += 1 }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {PAIR_NUMBERS.map((v) => (
          <button key={v} type="button" aria-pressed={n === v} onClick={() => setN(v)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', n === v ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{v}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-4 font-mono text-lg">
        <span>{n} =</span>
        {groups.map((g, i) => (
          <span key={i} className={cn('rounded-lg border-2 px-2 py-0.5', g.length === 2 ? 'border-success bg-success-soft' : 'border-warn bg-warn-soft')}>{g.join(' × ')}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="One from each pair" value={groups.filter((g) => g.length === 2).map((g) => g[0]).join(' × ') || '—'} />
        <Readout label={`√${n}`} value={inside === 1 ? `${outside}` : outside === 1 ? `√${inside} (no pairs)` : `${outside}√${inside} ≈ ${Math.sqrt(n).toFixed(3)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {inside === 1
          ? <>Every prime has a partner, so {n} is a <b>perfect square</b>: take one prime from each pair and multiply: √{n} = {outside}.</>
          : <>The unpaired prime{primeFactors(inside).length > 1 ? 's' : ''} ({primeFactors(inside).join(', ')}) left over mean {n} is <b>not</b> a perfect square. Multiply {n} by {inside} to make every prime paired: {n} × {inside} = {n * inside} = {outside * inside}².</>}
      </p>
    </div>
  )
}

function Refine() {
  const [n, setN] = useState(2)
  const [g0, setG0] = useState(1)
  const steps = refine(n, g0, 4)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Find √<b>{n}</b><Slider value={[n]} min={2} max={200} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Number" /></label>
        <label className="text-sm">First guess <b>{g0}</b><Slider value={[g0]} min={1} max={20} step={1} onValueChange={([v]) => setG0(v)} className="mt-1.5" aria-label="First guess" /></label>
      </div>
      <table className="w-full rounded-2xl border bg-background text-sm">
        <thead><tr className="border-b text-left"><th className="p-2">Step</th><th className="p-2">Guess g</th><th className="p-2">{n} ÷ g</th><th className="p-2">Average (new guess)</th></tr></thead>
        <tbody className="font-mono">
          {steps.slice(0, -1).map((g, i) => (
            <tr key={i} className="border-b last:border-0"><td className="p-2">{i + 1}</td><td className="p-2">{g.toFixed(6)}</td><td className="p-2">{(n / g).toFixed(6)}</td><td className="p-2 font-bold">{steps[i + 1].toFixed(6)}</td></tr>
          ))}
        </tbody>
      </table>
      <Readout label={`Check: last guess squared`} value={`${steps.at(-1)!.toFixed(6)}² = ${(steps.at(-1)! ** 2).toFixed(6)}`} />
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">If g is too small, {n} ÷ g is too big (and vice versa), so their <b>average</b> is a better guess. The number of correct digits roughly doubles each step. This idea was used in ancient Mesopotamia, and the Indian Śulba Sūtras gave √2 ≈ 1.4142156, correct to 5 decimal places.</p>
    </div>
  )
}
