import { useRef, useState, type PointerEvent } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { canForm, classify, measure, roundTo180, type P } from './model'

export default function TriangleLab() {
  const [tab, setTab] = useState<'drag' | 'sides'>('drag')
  return (
    <LabFrame labId="triangle-lab" title="Triangle Lab" subtitle="Drag the corners: the angles always add to 180°. And not every three sticks make a triangle." howTo={<p>Drag: move any corner and watch the angles, the exterior angle and the triangle's type. Three sides: choose three lengths and see whether they can form a triangle.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['drag', '🔺 Drag the corners'], ['sides', '📏 Three sides']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'drag' ? <Drag /> : <Sides />}
    </LabFrame>
  )
}

const COL = ['#6366f1', '#f59e0b', '#10b981']
const NAMES = ['A', 'B', 'C']

function Drag() {
  const svg = useRef<SVGSVGElement>(null)
  const [pts, setPts] = useState<[P, P, P]>([[80, 240], [340, 240], [180, 70]])
  const [drag, setDrag] = useState<number | null>(null)
  const { angles, sides } = measure(pts)
  const cls = classify(angles, sides)
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (drag === null || !svg.current) return
    const pt = svg.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.current.getScreenCTM()!.inverse())
    const x = Math.max(15, Math.min(405, p.x))
    const y = Math.max(15, Math.min(285, p.y))
    setPts((ps) => ps.map((q, i) => (i === drag ? [x, y] : q)) as [P, P, P])
  }
  // exterior angle at C: extend side BC beyond C
  const [, B, C] = pts
  const ext: P = [C[0] + (C[0] - B[0]) * 0.35, C[1] + (C[1] - B[1]) * 0.35]
  const ra = roundTo180(angles)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_230px]">
      <svg ref={svg} viewBox="0 0 420 300" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)} className="w-full touch-none rounded-2xl border bg-background" role="img" aria-label={`Triangle with angles ${ra[0]}°, ${ra[1]}° and ${ra[2]}°`}>
        <line x1={C[0]} y1={C[1]} x2={ext[0]} y2={ext[1]} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" />
        <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="#6366f1" fillOpacity={0.08} stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
        {pts.map((p, i) => {
          const c = [p[0] * 0.8 + ((pts[0][0] + pts[1][0] + pts[2][0]) / 3) * 0.2, p[1] * 0.8 + ((pts[0][1] + pts[1][1] + pts[2][1]) / 3) * 0.2]
          return <text key={`a${i}`} x={c[0]} y={c[1] + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={COL[i]}>{ra[i]}°</text>
        })}
        {pts.map((p, i) => (
          <g key={i} onPointerDown={(e) => { try { (e.target as Element).setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ } setDrag(i) }} className="cursor-grab">
            <circle cx={p[0]} cy={p[1]} r={14} fill={COL[i]} fillOpacity={0.25} />
            <circle cx={p[0]} cy={p[1]} r={7} fill={COL[i]} />
            <text x={p[0]} y={p[1] - 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">{NAMES[i]}</text>
          </g>
        ))}
        <text x={ext[0]} y={ext[1] - 8} textAnchor="middle" fontSize={12} fill="#64748b">ext {180 - ra[2]}°</text>
      </svg>
      <div className="space-y-2">
        <Readout label="Angle sum" value={`${ra[0]}° + ${ra[1]}° + ${ra[2]}° = 180°`} />
        <Readout label="Type" value={`${cls.bySide}, ${cls.byAngle}`} />
        <Readout label="Exterior angle at C" value={`${180 - ra[2]}° = A + B = ${ra[0]} + ${ra[1]}`} />
        <Readout label="Sides (units)" value={sides.map((s) => Math.round(s / 10)).join(', ')} />
        <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">However you drag, the angles add to <b>180°</b>, and the exterior angle equals the sum of the two opposite interior angles.</p>
      </div>
    </div>
  )
}

function Sides() {
  const [a, setA] = useState(5)
  const [b, setB] = useState(6)
  const [c, setC] = useState(8)
  const ok = canForm(a, b, c)
  const k = 260 / Math.max(c, 1)
  // place AB = c along the base, then C from the cosine rule (b = AC, a = BC)
  const x = (b * b + c * c - a * a) / (2 * c)
  const y = Math.sqrt(Math.max(0, b * b - x * x))
  const s = Math.min(k, 200 / Math.max(y, 1))
  const A: P = [80, 260]
  const Bp: P = [80 + c * s, 260]
  const Cp: P = [80 + x * s, 260 - y * s]
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Side a = <b>{a}</b><Slider value={[a]} min={1} max={15} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="Side a" /></label>
        <label className="text-sm">Side b = <b>{b}</b><Slider value={[b]} min={1} max={15} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="Side b" /></label>
        <label className="text-sm">Side c = <b>{c}</b><Slider value={[c]} min={1} max={15} step={1} onValueChange={([v]) => setC(v)} className="mt-1" aria-label="Side c" /></label>
      </div>
      <svg viewBox="0 0 440 290" className="w-full max-w-lg rounded-2xl border bg-background" role="img" aria-label={ok ? `Triangle with sides ${a}, ${b}, ${c}` : `Sides ${a}, ${b}, ${c} cannot meet`}>
        {ok ? (
          <>
            <line x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} stroke="#10b981" strokeWidth={5} strokeLinecap="round" />
            <line x1={A[0]} y1={A[1]} x2={Cp[0]} y2={Cp[1]} stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" />
            <line x1={Bp[0]} y1={Bp[1]} x2={Cp[0]} y2={Cp[1]} stroke="#6366f1" strokeWidth={5} strokeLinecap="round" />
          </>
        ) : (() => {
          const [s1, s2, L] = [a, b, c].sort((p, q) => p - q)
          const u = 360 / L
          const tilt = (25 * Math.PI) / 180
          return (
            <>
              <line x1={40} y1={250} x2={40 + L * u} y2={250} stroke="#10b981" strokeWidth={5} strokeLinecap="round" />
              <line x1={40} y1={250} x2={40 + s1 * u * Math.cos(tilt)} y2={250 - s1 * u * Math.sin(tilt)} stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" />
              <line x1={40 + L * u} y1={250} x2={40 + L * u - s2 * u * Math.cos(tilt)} y2={250 - s2 * u * Math.sin(tilt)} stroke="#6366f1" strokeWidth={5} strokeLinecap="round" />
              <text x={220} y={275} textAnchor="middle" fontSize={12} fill="currentColor">longest side {L}; the other two ({s1} + {s2}) can't reach each other</text>
            </>
          )
        })()}
      </svg>
      <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', ok ? 'bg-success-soft' : 'bg-warn-soft')}>
        {ok
          ? <>✅ {a}, {b} and {c} make a triangle: each side is shorter than the other two added together ({a} + {b} &gt; {c}, {b} + {c} &gt; {a}, {a} + {c} &gt; {b}).</>
          : <>❌ No triangle! The two shorter sides ({[a, b, c].sort((p, q) => p - q).slice(0, 2).join(' + ')} = {[a, b, c].sort((p, q) => p - q).slice(0, 2).reduce((p, q) => p + q, 0)}) are not longer than the longest side ({Math.max(a, b, c)}), so they can't meet. This is the <b>triangle inequality</b>.</>}
      </p>
    </div>
  )
}
