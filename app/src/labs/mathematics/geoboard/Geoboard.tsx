import { useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { area, boundary, interior, selfIntersects, type Pt } from './model'

const N = 8
const S = 36
const O = 20
const PRESETS: { name: string; pts: Pt[] }[] = [
  { name: 'Trapezium', pts: [[1, 1], [7, 1], [5, 4], [2, 4]] },
  { name: 'Triangle', pts: [[1, 1], [7, 1], [3, 6]] },
  { name: 'Rhombus', pts: [[4, 1], [7, 4], [4, 7], [1, 4]] },
  { name: 'L-shape', pts: [[1, 1], [6, 1], [6, 3], [3, 3], [3, 7], [1, 7]] },
]

export default function Geoboard() {
  const [pts, setPts] = useState<Pt[]>(PRESETS[0].pts)
  const X = (x: number) => O + x * S
  const Y = (y: number) => O + (N - y) * S
  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const W = O * 2 + N * S
    const px = ((e.clientX - r.left) / r.width) * W
    const py = ((e.clientY - r.top) / r.height) * W
    const x = Math.round((px - O) / S)
    const y = N - Math.round((py - O) / S)
    if (x < 0 || x > N || y < 0 || y > N) return
    if (pts.some((p) => p[0] === x && p[1] === y)) return
    setPts((ps) => [...ps, [x, y]])
    sfx.click()
  }
  const closed = pts.length >= 3
  const bad = closed && selfIntersects(pts)
  const A = closed ? area(pts) : 0
  const B = closed ? boundary(pts) : 0
  const I = closed ? interior(pts) : 0
  return (
    <LabFrame labId="geoboard" title="Geoboard" subtitle="Stretch a rubber band around pegs and find the area, by splitting it up or with Pick's amazing formula." howTo={<p>Tap pegs in order to make a polygon (it closes automatically). Or pick a preset. Count the squares, then compare with the formula.</p>}>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => <button key={p.name} type="button" onClick={() => setPts(p.pts)} className="rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">{p.name}</button>)}
        <Button size="sm" variant="ghost" onClick={() => setPts((ps) => ps.slice(0, -1))} disabled={!pts.length}>Undo</Button>
        <Button size="sm" variant="ghost" onClick={() => setPts([])}>Clear</Button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${O * 2 + N * S} ${O * 2 + N * S}`} onClick={click} className="w-full max-w-sm cursor-pointer touch-manipulation rounded-2xl border bg-background" role="img" aria-label={`Geoboard polygon with ${pts.length} corners${closed ? `, area ${A}` : ''}`}>
          {Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => <rect key={`${i}-${j}`} x={X(i)} y={Y(j + 1)} width={S} height={S} fill="none" stroke="currentColor" strokeOpacity={0.08} />))}
          {closed && <polygon points={pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill={bad ? '#ef4444' : '#6366f1'} fillOpacity={0.25} stroke={bad ? '#ef4444' : '#6366f1'} strokeWidth={3} strokeLinejoin="round" />}
          {!closed && pts.length === 2 && <line x1={X(pts[0][0])} y1={Y(pts[0][1])} x2={X(pts[1][0])} y2={Y(pts[1][1])} stroke="#6366f1" strokeWidth={3} />}
          {Array.from({ length: N + 1 }, (_, i) => Array.from({ length: N + 1 }, (_, j) => <circle key={`p${i}-${j}`} cx={X(i)} cy={Y(j)} r={3} fill="currentColor" opacity={0.45} />))}
          {pts.map(([x, y], i) => <circle key={`v${i}`} cx={X(x)} cy={Y(y)} r={6} fill="#f59e0b" />)}
        </svg>
        <div className="space-y-2">
          <Readout label="Area (square units)" value={closed ? (bad ? 'The band crosses itself!' : `${A}`) : 'Tap at least 3 pegs'} />
          <Readout label="Pegs on the band (B)" value={closed && !bad ? `${B}` : '—'} />
          <Readout label="Pegs inside (I)" value={closed && !bad ? `${I}` : '—'} />
          <Readout label="Pick's formula: I + B/2 − 1" value={closed && !bad ? `${I} + ${B}/2 − 1 = ${I + B / 2 - 1}` : '—'} />
          <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">Find the area yourself first: split the shape into rectangles and right triangles (half of a rectangle). Then check with <b>Pick's theorem</b> (1899): for any polygon with corners on pegs, <b>Area = I + B/2 − 1</b>. Just count pegs!</p>
        </div>
      </div>
    </LabFrame>
  )
}
