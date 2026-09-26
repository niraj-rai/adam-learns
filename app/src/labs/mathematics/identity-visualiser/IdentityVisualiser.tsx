import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { nearRound, squareParts } from './model'

export default function IdentityVisualiser() {
  const [tab, setTab] = useState<'square' | 'diff' | 'mental'>('square')
  return (
    <LabFrame labId="identity-visualiser" title="Identity Visualiser" subtitle="See why (a + b)² = a² + 2ab + b² and a² − b² = (a + b)(a − b), then use them for mental maths." howTo={<p>Square: change a and b to see the four pieces of (a + b)². Difference: cut a small square from a big one and rearrange. Mental maths: square numbers like 103 or 98 in your head.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['square', '🟦 (a + b)²'], ['diff', '✂️ a² − b²'], ['mental', '🧠 Mental maths']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'square' ? <Square /> : tab === 'diff' ? <Diff /> : <Mental />}
    </LabFrame>
  )
}

function Sliders({ a, b, setA, setB, maxB }: { a: number; b: number; setA: (v: number) => void; setB: (v: number) => void; maxB: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">a = <b>{a}</b><Slider value={[a]} min={2} max={10} step={1} onValueChange={([v]) => { setA(v); if (b > Math.min(maxB, v - 1)) setB(Math.max(1, Math.min(maxB, v - 1))) }} className="mt-1.5" aria-label="a" /></label>
      <label className="text-sm">b = <b>{b}</b><Slider value={[b]} min={1} max={Math.min(maxB, a - 1)} step={1} onValueChange={([v]) => setB(v)} className="mt-1.5" aria-label="b" /></label>
    </div>
  )
}

function Square() {
  const [a, setA] = useState(6)
  const [b, setB] = useState(3)
  const s = 240 / (a + b)
  const [A2, AB2, B2] = squareParts(a, b)
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <svg viewBox="0 0 270 270" className="w-full max-w-[270px] rounded-2xl border bg-background" role="img" aria-label={`Square of side ${a} + ${b} split into a², two ab rectangles and b²`}>
        <rect x={15} y={15} width={a * s} height={a * s} fill="#7dd3fc" stroke="#334155" />
        <rect x={15 + a * s} y={15} width={b * s} height={a * s} fill="#86efac" stroke="#334155" />
        <rect x={15} y={15 + a * s} width={a * s} height={b * s} fill="#86efac" stroke="#334155" />
        <rect x={15 + a * s} y={15 + a * s} width={b * s} height={b * s} fill="#fde68a" stroke="#334155" />
        <text x={15 + (a * s) / 2} y={15 + (a * s) / 2 + 5} textAnchor="middle" fontSize={16} fontWeight={700}>a² = {A2}</text>
        <text x={15 + a * s + (b * s) / 2} y={15 + (a * s) / 2 + 5} textAnchor="middle" fontSize={12} fontWeight={700}>ab</text>
        <text x={15 + (a * s) / 2} y={15 + a * s + (b * s) / 2 + 5} textAnchor="middle" fontSize={12} fontWeight={700}>ab</text>
        <text x={15 + a * s + (b * s) / 2} y={15 + a * s + (b * s) / 2 + 5} textAnchor="middle" fontSize={12} fontWeight={700}>b²</text>
      </svg>
      <div className="space-y-3">
        <Sliders a={a} b={b} setA={setA} setB={setB} maxB={6} />
        <div className="grid gap-2">
          <Readout label={`(${a} + ${b})²`} value={`${a + b}² = ${(a + b) ** 2}`} />
          <Readout label="a² + 2ab + b²" value={`${A2} + ${AB2} + ${B2} = ${A2 + AB2 + B2}`} />
        </div>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The big square has <b>four</b> pieces, not two: a², b², and <b>two</b> ab rectangles. That's why (a + b)² is not a² + b². Similarly, (a − b)² = a² − 2ab + b².</p>
      </div>
    </div>
  )
}

function Diff() {
  const [a, setA] = useState(8)
  const [b, setB] = useState(3)
  const s = 200 / a
  return (
    <div className="space-y-3">
      <Sliders a={a} b={b} setA={setA} setB={setB} maxB={7} />
      <div className="grid gap-3 sm:grid-cols-2">
        <svg viewBox="0 0 230 230" className="w-full rounded-2xl border bg-background" role="img" aria-label={`a² with a b² corner removed`}>
          <rect x={15} y={15} width={a * s} height={(a - b) * s} fill="#7dd3fc" stroke="#334155" />
          <rect x={15} y={15 + (a - b) * s} width={(a - b) * s} height={b * s} fill="#86efac" stroke="#334155" />
          <rect x={15 + (a - b) * s} y={15 + (a - b) * s} width={b * s} height={b * s} fill="none" stroke="#dc2626" strokeDasharray="4 3" />
          <text x={15 + (a - b) * s + (b * s) / 2} y={15 + (a - b) * s + (b * s) / 2 + 4} textAnchor="middle" fontSize={11} fill="#dc2626">b² cut</text>
          <text x={115} y={226} textAnchor="middle" fontSize={12} fill="currentColor">a² − b²</text>
        </svg>
        <svg viewBox="0 0 330 230" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Rearranged into a rectangle (a + b) by (a − b)`}>
          <rect x={15} y={15} width={a * s} height={(a - b) * s} fill="#7dd3fc" stroke="#334155" />
          <rect x={15 + a * s} y={15} width={b * s} height={(a - b) * s} fill="#86efac" stroke="#334155" />
          <text x={15 + ((a + b) * s) / 2} y={15 + (a - b) * s + 18} textAnchor="middle" fontSize={12} fill="currentColor">(a + b) × (a − b)</text>
        </svg>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="a² − b²" value={`${a * a} − ${b * b} = ${a * a - b * b}`} />
        <Readout label="(a + b)(a − b)" value={`${a + b} × ${a - b} = ${(a + b) * (a - b)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Cut the green strip off the bottom, turn it, and stick it on the side: the L-shape becomes a rectangle (a + b) long and (a − b) wide. Same area, so <b>a² − b² = (a + b)(a − b)</b>.</p>
    </div>
  )
}

const PRODUCTS = [[98, 102], [47, 53], [199, 201], [96, 104], [35, 45]]

function Mental() {
  const [n, setN] = useState(103)
  const [r, d] = nearRound(n)
  const [p1, p2, p3] = squareParts(r, d)
  const [pi, setPi] = useState(0)
  const [x, y] = PRODUCTS[pi]
  const m = (x + y) / 2
  const h = (y - x) / 2
  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-2xl border bg-background p-4">
        <p className="font-semibold">Square it in your head</p>
        <Slider value={[n]} min={11} max={199} step={1} onValueChange={([v]) => setN(v)} aria-label="Number to square" />
        <p className="font-mono text-lg">{n}² = ({r} {d < 0 ? '−' : '+'} {Math.abs(d)})² = {r}² {d < 0 ? '−' : '+'} 2×{r}×{Math.abs(d)} + {Math.abs(d)}² = {p1.toLocaleString('en-IN')} {p2 < 0 ? '−' : '+'} {Math.abs(p2).toLocaleString('en-IN')} + {p3} = <b>{(n * n).toLocaleString('en-IN')}</b></p>
      </div>
      <div className="space-y-2 rounded-2xl border bg-background p-4">
        <p className="font-semibold">Multiply with a² − b²</p>
        <div className="flex flex-wrap gap-1">
          {PRODUCTS.map(([u, v], i) => <button key={i} type="button" aria-pressed={pi === i} onClick={() => setPi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', pi === i ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{u} × {v}</button>)}
        </div>
        <p className="font-mono text-lg">{x} × {y} = ({m} − {h})({m} + {h}) = {m}² − {h}² = {(m * m).toLocaleString('en-IN')} − {h * h} = <b>{(x * y).toLocaleString('en-IN')}</b></p>
      </div>
    </div>
  )
}
