import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { exteriorEach, interiorEach, interiorSum, PROPS, SHAPES } from './model'

export default function QuadFamily() {
  const [tab, setTab] = useState<'family' | 'polygons'>('family')
  return (
    <LabFrame labId="quad-family" title="Quadrilateral Family" subtitle="Squares, rectangles, rhombuses, kites: who belongs to which family? And the angles of any polygon." howTo={<p>Family: pick a shape to see which properties it has. Polygons: choose the number of sides and split the polygon into triangles to find its angle sum.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['family', '🔷 Quadrilaterals'], ['polygons', '⬡ Polygon angles']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'family' ? <Family /> : <Polygons />}
    </LabFrame>
  )
}

function Family() {
  const [si, setSi] = useState(0)
  const s = SHAPES[si]
  const xs = s.pts.map((p) => p[0])
  const ys = s.pts.map((p) => p[1])
  const k = 150 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  const P = (p: [number, number]) => [30 + (p[0] - Math.min(...xs)) * k, 190 - (p[1] - Math.min(...ys)) * k]
  const pts = s.pts.map(P)
  const also = SHAPES.filter((o) => o.id !== s.id && o.has.every((h, i) => !h || s.has[i])).map((o) => o.name.toLowerCase())
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {SHAPES.map((x, i) => <button key={x.id} type="button" aria-pressed={si === i} onClick={() => setSi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', si === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <svg viewBox="0 0 240 210" className="w-full rounded-2xl border bg-background" role="img" aria-label={`A ${s.name.toLowerCase()} with its diagonals`}>
          <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#6366f1" fillOpacity={0.15} stroke="#6366f1" strokeWidth={2.5} />
          <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[2][0]} y2={pts[2][1]} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" />
          <line x1={pts[1][0]} y1={pts[1][1]} x2={pts[3][0]} y2={pts[3][1]} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" />
        </svg>
        <ul className="space-y-1 text-sm">
          {PROPS.map((p, i) => (
            <li key={p} className={cn('flex items-center gap-2 rounded-lg px-2 py-1', s.has[i] ? 'bg-success-soft' : 'text-muted-foreground')}>
              <span aria-hidden>{s.has[i] ? '✅' : '✖️'}</span>{p}
            </li>
          ))}
        </ul>
      </div>
      <Readout label={`Every ${s.name.toLowerCase()} is also a…`} value={also.length ? also.join(', ') : 'nothing else on this list'} />
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A shape belongs to a family if it has <b>all</b> of that family's properties. So a square is a special rectangle <i>and</i> a special rhombus, and both are special parallelograms. The angles of every quadrilateral add to <b>360°</b> (it splits into two triangles).</p>
    </div>
  )
}

function Polygons() {
  const [n, setN] = useState(6)
  const R = 90
  const pts = Array.from({ length: n }, (_, i) => [120 + R * Math.cos(-Math.PI / 2 + (2 * Math.PI * i) / n), 110 + R * Math.sin(-Math.PI / 2 + (2 * Math.PI * i) / n)])
  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <svg viewBox="0 0 240 220" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Regular polygon with ${n} sides split into ${n - 2} triangles`}>
        {pts.slice(2).map((p, i) => <polygon key={i} points={[pts[0], pts[i + 1], p].map((q) => q.join(',')).join(' ')} fill={['#6366f1', '#f59e0b', '#10b981', '#ec4899'][i % 4]} fillOpacity={0.2} stroke="#94a3b8" />)}
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth={2.5} />
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Number of sides <b>{n}</b><Slider value={[n]} min={3} max={12} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="Number of sides" /></label>
        <div className="grid gap-2 sm:grid-cols-3">
          <Readout label="Interior angle sum" value={`(${n} − 2) × 180° = ${interiorSum(n)}°`} />
          <Readout label="Each angle (regular)" value={`${Math.round(interiorEach(n) * 100) / 100}°`} />
          <Readout label="Each exterior angle" value={`360° ÷ ${n} = ${Math.round(exteriorEach(n) * 100) / 100}°`} />
        </div>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">From one corner, draw diagonals to split the polygon into <b>{n - 2}</b> triangles. Each has 180°, so the angles add to (n − 2) × 180°. Walking all the way round, you turn through 360° in total, so each exterior angle of a regular polygon is 360° ÷ n.</p>
      </div>
    </div>
  )
}
