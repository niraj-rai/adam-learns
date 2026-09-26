import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { SliderRow } from '../_shared/SliderRow'

export default function TangentLab() {
  const [r, setR] = useState(3)
  const [d, setD] = useState(5)
  const dist = Math.max(d, r + 0.5)
  const L = Math.sqrt(dist * dist - r * r)
  const s = 22
  const O = { x: 90, y: 120 }
  const P = { x: O.x + dist * s, y: O.y }
  const ang = Math.acos(r / dist)
  const T1 = { x: O.x + r * s * Math.cos(ang), y: O.y - r * s * Math.sin(ang) }
  const T2 = { x: T1.x, y: O.y + r * s * Math.sin(ang) }
  const angleP = (2 * Math.asin(r / dist) * 180) / Math.PI
  return (
    <LabFrame labId="tangent-lab" title="Tangents to a Circle" subtitle="A tangent touches a circle at exactly one point and is perpendicular to the radius there. Two tangents from an outside point are equal." howTo={<p>Change the radius and how far point P is from the centre. Check the right angles at T₁ and T₂, and that PT₁ = PT₂.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 330 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Two tangents of length ${fmt(L)} from P`}>
          <circle cx={O.x} cy={O.y} r={r * s} fill="#7c3aed18" stroke="#7c3aed" strokeWidth={2} />
          <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke="currentColor" strokeDasharray="4 3" opacity={0.6} />
          {[T1, T2].map((T, i) => (
            <g key={i}>
              <line x1={O.x} y1={O.y} x2={T.x} y2={T.y} stroke="#2563eb" strokeWidth={2} />
              <line x1={P.x} y1={P.y} x2={T.x} y2={T.y} stroke="#dc2626" strokeWidth={3} />
              <circle cx={T.x} cy={T.y} r={4} fill="#dc2626" />
              <text x={T.x - 4} y={T.y + (i ? 16 : -8)} fontSize={11} fontWeight={700} fill="currentColor">T{i ? '₂' : '₁'}</text>
            </g>
          ))}
          <circle cx={O.x} cy={O.y} r={3} fill="currentColor" /><text x={O.x - 14} y={O.y + 4} fontSize={11} fill="currentColor">O</text>
          <circle cx={P.x} cy={P.y} r={4} fill="#10b981" /><text x={P.x + 6} y={P.y + 4} fontSize={11} fontWeight={700} fill="#10b981">P</text>
        </svg>
        <div className="space-y-3">
          <SliderRow label="Radius r" value={r} min={1} max={4} step={0.5} onChange={setR} />
          <SliderRow label="Distance OP" value={dist} shown={fmt(dist, 1)} min={1.5} max={10} step={0.5} onChange={setD} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="PT₁ = PT₂ = √(OP² − r²)" value={fmt(L)} />
            <Readout label="Angle OT₁P" value="90°" />
            <Readout label="Angle T₁PT₂" value={`${fmt(angleP, 1)}°`} />
            <Readout label="Angle T₁OT₂" value={`${fmt(180 - angleP, 1)}°`} />
          </div>
          <p className="text-sm text-muted-foreground">Angles T₁PT₂ and T₁OT₂ always add to 180°: OT₁PT₂ has two right angles.</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">From a point <b>inside</b> the circle there is no tangent; <b>on</b> the circle, exactly one; <b>outside</b>, exactly two, and they are equal in length (congruent right triangles OT₁P and OT₂P). A bicycle chain leaves each gear along a tangent.</p>
    </LabFrame>
  )
}
