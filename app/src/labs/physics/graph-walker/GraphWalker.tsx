import { Play, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ACTION_LABEL, CHALLENGES, TRACK, matchesTarget, positionAt, sample, totalTime, type Action, type Segment } from './model'

export default function GraphWalker() {
  const [ci, setCi] = useState<number | null>(0)
  const [segs, setSegs] = useState<Segment[]>([])
  const [action, setAction] = useState<Action>('walk')
  const [secs, setSecs] = useState(2)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [solved, setSolved] = useState<number[]>([])
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null)
  const raf = useRef(0)
  const T = totalTime(segs)
  const target = ci !== null ? CHALLENGES[ci].target : null
  const Tmax = Math.max(T, target ? totalTime(target) : 0, 6)

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const loop = (now: number) => {
      const dt = ((now - last) / 1000) * 1.5
      last = now
      setT((x) => {
        const n = Math.min(T, x + dt)
        if (n >= T) {
          setPlaying(false)
          if (target) {
            const ok = matchesTarget(segs, target)
            setVerdict(ok ? 'right' : 'wrong')
            if (ok) {
              sfx.win()
              setSolved((s) => (ci !== null && !s.includes(ci) ? [...s, ci] : s))
            } else sfx.wrong()
          }
        }
        return n
      })
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, T, segs, target, ci])

  const data = useMemo(() => {
    const mine = sample(segs, Math.min(t, T))
    const tgt = target ? sample(target) : []
    const byT = new Map<number, { t: number; mine?: number; target?: number }>()
    for (const p of tgt) byT.set(p.t, { t: p.t, target: p.x })
    for (const p of mine) byT.set(p.t, { ...(byT.get(p.t) ?? { t: p.t }), mine: p.x })
    return [...byT.values()].sort((a, b) => a.t - b.t)
  }, [segs, t, T, target])

  const x = positionAt(segs, t)
  const edit = (fn: (s: Segment[]) => Segment[]) => {
    setSegs(fn)
    setT(0)
    setVerdict(null)
  }

  return (
    <LabFrame
      labId="graph-walker"
      title="Graph Walker"
      subtitle="Program a walk and watch its distance–time graph being drawn"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Add steps (walk, run, stand still, walk back) with how many seconds each lasts, then press Play.</li>
          <li>In a challenge, make your graph match the dashed target line exactly.</li>
          <li>Notice: a steeper line = faster. A flat line = standing still. A line going down = coming back.</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CHALLENGES.map((c, i) => (
          <button key={c.title} type="button" onClick={() => { setCi(i); setSegs([]); setT(0); setVerdict(null) }} className={cn('rounded-full border px-3 py-1 text-xs', ci === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {i + 1}. {c.title} {solved.includes(i) && '✅'}
          </button>
        ))}
        <button type="button" onClick={() => { setCi(null); setVerdict(null) }} className={cn('rounded-full border px-3 py-1 text-xs', ci === null ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
          🎨 Free play
        </button>
      </div>

      {/* track */}
      <div className="relative mb-3 h-14 rounded-xl border bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/40 dark:to-sky-950/40">
        {Array.from({ length: TRACK / 5 + 1 }, (_, k) => (
          <span key={k} className="absolute bottom-0 text-[10px] text-muted-foreground" style={{ left: `calc(${(k * 5 * 100) / TRACK}% * 0.95 + 8px)` }}>{k * 5} m</span>
        ))}
        <span className="absolute top-1 text-3xl transition-none" style={{ left: `calc(${(x / TRACK) * 100}% * 0.95)` }} aria-label={`Walker at ${x.toFixed(1)} metres`}>
          🧒
        </span>
        <span className="absolute top-1 right-2 text-2xl">🏫</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="h-64 rounded-xl border bg-background p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" type="number" domain={[0, Tmax]} tick={{ fontSize: 11 }} label={{ value: 'time (s)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis domain={[0, TRACK]} tick={{ fontSize: 11 }} width={34} label={{ value: 'distance (m)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              {target && <Line dataKey="target" stroke="#94a3b8" strokeWidth={3} strokeDasharray="6 5" dot={false} isAnimationActive={false} connectNulls />}
              <Line dataKey="mine" stroke="var(--chem)" strokeWidth={3} dot={false} isAnimationActive={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">My walk ({T} s)</p>
          <ol className="space-y-1 text-sm">
            {segs.length === 0 && <li className="text-muted-foreground">No steps yet.</li>}
            {segs.map((s, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
                <span className="flex-1">{i + 1}. {ACTION_LABEL[s.action].split(' (')[0]} for {s.seconds} s</span>
                <button type="button" onClick={() => edit((x) => x.filter((_, k) => k !== i))} aria-label={`Remove step ${i + 1}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ol>
          <div className="flex gap-1.5">
            <select value={action} onChange={(e) => setAction(e.target.value as Action)} className="h-9 flex-1 rounded-lg border bg-background px-2 text-sm" aria-label="Action">
              {(Object.keys(ACTION_LABEL) as Action[]).map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
            </select>
            <select value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="h-9 w-16 rounded-lg border bg-background px-2 text-sm" aria-label="Seconds">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} s</option>)}
            </select>
            <Button size="icon" variant="outline" onClick={() => edit((x) => (x.length < 6 ? [...x, { action, seconds: secs }] : x))} aria-label="Add step"><Plus /></Button>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => { setT(0); setVerdict(null); setPlaying(true) }} disabled={segs.length === 0 || playing}><Play /> Play</Button>
            <Button variant="ghost" onClick={() => edit(() => [])}><RotateCcw /> Clear</Button>
          </div>
          {verdict && (
            <p role="status" className={cn('rounded-lg px-3 py-2 text-sm', verdict === 'right' ? 'bg-success-soft' : 'bg-warn-soft')}>
              {verdict === 'right' ? '🎉 Perfect match!' : '🤔 Not quite. Compare your line with the dashed one. Where does it get steeper, go flat, or go down?'}
            </p>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
