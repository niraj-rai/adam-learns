import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid } from '../_shared/CoordGrid'
import { fmt, section, triangleArea, type Pt } from '../_shared/coord'
import { SliderRow } from '../_shared/SliderRow'

export default function SectionFormula() {
  const [A, setA] = useState<Pt>({ x: -6, y: -4 })
  const [B, setB] = useState<Pt>({ x: 6, y: 5 })
  const [m, setM] = useState(1)
  const [n, setN] = useState(2)
  const P = section(A, B, m, n)
  const C: Pt = { x: -4, y: 5 }
  return (
    <LabFrame labId="section-formula" title="Section Formula" subtitle="Find the point that divides a line segment in a given ratio, and use coordinates to find areas." howTo={<p>Drag A and B, then change the ratio m : n. Point P divides AB so that AP : PB = m : n.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label={`P divides AB in the ratio ${m}:${n}`} points={[{ p: A, color: '#2563eb', label: 'A', onMove: setA }, { p: B, color: '#dc2626', label: 'B', onMove: setB }]}>
          {(X, Y) => (
            <>
              <polygon points={`${X(A.x)},${Y(A.y)} ${X(B.x)},${Y(B.y)} ${X(C.x)},${Y(C.y)}`} fill="#10b98118" stroke="#10b981" strokeDasharray="3 3" />
              <line x1={X(A.x)} y1={Y(A.y)} x2={X(P.x)} y2={Y(P.y)} stroke="#2563eb" strokeWidth={4} />
              <line x1={X(P.x)} y1={Y(P.y)} x2={X(B.x)} y2={Y(B.y)} stroke="#dc2626" strokeWidth={4} />
              <circle cx={X(P.x)} cy={Y(P.y)} r={6} fill="#a855f7" stroke="white" strokeWidth={2} />
              <text x={X(P.x) + 8} y={Y(P.y) + 14} fontSize={11} fontWeight={700} fill="#a855f7">P</text>
              <circle cx={X(C.x)} cy={Y(C.y)} r={4} fill="#10b981" />
              <text x={X(C.x) + 6} y={Y(C.y) - 6} fontSize={10} fill="#10b981">C(−4, 5)</text>
            </>
          )}
        </CoordGrid>
        <div className="space-y-3">
          <SliderRow label="m" value={m} min={1} max={5} onChange={setM} />
          <SliderRow label="n" value={n} min={1} max={5} onChange={setN} />
          <div className="rounded-2xl border p-3 font-mono text-sm">
            <p>x = (m·x₂ + n·x₁)/(m + n) = ({m}×{B.x} + {n}×{A.x})/{m + n} = {fmt(P.x)}</p>
            <p>y = (m·y₂ + n·y₁)/(m + n) = ({m}×{B.y} + {n}×{A.y})/{m + n} = {fmt(P.y)}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="P" value={`(${fmt(P.x)}, ${fmt(P.y)})`} />
            <Readout label="Area of triangle ABC" value={`${fmt(triangleArea(A, B, C))} sq units`} />
          </div>
          <p className="text-sm text-muted-foreground">Set m = n: P is the midpoint. Try m : n = 1 : 2 and 2 : 1 to find the two points of trisection.</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Section formula:</b> P = ((m x₂ + n x₁)/(m + n), (m y₂ + n y₁)/(m + n)). Area of a triangle from coordinates: ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|. If it is 0, the points are collinear. (Not in the rationalised CBSE book, but part of IB MYP 5.)</p>
    </LabFrame>
  )
}
