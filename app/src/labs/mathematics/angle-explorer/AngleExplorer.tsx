import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { angle, RELATIONS, type Corner, type Pos } from './model'

const POSES: Pos[] = ['TL', 'TR', 'BL', 'BR']
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899']
const rad = (d: number) => (d * Math.PI) / 180

export default function AngleExplorer() {
  const [th, setTh] = useState(60)
  const [rid, setRid] = useState('alternate')
  const [tilt, setTilt] = useState(false)
  const rel = RELATIONS.find((r) => r.id === rid)!
  const W = 520
  const yA = 90
  const yB = 220
  const dx = (yB - yA) / 2 / Math.tan(rad(th))
  const cx = { A: W / 2 + dx, B: W / 2 - dx }
  const cy = { A: yA, B: yB }
  const off = (at: 'A' | 'B') => (at === 'B' && tilt ? 14 : 0)
  const thAt = (at: 'A' | 'B') => th - off(at)
  // start and end directions (degrees, anticlockwise from →) of the angle at each position
  const span0 = (t: number, pos: Pos): [number, number] => (pos === 'TR' ? [0, t] : pos === 'TL' ? [t, 180] : pos === 'BL' ? [180, t + 180] : [t + 180, 360])
  const span = (at: 'A' | 'B', pos: Pos): [number, number] => { const [s, e] = span0(thAt(at), pos); return [s + off(at), e + off(at)] }
  const colorOf = (c: Corner) => {
    const i = rel.pairs.findIndex(([p, q]) => (p.at === c.at && p.pos === c.pos) || (q.at === c.at && q.pos === c.pos))
    return i >= 0 ? COLORS[i] : null
  }
  const arc = (at: 'A' | 'B', pos: Pos, color: string) => {
    const [s, e] = span(at, pos)
    const r = 26
    const x1 = cx[at] + r * Math.cos(rad(s))
    const y1 = cy[at] - r * Math.sin(rad(s))
    const x2 = cx[at] + r * Math.cos(rad(e))
    const y2 = cy[at] - r * Math.sin(rad(e))
    return <path d={`M${cx[at]},${cy[at]} L${x1},${y1} A${r},${r} 0 ${e - s > 180 ? 1 : 0} 0 ${x2},${y2} Z`} fill={color} fillOpacity={0.35} stroke={color} />
  }
  const label = (at: 'A' | 'B', pos: Pos) => {
    const [s, e] = span(at, pos)
    const mid = (s + e) / 2
    const r = 46
    return { x: cx[at] + r * Math.cos(rad(mid)), y: cy[at] - r * Math.sin(rad(mid)) + 4 }
  }
  const lineB = tilt ? { x1: 20, y1: yB + (cx.B - 20) * Math.tan(rad(14)), x2: W - 20, y2: yB - (W - 20 - cx.B) * Math.tan(rad(14)) } : { x1: 20, y1: yB, x2: W - 20, y2: yB }
  const ok = rel.pairs.every(([p, q]) => {
    const a = angle(thAt(p.at), p.pos)
    const b = angle(thAt(q.at), q.pos)
    return rel.rule === 'equal' ? a === b : a + b === 180
  })
  return (
    <LabFrame labId="angle-explorer" title="Angle Explorer" subtitle="A transversal crossing parallel lines makes eight angles, but only two different sizes." howTo={<p>Change the angle of the transversal. Pick a relationship to highlight the matching pairs of angles. Then make the lines not parallel and see what breaks.</p>}>
      <div className="flex flex-wrap gap-1">
        {RELATIONS.map((r) => <button key={r.id} type="button" aria-pressed={rid === r.id} onClick={() => setRid(r.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', rid === r.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{r.name}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} 310`} className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Parallel lines cut by a transversal at ${th} degrees`}>
        <line x1={20} y1={yA} x2={W - 20} y2={yA} stroke="currentColor" strokeWidth={2.5} />
        <line {...lineB} stroke="currentColor" strokeWidth={2.5} />
        {!tilt && <><text x={W - 24} y={yA - 6} textAnchor="end" fontSize={12} fill="currentColor">▶</text><text x={W - 24} y={yB - 6} textAnchor="end" fontSize={12} fill="currentColor">▶</text></>}
        <line x1={cx.A + 70 * Math.cos(rad(th))} y1={yA - 70 * Math.sin(rad(th))} x2={cx.B - 70 * Math.cos(rad(th))} y2={yB + 70 * Math.sin(rad(th))} stroke="#64748b" strokeWidth={2.5} />
        {(['A', 'B'] as const).flatMap((at) => POSES.map((pos) => { const c = colorOf({ at, pos }); return c ? <g key={at + pos}>{arc(at, pos, c)}</g> : null }))}
        {(['A', 'B'] as const).flatMap((at) => POSES.map((pos) => {
          const l = label(at, pos)
          const c = colorOf({ at, pos })
          return <text key={`t${at}${pos}`} x={l.x} y={l.y} textAnchor="middle" fontSize={13} fontWeight={c ? 700 : 400} fill={c ?? 'currentColor'} opacity={c ? 1 : 0.55}>{Math.round(angle(thAt(at), pos))}°</text>
        }))}
      </svg>
      <label className="mt-3 block text-sm">Transversal angle <b>{th}°</b><Slider value={[th]} min={25} max={155} step={5} onValueChange={([v]) => setTh(v)} className="mt-1" aria-label="Transversal angle" /></label>
      <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={tilt} onChange={(e) => setTilt(e.target.checked)} className="size-4" /> Make the lines NOT parallel</label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label={rel.name} value={`These pairs ${rel.rule}`} />
        <Readout label="Does it hold now?" value={ok ? '✅ Yes' : '❌ No: the lines aren’t parallel'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">All eight angles are either <b>{th}°</b> or <b>{180 - th}°</b>. Corresponding and alternate angles are equal, and co-interior angles add to 180°, but <b>only when the lines are parallel</b>. That's how builders and engineers check that lines really are parallel.</p>
    </LabFrame>
  )
}
