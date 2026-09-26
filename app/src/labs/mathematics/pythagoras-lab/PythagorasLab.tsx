import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { hyp, isRight, triples } from './model'

export default function PythagorasLab() {
  const [tab, setTab] = useState<'squares' | 'check' | 'ladder'>('squares')
  return (
    <LabFrame labId="pythagoras-lab" title="Baudhayana–Pythagoras Lab" subtitle="In a right-angled triangle, the square on the longest side equals the other two squares together." howTo={<p>Squares: change the two shorter sides and compare the areas of the squares. Right or not: test three lengths. Ladder: use the theorem to solve a real problem.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['squares', '🟦 Squares on sides'], ['check', '📐 Right or not?'], ['ladder', '🪜 Ladder problem']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'squares' ? <Squares /> : tab === 'check' ? <Check /> : <Ladder />}
    </LabFrame>
  )
}

function Squares() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const c = hyp(a, b)
  const u = 20
  // right angle at O; leg a upward, leg b rightward
  const O: Pt = [0, 0]
  const A: Pt = [0, -a * u]
  const B: Pt = [b * u, 0]
  const sqA = square(A, O, B)
  const sqB = square(O, B, A)
  const sqC = square(B, A, O)
  const all = [...sqA, ...sqB, ...sqC]
  const minX = Math.min(...all.map((p) => p[0])) - 10
  const minY = Math.min(...all.map((p) => p[1])) - 10
  const w = Math.max(...all.map((p) => p[0])) - minX + 10
  const h = Math.max(...all.map((p) => p[1])) - minY + 10
  const poly = (ps: Pt[]) => ps.map((v) => v.join(',')).join(' ')
  const mid = (ps: Pt[]): Pt => [ps.reduce((s, p) => s + p[0], 0) / 4, ps.reduce((s, p) => s + p[1], 0) / 4]
  const labels: [Pt[], string, string][] = [[sqA, `${a * a}`, '#4338ca'], [sqB, `${b * b}`, '#b45309'], [sqC, `${Math.round(c * c * 100) / 100}`, '#047857']]
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_230px]">
      <svg viewBox={`${minX} ${minY} ${w} ${h}`} className="max-h-80 w-full rounded-2xl border bg-background" role="img" aria-label={`Right triangle with legs ${a} and ${b}; squares of area ${a * a}, ${b * b} and ${Math.round(c * c * 100) / 100}`}>
        <polygon points={poly(sqA)} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" />
        <polygon points={poly(sqB)} fill="#f59e0b" fillOpacity={0.25} stroke="#f59e0b" />
        <polygon points={poly(sqC)} fill="#10b981" fillOpacity={0.25} stroke="#10b981" />
        <polygon points={poly([O, A, B])} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeWidth={2.5} />
        <rect x={O[0]} y={O[1] - 10} width={10} height={10} fill="none" stroke="currentColor" />
        {labels.map(([ps, txt, col]) => { const m = mid(ps); return <text key={txt + col} x={m[0]} y={m[1] + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={col}>{txt}</text> })}
      </svg>
      <div className="space-y-2">
        <label className="block text-sm">Leg a = <b>{a}</b><Slider value={[a]} min={1} max={12} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="Leg a" /></label>
        <label className="block text-sm">Leg b = <b>{b}</b><Slider value={[b]} min={1} max={12} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="Leg b" /></label>
        <Readout label="a² + b²" value={`${a * a} + ${b * b} = ${a * a + b * b}`} />
        <Readout label="Hypotenuse c" value={`√${a * a + b * b} = ${Number.isInteger(c) ? c : c.toFixed(3)}`} />
        {Number.isInteger(c) && <p className="rounded-lg bg-success-soft px-2 py-1 text-sm">🎉 {a}, {b}, {c} is a whole-number triple!</p>}
      </div>
    </div>
  )
}

type Pt = [number, number]
/** The square on side p→q, built on the side away from the third corner `away`. */
function square(p: Pt, q: Pt, away: Pt): Pt[] {
  const dx = q[0] - p[0]
  const dy = q[1] - p[1]
  let n: Pt = [-dy, dx]
  if (n[0] * (away[0] - p[0]) + n[1] * (away[1] - p[1]) > 0) n = [dy, -dx]
  return [p, q, [q[0] + n[0], q[1] + n[1]], [p[0] + n[0], p[1] + n[1]]]
}

function Check() {
  const [s, setS] = useState([5, 12, 13])
  const ok = isRight(s[0], s[1], s[2])
  const sorted = [...s].sort((p, q) => p - q)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {s.map((v, i) => <label key={i} className="text-sm">Side {i + 1} = <b>{v}</b><Slider value={[v]} min={1} max={30} step={1} onValueChange={([x]) => setS((q) => q.map((y, k) => (k === i ? x : y)))} className="mt-1" aria-label={`Side ${i + 1}`} /></label>)}
      </div>
      <Readout label="Test with the longest side" value={`${sorted[0]}² + ${sorted[1]}² = ${sorted[0] ** 2 + sorted[1] ** 2}; ${sorted[2]}² = ${sorted[2] ** 2}`} />
      <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', ok ? 'bg-success-soft' : 'bg-warn-soft')}>{ok ? '✅ Equal, so the triangle has a right angle (opposite the longest side). This is the converse of the theorem.' : `❌ Not equal, so there is no right angle. ${sorted[0] ** 2 + sorted[1] ** 2 > sorted[2] ** 2 ? 'The sum is bigger: all angles are acute.' : 'The sum is smaller: the largest angle is obtuse.'}`}</p>
      <p className="text-sm text-muted-foreground">Triples to try: {triples(30).slice(0, 8).map((t) => t.join('-')).join(', ')}</p>
    </div>
  )
}

function Ladder() {
  const [L, setL] = useState(13)
  const [d, setD] = useState(5)
  const h = Math.sqrt(Math.max(0, L * L - d * d))
  const k = 16
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_230px]">
      <svg viewBox="0 0 300 260" className="w-full rounded-2xl border bg-background" role="img" aria-label={`A ${L} m ladder, foot ${d} m from the wall, reaches ${h.toFixed(2)} m high`}>
        <rect x={250} y={10} width={20} height={240} fill="#cbd5e1" />
        <line x1={0} y1={240} x2={300} y2={240} stroke="currentColor" strokeWidth={2} />
        <line x1={250 - d * k} y1={240} x2={250} y2={240 - h * k} stroke="#b45309" strokeWidth={6} strokeLinecap="round" />
        <text x={250 - (d * k) / 2} y={255} textAnchor="middle" fontSize={11} fill="currentColor">{d} m</text>
        <text x={240} y={240 - (h * k) / 2} textAnchor="end" fontSize={11} fill="currentColor">{h.toFixed(2)} m</text>
      </svg>
      <div className="space-y-2">
        <label className="block text-sm">Ladder length <b>{L} m</b><Slider value={[L]} min={5} max={14} step={1} onValueChange={([v]) => { setL(v); if (d >= v) setD(v - 1) }} className="mt-1" aria-label="Ladder length" /></label>
        <label className="block text-sm">Foot from wall <b>{d} m</b><Slider value={[d]} min={1} max={L - 1} step={1} onValueChange={([v]) => setD(v)} className="mt-1" aria-label="Distance from wall" /></label>
        <Readout label="Height reached" value={`√(${L}² − ${d}²) = √${L * L - d * d} = ${Number.isInteger(h) ? h : h.toFixed(2)} m`} />
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">The ladder is the <b>hypotenuse</b>. To find a shorter side, subtract: h² = L² − d².</p>
      </div>
    </div>
  )
}
