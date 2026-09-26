import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { days, SCENARIOS } from './model'

export default function WorkersAndDays() {
  const [si, setSi] = useState(0)
  const s = SCENARIOS[si]
  const min = 'min' in s ? s.min : 1
  const step = 'step' in s ? s.step : 1
  const [x, setX] = useState<number>(3)
  const y = days(x, s.work)
  const W = 300
  const H = 200
  const X = (v: number) => 35 + ((v - min) / (s.max - min)) * (W - 50)
  const yTop = days(min, s.work)
  const Y = (v: number) => H - 25 - (v / yTop) * (H - 40)
  const curve = Array.from({ length: 60 }, (_, i) => min + ((s.max - min) * i) / 59).map((v) => `${X(v)},${Y(days(v, s.work))}`).join(' ')
  const pick = (i: number) => { setSi(i); const q = SCENARIOS[i]; setX('min' in q ? q.min * 2 : 3) }
  return (
    <LabFrame labId="workers-and-days" title="Workers and Days" subtitle="Inverse proportion: more workers, fewer days. The product stays the same." howTo={<p>Choose a situation and change the slider. Watch the rectangle: its width × height (the total work) never changes.</p>}>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((q, i) => <button key={q.id} type="button" aria-pressed={si === i} onClick={() => pick(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', si === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{q.emoji} {q.name}</button>)}
      </div>
      <label className="mt-3 block text-sm">{s.x}: <b>{x}</b><Slider value={[x]} min={min} max={s.max} step={step} onValueChange={([v]) => setX(v)} className="mt-1" aria-label={s.x} /></label>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${x} ${s.x} and ${y} ${s.y}; the rectangle area stays ${s.work}`}>
          <rect x={35} y={Y(y)} width={X(x) - 35} height={H - 25 - Y(y)} fill="#6366f1" fillOpacity={0.25} stroke="#6366f1" />
          <polyline points={curve} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
          <circle cx={X(x)} cy={Y(y)} r={5} fill="#6366f1" />
          <line x1={35} y1={H - 25} x2={W - 10} y2={H - 25} stroke="currentColor" />
          <line x1={35} y1={H - 25} x2={35} y2={10} stroke="currentColor" />
          <text x={W - 10} y={H - 8} textAnchor="end" fontSize={10} fill="currentColor">{s.x} →</text>
          <text x={39} y={16} fontSize={10} fill="currentColor">↑ {s.y}</text>
        </svg>
        <div className="space-y-2">
          <Readout label={s.y} value={`${s.work} ÷ ${x} = ${Math.round(y * 100) / 100}`} />
          <Readout label={`${s.x} × ${s.y}`} value={`${x} × ${Math.round(y * 100) / 100} = ${s.work}`} />
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Double the {s.x.split(' ')[0]}, halve the {s.y.split(' ')[0]}. The product always stays {s.work}: that's <b>inverse proportion</b>. The graph is a curve, not a straight line, and it never touches the axes.</p>
        </div>
      </div>
    </LabFrame>
  )
}
