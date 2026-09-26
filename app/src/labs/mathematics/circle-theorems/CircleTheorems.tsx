import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { angleAt } from '../_shared/geometry'

type Mode = 'centre' | 'segment' | 'cyclic' | 'chord'
const MODES: { m: Mode; label: string; rule: string }[] = [
  { m: 'centre', label: 'Angle at the centre', rule: 'The angle an arc makes at the centre is double the angle it makes at any point on the rest of the circle.' },
  { m: 'segment', label: 'Same segment', rule: 'Angles in the same segment of a circle are equal.' },
  { m: 'cyclic', label: 'Cyclic quadrilateral', rule: 'Opposite angles of a cyclic quadrilateral add up to 180°.' },
  { m: 'chord', label: 'Chord bisector', rule: 'The perpendicular from the centre to a chord bisects the chord (and equal chords are equally far from the centre).' },
]
const C = { x: 160, y: 150 }
const R = 110
const on = (deg: number) => ({ x: C.x + R * Math.cos((deg * Math.PI) / 180), y: C.y - R * Math.sin((deg * Math.PI) / 180) })

export default function CircleTheorems() {
  const [mode, setMode] = useState<Mode>('centre')
  const [ang, setAng] = useState<Record<string, number>>({ A: 200, B: 340, P: 90, Q: 130 })
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<string | null>(null)
  const pts = Object.fromEntries(Object.entries(ang).map(([k, v]) => [k, on(v)])) as Record<string, { x: number; y: number }>
  const move = (e: React.PointerEvent) => {
    if (!drag.current || !svg.current) return
    const r = svg.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 320 - C.x
    const y = C.y - ((e.clientY - r.top) / r.height) * 300
    setAng((a) => ({ ...a, [drag.current!]: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360 }))
  }
  const { A, B, P, Q } = pts
  const O = C
  const aob = angleAt(A, O, B)
  // reflex centre angle if P lies on the minor arc side
  const apb = angleAt(A, P, B)
  const aqb = angleAt(A, Q, B)
  const centreAngle = Math.abs(apb * 2 - aob) < 1 ? aob : 360 - aob
  const foot = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }
  const used = mode === 'centre' ? ['A', 'B', 'P'] : mode === 'chord' ? ['A', 'B'] : ['A', 'B', 'P', 'Q']
  const d = (u: { x: number; y: number }, v: { x: number; y: number }) => Math.hypot(u.x - v.x, u.y - v.y) / 20
  // cyclic quadrilateral: take the four points in order around the circle
  const quad = ['A', 'P', 'B', 'Q'].sort((m, n) => ang[m] - ang[n])
  const qa = quad.map((k, i) => angleAt(pts[quad[(i + 3) % 4]], pts[k], pts[quad[(i + 1) % 4]]))
  return (
    <LabFrame labId="circle-theorems" title="Circle Theorems" subtitle="Drag the points around the circle: the angle facts stay true however you move them." howTo={<p>Choose a theorem, then drag the coloured points along the circle and watch the measurements.</p>}>
      <div className="flex flex-wrap gap-1">{MODES.map((x) => <button key={x.m} type="button" aria-pressed={mode === x.m} onClick={() => setMode(x.m)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', mode === x.m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.label}</button>)}</div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg ref={svg} viewBox="0 0 320 300" className="w-full touch-none rounded-2xl border bg-background select-none" role="img" aria-label={MODES.find((x) => x.m === mode)!.rule} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerLeave={() => { drag.current = null }}>
          <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="currentColor" strokeWidth={2} />
          <circle cx={O.x} cy={O.y} r={3} fill="currentColor" /><text x={O.x + 5} y={O.y + 14} fontSize={11} fill="currentColor">O</text>
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#64748b" strokeWidth={2} />
          {mode === 'centre' && <><path d={`M${A.x},${A.y} L${O.x},${O.y} L${B.x},${B.y}`} fill="none" stroke="#6366f1" strokeWidth={2.5} /><path d={`M${A.x},${A.y} L${P.x},${P.y} L${B.x},${B.y}`} fill="none" stroke="#dc2626" strokeWidth={2.5} /></>}
          {mode === 'segment' && <><path d={`M${A.x},${A.y} L${P.x},${P.y} L${B.x},${B.y}`} fill="none" stroke="#dc2626" strokeWidth={2.5} /><path d={`M${A.x},${A.y} L${Q.x},${Q.y} L${B.x},${B.y}`} fill="none" stroke="#10b981" strokeWidth={2.5} /></>}
          {mode === 'cyclic' && <polygon points={quad.map((k) => `${pts[k].x},${pts[k].y}`).join(' ')} fill="#6366f1" fillOpacity={0.12} stroke="#6366f1" strokeWidth={2.5} />}
          {mode === 'chord' && <><line x1={O.x} y1={O.y} x2={foot.x} y2={foot.y} stroke="#dc2626" strokeWidth={2.5} /><circle cx={foot.x} cy={foot.y} r={4} fill="#dc2626" /><text x={foot.x + 6} y={foot.y - 6} fontSize={11} fill="#dc2626">M</text></>}
          {used.map((k) => (
            <g key={k} className="cursor-grab" onPointerDown={(e) => { drag.current = k; try { svg.current?.setPointerCapture(e.pointerId) } catch { /* synthetic events */ } }}>
              <circle cx={pts[k].x} cy={pts[k].y} r={14} fill="transparent" />
              <circle cx={pts[k].x} cy={pts[k].y} r={7} fill={{ A: '#2563eb', B: '#2563eb', P: '#dc2626', Q: '#10b981' }[k]} stroke="white" strokeWidth={2} />
              <text x={pts[k].x + (pts[k].x > C.x ? 10 : -18)} y={pts[k].y + (pts[k].y > C.y ? 16 : -8)} fontSize={12} fontWeight={700} fill="currentColor">{k}</text>
            </g>
          ))}
        </svg>
        <div className="space-y-2">
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">📜 {MODES.find((x) => x.m === mode)!.rule}</p>
          {mode === 'centre' && <div className="grid gap-2 sm:grid-cols-2"><Readout label="∠AOB (at centre)" value={`${centreAngle.toFixed(0)}°`} /><Readout label="∠APB (at circumference)" value={`${apb.toFixed(0)}° × 2 = ${(apb * 2).toFixed(0)}°`} /></div>}
          {mode === 'segment' && <div className="grid gap-2 sm:grid-cols-2"><Readout label="∠APB" value={`${apb.toFixed(0)}°`} /><Readout label="∠AQB" value={`${aqb.toFixed(0)}°`} /></div>}
          {mode === 'segment' && Math.abs(apb - aqb) > 1 && <p className="text-xs text-muted-foreground">P and Q are in different segments now: their angles add to 180° instead ({(apb + aqb).toFixed(0)}°).</p>}
          {mode === 'cyclic' && <div className="grid gap-2 sm:grid-cols-2"><Readout label={`∠${quad[0]} + ∠${quad[2]}`} value={`${qa[0].toFixed(0)}° + ${qa[2].toFixed(0)}° = ${(qa[0] + qa[2]).toFixed(0)}°`} /><Readout label={`∠${quad[1]} + ∠${quad[3]}`} value={`${qa[1].toFixed(0)}° + ${qa[3].toFixed(0)}° = ${(qa[1] + qa[3]).toFixed(0)}°`} /></div>}
          {mode === 'chord' && <div className="grid gap-2 sm:grid-cols-2"><Readout label="AM and MB" value={`${d(A, foot).toFixed(2)} = ${d(foot, B).toFixed(2)}`} /><Readout label="∠OMA" value={`${angleAt(O, foot, A).toFixed(0)}°`} /></div>}
          <p className="text-sm text-muted-foreground">Special case: an angle in a semicircle is always 90°. Drag A and B to opposite ends of a diameter to see it.</p>
        </div>
      </div>
    </LabFrame>
  )
}
