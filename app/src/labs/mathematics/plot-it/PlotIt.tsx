import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fourthCorner, quadrant, SHAPES, type Pt } from './model'

const N = 6
const W = 360
const toPx = (v: number) => 20 + ((v + N) / (2 * N)) * (W - 40)
const toPy = (v: number) => 20 + ((N - v) / (2 * N)) * (W - 40)
const fmt = ([x, y]: Pt) => `(${x < 0 ? `−${-x}` : x}, ${y < 0 ? `−${-y}` : y})`

function Grid({ onPick, children }: { onPick: (p: Pt) => void; children: ReactNode }) {
  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const py = ((e.clientY - r.top) / r.height) * W
    const x = Math.round(((px - 20) / (W - 40)) * 2 * N - N)
    const y = Math.round(N - ((py - 20) / (W - 40)) * 2 * N)
    if (Math.abs(x) <= N && Math.abs(y) <= N) onPick([x, y])
  }
  const ticks = Array.from({ length: 2 * N + 1 }, (_, i) => i - N)
  return (
    <svg viewBox={`0 0 ${W} ${W}`} onClick={click} className="w-full max-w-sm cursor-crosshair touch-manipulation rounded-2xl border bg-background" role="img" aria-label="Coordinate grid from −6 to 6">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={toPx(t)} y1={toPy(-N)} x2={toPx(t)} y2={toPy(N)} stroke="currentColor" strokeOpacity={t === 0 ? 0.9 : 0.12} strokeWidth={t === 0 ? 2 : 1} />
          <line x1={toPx(-N)} y1={toPy(t)} x2={toPx(N)} y2={toPy(t)} stroke="currentColor" strokeOpacity={t === 0 ? 0.9 : 0.12} strokeWidth={t === 0 ? 2 : 1} />
          {t !== 0 && <text x={toPx(t)} y={toPy(0) + 14} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.7}>{t}</text>}
          {t !== 0 && <text x={toPx(0) - 8} y={toPy(t) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.7}>{t}</text>}
        </g>
      ))}
      <text x={toPx(N) - 4} y={toPy(0) - 6} textAnchor="end" fontSize={11} fontWeight={700} fill="currentColor">x</text>
      <text x={toPx(0) + 6} y={toPy(N) + 10} fontSize={11} fontWeight={700} fill="currentColor">y</text>
      {[['I', 3, 3], ['II', -3, 3], ['III', -3, -3], ['IV', 3, -3]].map(([q, x, y]) => <text key={q as string} x={toPx(x as number)} y={toPy(y as number)} textAnchor="middle" fontSize={16} opacity={0.12} fill="currentColor">{q}</text>)}
      {children}
    </svg>
  )
}

export default function PlotIt() {
  const [tab, setTab] = useState<'plot' | 'shape'>('plot')
  return (
    <LabFrame labId="plot-it" title="Plot It" subtitle="Coordinates pin down any point on a grid: x across first, then y up or down." howTo={<p>Plot: tap the grid at each target point. Shapes: three corners are shown; tap where the fourth corner must go.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['plot', '📍 Plot points'], ['shape', '🔷 Complete the shape']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'plot' ? <Plot /> : <Shape />}
    </LabFrame>
  )
}

function randomTargets(): Pt[] {
  const out: Pt[] = []
  const quads: [number, number][] = [[1, 1], [-1, 1], [-1, -1], [1, -1], [0, 1], [1, 0]]
  for (const [sx, sy] of quads) out.push([sx * (sx ? 1 + Math.floor(Math.random() * 5) : 0), sy * (sy ? 1 + Math.floor(Math.random() * 5) : 0)])
  return out.sort(() => Math.random() - 0.5)
}

function Plot() {
  const [round, setRound] = useState(0)
  const targets = useMemo(() => randomTargets(), [round])
  const [i, setI] = useState(0)
  const [hits, setHits] = useState<Pt[]>([])
  const [miss, setMiss] = useState<Pt | null>(null)
  const [firstTry, setFirstTry] = useState(0)
  const [tried, setTried] = useState(false)
  const done = i >= targets.length
  const t = targets[i]
  const pick = (p: Pt) => {
    if (done) return
    if (p[0] === t[0] && p[1] === t[1]) {
      setHits((h) => [...h, p]); setMiss(null); setI(i + 1); if (!tried) setFirstTry((f) => f + 1); setTried(false); sfx.correct()
    } else { setMiss(p); setTried(true); sfx.wrong() }
  }
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <Grid onPick={pick}>
        {hits.map((h, k) => <g key={k}><circle cx={toPx(h[0])} cy={toPy(h[1])} r={6} fill="#16a34a" /><text x={toPx(h[0]) + 8} y={toPy(h[1]) - 6} fontSize={10} fill="#16a34a">{fmt(h)}</text></g>)}
        {miss && <circle cx={toPx(miss[0])} cy={toPy(miss[1])} r={6} fill="#dc2626" opacity={0.7} />}
      </Grid>
      <div className="space-y-3">
        {!done ? (
          <p className="rounded-2xl bg-muted/50 p-4 text-center text-lg">Tap <b className="font-mono">{fmt(t)}</b></p>
        ) : (
          <div className="rounded-2xl bg-success-soft p-4 text-center">
            <p className="font-semibold">All {targets.length} plotted! {firstTry} first time.</p>
            <Button className="mt-2" variant="outline" onClick={() => { setRound((r) => r + 1); setI(0); setHits([]); setMiss(null); setFirstTry(0) }}>New points</Button>
          </div>
        )}
        {miss && !done && (
          <p role="status" className="rounded-xl bg-warn-soft px-3 py-2 text-sm">You tapped {fmt(miss)}. {miss[0] === t[1] && miss[1] === t[0] ? 'You swapped x and y! x (across) always comes first.' : 'Go across to x first, then up or down to y.'}</p>
        )}
        <Readout label="Last point" value={hits.length ? `${fmt(hits.at(-1)!)}: ${quadrant(hits.at(-1)!) === 'x-axis' || quadrant(hits.at(-1)!) === 'y-axis' ? `on the ${quadrant(hits.at(-1)!)}` : `quadrant ${quadrant(hits.at(-1)!)}`}` : '—'} />
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A point (x, y) means: from the origin (0, 0), go <b>x across</b> (right if positive, left if negative), then <b>y up or down</b>. The axes split the plane into four quadrants, I to IV, counted anticlockwise.</p>
      </div>
    </div>
  )
}

function Shape() {
  const [si, setSi] = useState(0)
  const s = SHAPES[si]
  const ans = fourthCorner(...s.pts)
  const [pick, setPick] = useState<Pt | null>(null)
  const ok = pick !== null && pick[0] === ans[0] && pick[1] === ans[1]
  const all = [...s.pts, ok ? ans : null].filter(Boolean) as Pt[]
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <Grid onPick={(p) => { setPick(p); if (p[0] === ans[0] && p[1] === ans[1]) sfx.correct(); else sfx.wrong() }}>
        <polyline points={all.map((p) => `${toPx(p[0])},${toPy(p[1])}`).join(' ') + (ok ? ` ${toPx(s.pts[0][0])},${toPy(s.pts[0][1])}` : '')} fill={ok ? '#6366f155' : 'none'} stroke="#6366f1" strokeWidth={2} />
        {s.pts.map((p, k) => <g key={k}><circle cx={toPx(p[0])} cy={toPy(p[1])} r={5} fill="#6366f1" /><text x={toPx(p[0]) + 7} y={toPy(p[1]) - 6} fontSize={10} fill="#6366f1">{'ABC'[k]} {fmt(p)}</text></g>)}
        {pick && !ok && <circle cx={toPx(pick[0])} cy={toPy(pick[1])} r={6} fill="#dc2626" opacity={0.7} />}
      </Grid>
      <div className="space-y-3">
        <p className="rounded-2xl bg-muted/50 p-4">A, B and C are three corners of a <b>{s.name}</b> ABCD. Tap where corner D must be.</p>
        <p role="status" className={cn('rounded-xl px-3 py-2 text-sm', ok ? 'bg-success-soft' : pick ? 'bg-warn-soft' : 'hidden')}>
          {ok ? <>✅ D = {fmt(ans)}. Going from B to A moves {fmt([s.pts[0][0] - s.pts[1][0], s.pts[0][1] - s.pts[1][1]])} across and up; making the same move from C lands on D.</> : pick ? `${fmt(pick)} isn’t it. Opposite sides must be equal and parallel.` : ''}
        </p>
        <Button variant="outline" onClick={() => { setSi((si + 1) % SHAPES.length); setPick(null) }}>Next shape →</Button>
      </div>
    </div>
  )
}
