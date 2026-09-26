import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SliderRow } from '../_shared/SliderRow'

const DIRS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West']
const kind = (d: number) => (d === 0 ? 'no turn' : d < 90 ? 'acute angle' : d === 90 ? 'right angle' : d < 180 ? 'obtuse angle' : d === 180 ? 'straight angle' : d < 360 ? 'reflex angle' : 'full turn')
const turn = (d: number) => ({ 0: 'no turn', 90: '¼ turn', 180: '½ turn', 270: '¾ turn', 360: 'full turn' } as Record<number, string>)[d] ?? `${d}/360 of a turn`

export default function AngleTurns() {
  const [deg, setDeg] = useState(90)
  const rad = ((deg - 90) * Math.PI) / 180
  const c = 110
  const r = 80
  const tip = { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) }
  const large = deg > 180 ? 1 : 0
  const arc = deg >= 360 ? `M${c},${c - 30} A30,30 0 1 1 ${c - 0.01},${c - 30}` : `M${c},${c - 30} A30,30 0 ${large} 1 ${c + 30 * Math.cos(rad)},${c + 30 * Math.sin(rad)}`
  return (
    <LabFrame labId="angle-turns" title="Angles as Turns" subtitle="An angle measures how much something turns. A full turn is 360 degrees." howTo={<p>Start facing North. Use the slider or the buttons to turn clockwise and see the angle, the fraction of a turn and the direction you now face.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-xs rounded-2xl border bg-background" role="img" aria-label={`Turned ${deg} degrees clockwise`}>
          <circle cx={c} cy={c} r={r + 10} fill="none" stroke="currentColor" opacity={0.15} />
          {['N', 'E', 'S', 'W'].map((l, i) => <text key={l} x={c + (r + 22) * Math.sin((i * Math.PI) / 2)} y={c - (r + 22) * Math.cos((i * Math.PI) / 2) + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">{l}</text>)}
          {deg > 0 && <path d={arc} fill="none" stroke="#f59e0b" strokeWidth={3} />}
          <line x1={c} y1={c} x2={c} y2={c - r} stroke="currentColor" strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />
          <line x1={c} y1={c} x2={tip.x} y2={tip.y} stroke="#7c3aed" strokeWidth={4} strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r={6} fill="#7c3aed" />
          <circle cx={c} cy={c} r={4} fill="currentColor" />
        </svg>
        <div className="space-y-3">
          <SliderRow label="Turn" value={deg} shown={`${deg}°`} min={0} max={360} step={15} onChange={setDeg} />
          <div className="flex flex-wrap gap-1">{[0, 45, 90, 180, 270, 360].map((d) => <button key={d} type="button" onClick={() => setDeg(d)} className={`rounded-lg border px-2 py-1 text-sm ${deg === d ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{turn(d) === `${d}/360 of a turn` ? `${d}°` : turn(d)}</button>)}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Angle" value={`${deg}°`} />
            <Readout label="Fraction of a turn" value={turn(deg)} />
            <Readout label="Type" value={kind(deg)} />
            <Readout label="Now facing" value={deg % 45 === 0 ? DIRS[(deg / 45) % 8] : 'between directions'} />
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>right angle</b> is a quarter turn (90°), like the corner of a book. <b>Acute</b> angles are smaller than a right angle; <b>obtuse</b> angles are bigger but less than a straight line (180°). The idea of 360 degrees in a circle is very old: it may come from the roughly 360 days in a year.</p>
    </LabFrame>
  )
}
