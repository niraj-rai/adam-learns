import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { interior, NAMES, tilesAlone, vertexSum } from './model'

const SIDES = [3, 4, 5, 6, 8, 10, 12]
const COL: Record<number, string> = { 3: '#f59e0b', 4: '#6366f1', 5: '#ef4444', 6: '#10b981', 8: '#ec4899', 10: '#0ea5e9', 12: '#a855f7' }

/** Regular n-gon with one corner at the centre, filling the wedge that starts at angle phi (degrees). */
function gon(n: number, phi: number, s = 40) {
  const pts: [number, number][] = [[0, 0]]
  let dir = phi
  for (let i = 1; i < n; i++) {
    const [x, y] = pts[i - 1]
    pts.push([x + s * Math.cos((dir * Math.PI) / 180), y + s * Math.sin((dir * Math.PI) / 180)])
    dir += 360 / n
  }
  return pts.map(([x, y]) => `${160 + x},${160 - y}`).join(' ')
}

function Vertex({ ns }: { ns: number[] }) {
  let phi = 0
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-xs rounded-2xl border bg-background" role="img" aria-label={`Polygons around a point: ${ns.map((n) => NAMES[n]).join(', ')}`}>
      {ns.map((n, i) => {
        const g = <polygon key={i} points={gon(n, phi)} fill={COL[n]} fillOpacity={0.35} stroke={COL[n]} strokeWidth={2} />
        phi += interior(n)
        return g
      })}
      <circle cx={160} cy={160} r={4} fill="currentColor" />
    </svg>
  )
}

export default function TilingStudio() {
  const [tab, setTab] = useState<'alone' | 'mix'>('alone')
  return (
    <LabFrame labId="tiling-studio" title="Tiling Studio" subtitle="Which regular polygons fit together around a point with no gaps or overlaps?" howTo={<p>Tile alone: pick a polygon and see how many copies fit around one corner point. Mix: combine different polygons at one point and try to make exactly 360°.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['alone', '🔁 One shape'], ['mix', '🧩 Mix shapes']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'alone' ? <Alone /> : <Mix />}
    </LabFrame>
  )
}

function Alone() {
  const [n, setN] = useState(6)
  const a = interior(n)
  const k = Math.floor(360 / a + 1e-9)
  const gap = 360 - k * a
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <Vertex ns={Array(k).fill(n)} />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {SIDES.map((x) => <button key={x} type="button" aria-pressed={n === x} onClick={() => setN(x)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm capitalize', n === x ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{NAMES[x]}</button>)}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Readout label="Each angle" value={`${Math.round(a * 10) / 10}°`} />
          <Readout label="Around a point" value={`${k} fit, ${gap < 1e-6 ? 'no gap' : `${Math.round(gap * 10) / 10}° gap left`}`} />
        </div>
        <p className={cn('rounded-xl px-4 py-2 text-sm', tilesAlone(n) ? 'bg-success-soft' : 'bg-warn-soft')}>
          {tilesAlone(n)
            ? <>✅ 360° ÷ {Math.round(a)}° = {360 / a} exactly, so {NAMES[n]}s tile the plane on their own. Bees use hexagons!</>
            : <>❌ 360° ÷ {Math.round(a * 10) / 10}° isn't a whole number, so {NAMES[n]}s leave gaps (or would overlap). Only triangles, squares and hexagons tile on their own.</>}
        </p>
      </div>
    </div>
  )
}

function Mix() {
  const [ns, setNs] = useState<number[]>([4, 8])
  const sum = vertexSum(ns)
  const add = (n: number) => {
    if (sum + interior(n) > 360 + 1e-6) { sfx.wrong(); return }
    const next = [...ns, n]
    setNs(next)
    if (Math.abs(vertexSum(next) - 360) < 1e-6) sfx.win()
    else sfx.click()
  }
  const full = Math.abs(sum - 360) < 1e-6
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <Vertex ns={ns} />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {SIDES.map((x) => <Button key={x} size="sm" variant="outline" onClick={() => add(x)} disabled={full} className="capitalize">+ {NAMES[x]} ({Math.round(interior(x))}°)</Button>)}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setNs((q) => q.slice(0, -1))} disabled={!ns.length}>Undo</Button>
          <Button size="sm" variant="ghost" onClick={() => setNs([])}>Clear</Button>
        </div>
        <Readout label="Angles at the point" value={`${ns.map((n) => Math.round(interior(n))).join(' + ') || '0'} = ${Math.round(sum)}°`} />
        <p className={cn('rounded-xl px-4 py-2 text-sm', full ? 'bg-success-soft' : 'bg-chem-soft')}>
          {full ? <>✅ Exactly 360°: these fit perfectly around a point! Famous mixes: square + octagon + octagon (used in floor tiles), triangle + dodecagon + dodecagon, and triangle + square + hexagon + square.</> : <>Keep adding shapes until the angles make exactly 360°. You still need {Math.round((360 - sum) * 10) / 10}°.</>}
        </p>
      </div>
    </div>
  )
}
