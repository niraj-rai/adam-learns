import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid } from '../_shared/CoordGrid'
import { distance, fmt, midpoint, type Pt } from '../_shared/coord'
import { simplifySurd } from '../_shared/real'

const surdStr = (n: number) => { const [a, b] = simplifySurd(n); return b === 1 ? `${a}` : a === 1 ? `√${b}` : `${a}√${b}` }

export default function DistanceFinder() {
  const [A, setA] = useState<Pt>({ x: -3, y: -2 })
  const [B, setB] = useState<Pt>({ x: 3, y: 6 })
  const dx = B.x - A.x
  const dy = B.y - A.y
  const d2 = dx * dx + dy * dy
  const M = midpoint(A, B)
  return (
    <LabFrame labId="distance-finder" title="Distance and Midpoint" subtitle="Pythagoras on a grid gives the distance between any two points; averaging gives the midpoint." howTo={<p>Drag points A and B. The dashed right triangle shows the horizontal and vertical gaps used in the distance formula.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label={`Points A and B, ${fmt(distance(A, B))} units apart`} points={[{ p: A, color: '#2563eb', label: 'A', onMove: setA }, { p: B, color: '#dc2626', label: 'B', onMove: setB }]}>
          {(X, Y) => (
            <>
              <path d={`M${X(A.x)},${Y(A.y)} L${X(B.x)},${Y(A.y)} L${X(B.x)},${Y(B.y)}`} fill="none" stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={2} />
              <line x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} stroke="#10b981" strokeWidth={3} />
              <circle cx={X(M.x)} cy={Y(M.y)} r={5} fill="#a855f7" />
              <text x={X(M.x) + 6} y={Y(M.y) + 14} fontSize={10} fill="#a855f7" fontWeight={700}>M({fmt(M.x, 1)}, {fmt(M.y, 1)})</text>
            </>
          )}
        </CoordGrid>
        <div className="space-y-3">
          <div className="rounded-2xl border p-4 font-mono text-sm">
            <p>Across: x₂ − x₁ = {B.x} − ({A.x}) = {dx}</p>
            <p>Up: y₂ − y₁ = {B.y} − ({A.y}) = {dy}</p>
            <p className="mt-2">AB = √({dx}² + {dy}²) = √{d2} = <b className="text-chem">{surdStr(d2)}</b> ≈ {fmt(Math.sqrt(d2))}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Distance AB" value={`${surdStr(d2)} ≈ ${fmt(Math.sqrt(d2))}`} />
            <Readout label="Midpoint M" value={`(${fmt(M.x, 1)}, ${fmt(M.y, 1)})`} />
          </div>
          <p className="text-sm text-muted-foreground">Try A(0, 0) and B(3, 4), or B(5, 12). Can you find two points exactly 10 units apart that aren't on the same grid line?</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Distance formula: <b>d = √[(x₂ − x₁)² + (y₂ − y₁)²]</b>, which is just Pythagoras. Midpoint formula: <b>M = ((x₁ + x₂)/2, (y₁ + y₂)/2)</b>, the average of the coordinates. René Descartes' idea of describing points with numbers joined algebra and geometry for ever.</p>
    </LabFrame>
  )
}
