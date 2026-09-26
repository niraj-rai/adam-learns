import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { PRESETS, simulate, type Segment } from './model'

function Chart({ data, key2, color, label, area }: { data: { t: number; v: number; s: number }[]; key2: 'v' | 's'; color: string; label: string; area?: boolean }) {
  const W = 300
  const H = 170
  const tMax = Math.max(1, data.at(-1)!.t)
  const vals = data.map((d) => d[key2])
  const lo = Math.min(0, ...vals)
  const hi = Math.max(1, ...vals)
  const X = (t: number) => 34 + (t / tMax) * (W - 44)
  const Y = (v: number) => H - 24 - ((v - lo) / (hi - lo)) * (H - 40)
  const line = data.map((d) => `${X(d.t)},${Y(d[key2])}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${label} graph`}>
      {area && <polygon points={`${X(0)},${Y(0)} ${line} ${X(tMax)},${Y(0)}`} fill={color} fillOpacity={0.18} />}
      <line x1={34} y1={Y(0)} x2={W - 8} y2={Y(0)} stroke="currentColor" />
      <line x1={34} y1={12} x2={34} y2={H - 24} stroke="currentColor" />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2.5} />
      <text x={38} y={14} fontSize={10} fill="currentColor">{label}</text>
      <text x={W - 8} y={H - 8} textAnchor="end" fontSize={10} fill="currentColor">t (s) → {tMax.toFixed(0)}</text>
      <text x={30} y={Y(hi) + 4} textAnchor="end" fontSize={9} fill="currentColor">{hi.toFixed(0)}</text>
      {lo < 0 && <text x={30} y={Y(lo) + 4} textAnchor="end" fontSize={9} fill="currentColor">{lo.toFixed(0)}</text>}
    </svg>
  )
}

export default function MotionGrapher() {
  const [pi, setPi] = useState<number | 'custom'>(0)
  const [custom, setCustom] = useState<Segment[]>([{ dur: 4, a: 2, label: 'Stage 1' }, { dur: 4, a: 0, label: 'Stage 2' }, { dur: 4, a: -2, label: 'Stage 3' }])
  const [u0c, setU0c] = useState(0)
  const segs = pi === 'custom' ? custom : PRESETS[pi].segs
  const u0 = pi === 'custom' ? u0c : PRESETS[pi].u0
  const data = simulate(segs, u0)
  const end = data.at(-1)!
  const distTravelled = data.reduce((sum, d, i) => (i ? sum + Math.abs(d.s - data[i - 1].s) : 0), 0)
  return (
    <LabFrame labId="motion-grapher" title="Motion Grapher" subtitle="The slope of a velocity–time graph is acceleration; the area under it is displacement." howTo={<p>Pick a journey, or build your own from three stages of constant acceleration. Compare the velocity–time and displacement–time graphs.</p>}>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p, i) => <button key={p.name} type="button" aria-pressed={pi === i} onClick={() => setPi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.emoji} {p.name}</button>)}
        <button type="button" aria-pressed={pi === 'custom'} onClick={() => setPi('custom')} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pi === 'custom' ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>🛠️ Build your own</button>
      </div>
      {pi === 'custom' && (
        <div className="mt-3 grid gap-3 rounded-2xl border p-3 sm:grid-cols-4">
          <label className="text-xs">Start velocity <b>{u0c} m/s</b><Slider value={[u0c]} min={-5} max={10} step={1} onValueChange={([v]) => setU0c(v)} className="mt-1" aria-label="start velocity" /></label>
          {custom.map((g, i) => (
            <div key={i} className="space-y-1 text-xs">
              <p className="font-semibold">Stage {i + 1}</p>
              <label className="block">a = <b>{g.a} m/s²</b><Slider value={[g.a]} min={-3} max={3} step={0.5} onValueChange={([v]) => setCustom((c) => c.map((x, k) => (k === i ? { ...x, a: v } : x)))} aria-label={`stage ${i + 1} acceleration`} /></label>
              <label className="block">for <b>{g.dur} s</b><Slider value={[g.dur]} min={0} max={10} step={1} onValueChange={([v]) => setCustom((c) => c.map((x, k) => (k === i ? { ...x, dur: v } : x)))} aria-label={`stage ${i + 1} duration`} /></label>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Chart data={data} key2="v" color="#6366f1" label="velocity (m/s)" area />
        <Chart data={data} key2="s" color="#10b981" label="displacement (m)" />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Final velocity" value={`${end.v.toFixed(1).replace("-", "−")} m/s`} />
        <Readout label="Displacement (area under v–t)" value={`${end.s.toFixed(1).replace("-", "−")} m`} />
        <Readout label="Distance travelled" value={`${distTravelled.toFixed(1)} m`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">On the <b>v–t graph</b>: a sloping line means acceleration (steeper = bigger); flat means constant velocity. The <b>shaded area</b> equals the displacement; area below the axis counts as negative (moving backwards). On the <b>s–t graph</b>, the slope is the velocity, so it curves when the velocity changes.</p>
    </LabFrame>
  )
}
