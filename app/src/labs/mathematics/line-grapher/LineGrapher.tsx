import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { PRESETS, y } from './model'

const n = (v: number) => (v < 0 ? `−${-v}` : `${v}`)
const eqText = (m: number, c: number) => `y = ${m === 0 ? '' : `${m === 1 ? '' : m === -1 ? '−' : n(m)}x`}${c === 0 && m !== 0 ? '' : m === 0 ? n(c) : ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}`}`

export default function LineGrapher() {
  const [pid, setPid] = useState('free')
  const p = PRESETS.find((x) => x.id === pid)!
  const [m, setM] = useState(p.m)
  const [c, setC] = useState(p.c)
  const free = pid === 'free'
  const x0 = free ? -10 : 0
  const x1 = p.xMax
  const xs = Array.from({ length: 6 }, (_, i) => x0 + ((x1 - x0) * i) / 5)
  const ys = [y(m, c, x0), y(m, c, x1)]
  const yMin = free ? -10 : Math.min(0, ...ys)
  const yMax = free ? 10 : Math.max(...ys, 10) * 1.1
  const W = 420
  const H = 280
  const X = (v: number) => 40 + ((v - x0) / (x1 - x0)) * (W - 60)
  const Y = (v: number) => H - 30 - ((v - yMin) / (yMax - yMin)) * (H - 50)
  const choose = (id: string) => { const q = PRESETS.find((x) => x.id === id)!; setPid(id); setM(q.m); setC(q.c) }
  const mRange = free ? [-5, 5, 0.5] : p.id === 'temp' ? [1, 3, 0.1] : p.id === 'tank' ? [-40, -5, 5] : [5, 60, 5]
  const cRange = free ? [-8, 8, 1] : p.id === 'temp' ? [0, 50, 1] : p.id === 'tank' ? [100, 300, 10] : [0, 400, 10]
  return (
    <LabFrame labId="line-grapher" title="Line Grapher" subtitle="y = mx + c: change the steepness and the starting value, and see real situations as straight lines." howTo={<p>Pick a situation, or ‘Any line’. Change m (how fast y changes for each 1 of x) and c (the value of y when x is 0). Compare the table with the graph.</p>}>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((x) => (
          <button key={x.id} type="button" aria-pressed={pid === x.id} onClick={() => choose(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pid === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>
        ))}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_220px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Graph of ${eqText(m, c)}`}>
          <line x1={X(x0)} y1={Y(Math.max(yMin, Math.min(0, yMax)))} x2={X(x1)} y2={Y(Math.max(yMin, Math.min(0, yMax)))} stroke="currentColor" strokeWidth={1.5} />
          <line x1={X(Math.max(x0, 0))} y1={Y(yMin)} x2={X(Math.max(x0, 0))} y2={Y(yMax)} stroke="currentColor" strokeWidth={1.5} />
          {xs.map((v) => <text key={v} x={X(v)} y={H - 12} textAnchor="middle" fontSize={10} fill="currentColor">{Math.round(v * 10) / 10}</text>)}
          {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => <text key={i} x={34} y={Y(v) + 3} textAnchor="end" fontSize={10} fill="currentColor">{Math.round(v)}</text>)}
          <defs><clipPath id="lg-plot"><rect x={X(x0) - 6} y={Y(yMax) - 6} width={X(x1) - X(x0) + 12} height={Y(yMin) - Y(yMax) + 12} /></clipPath></defs>
          <g clipPath="url(#lg-plot)">
            <line x1={X(x0)} y1={Y(ys[0])} x2={X(x1)} y2={Y(ys[1])} stroke="#6366f1" strokeWidth={3} />
            {xs.map((v) => <circle key={v} cx={X(v)} cy={Y(y(m, c, v))} r={4} fill="#6366f1" />)}
          </g>
          {(!free || (c >= yMin && c <= yMax)) && <circle cx={X(Math.max(x0, 0))} cy={Y(c)} r={6} fill="none" stroke="#f59e0b" strokeWidth={2.5} />}
          <text x={W - 10} y={20} textAnchor="end" fontSize={11} fill="currentColor">{p.y}</text>
          <text x={W - 10} y={H - 30} textAnchor="end" fontSize={11} fill="currentColor">{p.x}</text>
        </svg>
        <div className="space-y-2">
          <p className="font-mono text-lg font-bold">{eqText(m, c)}</p>
          <label className="block text-sm">m (gradient) = <b>{n(m)}</b><Slider value={[m]} min={mRange[0]} max={mRange[1]} step={mRange[2]} onValueChange={([v]) => setM(Math.round(v * 10) / 10)} className="mt-1" aria-label="gradient m" /></label>
          <label className="block text-sm">c (starting value) = <b>{n(c)}</b><Slider value={[c]} min={cRange[0]} max={cRange[1]} step={cRange[2]} onValueChange={([v]) => setC(v)} className="mt-1" aria-label="intercept c" /></label>
          <table className="w-full rounded-xl border text-center text-xs">
            <thead><tr className="border-b"><th className="p-1">{free ? 'x' : p.x.split(' ')[0]}</th><th className="p-1">{free ? 'y' : p.y.split(' ')[0]}</th></tr></thead>
            <tbody className="font-mono">{xs.map((v) => <tr key={v}><td className="p-0.5">{n(Math.round(v * 10) / 10)}</td><td className="p-0.5">{n(y(m, c, v))}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Gradient m means" value={p.rate(m)} />
        <Readout label="Intercept c means" value={p.start(c)} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">When y changes by the <b>same amount</b> for every step in x, the points lie on a <b>straight line</b>: a linear relationship. The bigger |m|, the steeper the line; a negative m slopes downhill.</p>
    </LabFrame>
  )
}
