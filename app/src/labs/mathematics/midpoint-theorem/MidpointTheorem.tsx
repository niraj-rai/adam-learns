import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid } from '../_shared/CoordGrid'
import { distance, fmt, midpoint, slope, type Pt } from '../_shared/coord'

const sl = (a: Pt, b: Pt) => { const m = slope(a, b); return Number.isFinite(m) ? fmt(m) : 'vertical' }

export default function MidpointTheorem() {
  const [tab, setTab] = useState<'triangle' | 'quad'>('triangle')
  const [A, setA] = useState<Pt>({ x: -1, y: 6 })
  const [B, setB] = useState<Pt>({ x: -6, y: -4 })
  const [Cc, setC] = useState<Pt>({ x: 6, y: -2 })
  const [D, setD] = useState<Pt>({ x: 5, y: 5 })
  const M = midpoint(A, B)
  const N = midpoint(A, Cc)
  // quadrilateral ABCD (using D) midpoints
  const P1 = midpoint(A, B), P2 = midpoint(B, Cc), P3 = midpoint(Cc, D), P4 = midpoint(D, A)
  return (
    <LabFrame labId="midpoint-theorem" title="Midpoint Theorem" subtitle="Joining the midpoints of two sides of a triangle gives a line parallel to the third side and half as long." howTo={<p>Drag the vertices. However you move them, check the slopes (parallel lines have equal slopes) and the lengths.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['triangle', 'Triangle'], ['quad', 'Any quadrilateral']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label={tab === 'triangle' ? 'Triangle ABC with midpoints M and N' : 'Quadrilateral ABCD with its midpoint parallelogram'} points={[{ p: A, color: '#2563eb', label: 'A', onMove: setA }, { p: B, color: '#2563eb', label: 'B', onMove: setB }, { p: Cc, color: '#2563eb', label: 'C', onMove: setC }, ...(tab === 'quad' ? [{ p: D, color: '#2563eb', label: 'D', onMove: setD }] : [])]}>
          {(X, Y) => tab === 'triangle' ? (
            <>
              <polygon points={[A, B, Cc].map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="#6366f1" fillOpacity={0.08} stroke="#6366f1" strokeWidth={2} />
              <line x1={X(B.x)} y1={Y(B.y)} x2={X(Cc.x)} y2={Y(Cc.y)} stroke="#10b981" strokeWidth={3} />
              <line x1={X(M.x)} y1={Y(M.y)} x2={X(N.x)} y2={Y(N.y)} stroke="#dc2626" strokeWidth={3} />
              {[['M', M], ['N', N]].map(([l, p]) => <g key={l as string}><circle cx={X((p as Pt).x)} cy={Y((p as Pt).y)} r={5} fill="#dc2626" /><text x={X((p as Pt).x) - 14} y={Y((p as Pt).y) - 6} fontSize={11} fontWeight={700} fill="#dc2626">{l as string}</text></g>)}
            </>
          ) : (
            <>
              <polygon points={[A, B, Cc, D].map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="#6366f1" fillOpacity={0.08} stroke="#6366f1" strokeWidth={2} />
              <polygon points={[P1, P2, P3, P4].map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="#dc2626" fillOpacity={0.12} stroke="#dc2626" strokeWidth={2.5} />
            </>
          )}
        </CoordGrid>
        <div className="space-y-2">
          {tab === 'triangle' ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <Readout label="Slope of MN" value={sl(M, N)} />
                <Readout label="Slope of BC" value={sl(B, Cc)} />
                <Readout label="Length MN" value={fmt(distance(M, N))} />
                <Readout label="Length BC ÷ 2" value={fmt(distance(B, Cc) / 2)} />
              </div>
              <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">✅ MN ∥ BC and MN = ½ BC. The <b>converse</b> is also true: a line through the midpoint of one side, parallel to another side, bisects the third side.</p>
            </>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <Readout label="Slopes: top and bottom" value={`${sl(P1, P2)} and ${sl(P4, P3)}`} />
                <Readout label="Slopes: left and right" value={`${sl(P2, P3)} and ${sl(P1, P4)}`} />
              </div>
              <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">Join the midpoints of any quadrilateral and you always get a <b>parallelogram</b> (Varignon's theorem). Why? Draw a diagonal: each pair of opposite midpoint lines is parallel to it and half its length, by the midpoint theorem!</p>
            </>
          )}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Remember the parallelogram facts: opposite sides are equal and parallel, opposite angles are equal, and the diagonals bisect each other. A rectangle, rhombus and square are special parallelograms.</p>
    </LabFrame>
  )
}
