import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid } from '../_shared/CoordGrid'
import { fmt, solve2 } from '../_shared/coord'

type Eq = { a: number; b: number; c: number }
const PRESETS: { name: string; emoji: string; e1: Eq; e2: Eq; story: string }[] = [
  { name: 'Mangoes and bananas', emoji: '🥭', e1: { a: 1, b: 1, c: 7 }, e2: { a: 2, b: 1, c: 10 }, story: 'x mangoes and y bunches of bananas: 7 items in all, and (2 × mangoes) + bananas = 10. (Money in ₹10s.)' },
  { name: 'Ages', emoji: '🎂', e1: { a: 1, b: -1, c: 3 }, e2: { a: 1, b: 1, c: 7 }, story: 'Riya (x) is 3 years older than her brother (y); together their ages add to 7 (in 2-year steps).' },
  { name: 'Parallel', emoji: '🛤️', e1: { a: 1, b: -1, c: 1 }, e2: { a: 2, b: -2, c: -4 }, story: 'Two railway tracks that never meet: same slope, different intercepts.' },
  { name: 'Same line', emoji: '🔁', e1: { a: 1, b: 2, c: 4 }, e2: { a: 2, b: 4, c: 8 }, story: 'The second equation is just the first multiplied by 2: every point works.' },
]

function EqControls({ e, set, color, n }: { e: Eq; set: (e: Eq) => void; color: string; n: number }) {
  const S = (k: keyof Eq, min: number, max: number) => <label className="text-xs">{k} = <b>{e[k]}</b><Slider value={[e[k]]} min={min} max={max} step={1} onValueChange={([v]) => set({ ...e, [k]: v })} className="mt-1" aria-label={`equation ${n} ${k}`} /></label>
  return (
    <div className="rounded-xl border-2 p-2" style={{ borderColor: color }}>
      <p className="font-mono text-sm font-semibold" style={{ color }}>{fmt(e.a)}x {e.b < 0 ? '−' : '+'} {Math.abs(e.b)}y = {fmt(e.c)}</p>
      <div className="mt-1 grid grid-cols-3 gap-2">{S('a', -5, 5)}{S('b', -5, 5)}{S('c', -10, 10)}</div>
    </div>
  )
}

export default function LineCrossing() {
  const [e1, setE1] = useState<Eq>(PRESETS[0].e1)
  const [e2, setE2] = useState<Eq>(PRESETS[0].e2)
  const [pi, setPi] = useState<number | null>(0)
  const r = solve2(e1.a, e1.b, e1.c, e2.a, e2.b, e2.c)
  const draw = (e: Eq, color: string, X: (x: number) => number, Y: (y: number) => number) => {
    if (e.a === 0 && e.b === 0) return null
    if (e.b === 0) return <line x1={X(e.c / e.a)} y1={Y(-8)} x2={X(e.c / e.a)} y2={Y(8)} stroke={color} strokeWidth={3} />
    const y = (x: number) => (e.c - e.a * x) / e.b
    return <line x1={X(-8)} y1={Y(y(-8))} x2={X(8)} y2={Y(y(8))} stroke={color} strokeWidth={3} strokeOpacity={0.85} />
  }
  return (
    <LabFrame labId="line-crossing" title="Where Lines Cross" subtitle="A pair of linear equations in two variables: the solution is where their graphs meet." howTo={<p>Pick a story or set the coefficients of ax + by = c for each line. See the graphs, the solution, and the algebra.</p>}>
      <div className="flex flex-wrap gap-1">{PRESETS.map((p, i) => <button key={p.name} type="button" aria-pressed={pi === i} onClick={() => { setE1(p.e1); setE2(p.e2); setPi(i) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.emoji} {p.name}</button>)}</div>
      {pi !== null && <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">{PRESETS[pi].story}</p>}
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label="Two straight lines" points={r.kind === 'unique' && Math.abs(r.x) <= 8 && Math.abs(r.y) <= 8 && Number.isInteger(r.x) && Number.isInteger(r.y) ? [{ p: { x: r.x, y: r.y }, color: '#10b981', label: '' }] : []}>
          {(X, Y) => <>{draw(e1, '#2563eb', X, Y)}{draw(e2, '#dc2626', X, Y)}{r.kind === 'unique' && !(Number.isInteger(r.x) && Number.isInteger(r.y)) && <circle cx={X(r.x)} cy={Y(r.y)} r={6} fill="#10b981" />}</>}
        </CoordGrid>
        <div className="space-y-2">
          <EqControls e={e1} set={(e) => { setE1(e); setPi(null) }} color="#2563eb" n={1} />
          <EqControls e={e2} set={(e) => { setE2(e); setPi(null) }} color="#dc2626" n={2} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Solutions" value={r.kind === 'unique' ? 'Exactly one' : r.kind === 'none' ? 'None (parallel)' : 'Infinitely many'} />
            <Readout label="Solution" value={r.kind === 'unique' ? `x = ${fmt(r.x)}, y = ${fmt(r.y)}` : '—'} />
          </div>
          {r.kind === 'unique' && e1.b !== 0 && (
            <p className="rounded-xl bg-muted/50 px-3 py-2 font-mono text-xs">Substitution: from (1), y = ({fmt(e1.c)} − {fmt(e1.a)}x) ÷ {fmt(e1.b)}. Put this into (2) and solve: x = {fmt(r.x)}, then y = {fmt(r.y)}. Check in both equations ✔</p>
          )}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Every point on a line is a solution of its equation. Two lines can <b>cross once</b> (one solution: consistent), be <b>parallel</b> (no solution: inconsistent) or be the <b>same line</b> (infinitely many solutions). You can solve by graphing, by <b>substitution</b> or by <b>elimination</b>.</p>
    </LabFrame>
  )
}
