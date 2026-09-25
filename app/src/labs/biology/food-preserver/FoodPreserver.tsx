import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { hoursToSpoil, METHODS, microbesAfter, SPOILED } from './model'

const COLOURS = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#16a34a', '#ec4899', '#0ea5e9']
const HOURS = Array.from({ length: 49 }, (_, i) => i * 4) // 0–192 h (8 days)
const fmtTime = (h: number) => (h === Infinity ? 'months (no growth)' : h < 24 ? `${h.toFixed(0)} hours` : `${(h / 24).toFixed(1)} days`)

export default function FoodPreserver() {
  const [picked, setPicked] = useState<string[]>(['room', 'fridge'])
  const chosen = METHODS.filter((m) => picked.includes(m.id))
  const data = useMemo(() => HOURS.map((h) => Object.fromEntries([['h', h], ...chosen.map((m) => [m.id, +Math.log10(microbesAfter(h, m)).toFixed(2)])])), [chosen])
  return (
    <LabFrame labId="food-preserver" title="Food Preserver" subtitle="Microbes spoil food. Every preservation method, from pickles to fridges, works by stopping or slowing them." howTo={<p>Choose preservation methods for a bowl of freshly cooked dal and compare how quickly microbes build up. Food is spoiled when microbes reach the red line.</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {METHODS.map((m, i) => <button key={m.id} type="button" aria-pressed={picked.includes(m.id)} onClick={() => setPicked((p) => (p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id]))} className={cn('rounded-full border px-3 py-1 text-sm', picked.includes(m.id) ? 'font-semibold' : 'opacity-70 hover:bg-muted')} style={picked.includes(m.id) ? { borderColor: COLOURS[i], background: `${COLOURS[i]}22` } : undefined}>{m.emoji} {m.name}</button>)}
      </div>
      <div className="h-72 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="h" type="number" domain={[0, 192]} ticks={[0, 24, 48, 72, 96, 120, 144, 168, 192]} tickFormatter={(h) => `${h / 24}d`} tick={{ fontSize: 11 }} label={{ value: 'time (days)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis domain={[0, 9]} ticks={[0, 3, 5, 7, 9]} tickFormatter={(v) => `10^${v}`} tick={{ fontSize: 10 }} width={42} />
            <Tooltip formatter={(v) => `10^${v} per gram`} labelFormatter={(h) => `${h} hours`} />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={Math.log10(SPOILED)} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'spoiled', fontSize: 10, position: 'insideTopRight' }} />
            {chosen.map((m) => <Line key={m.id} dataKey={m.id} name={m.name} stroke={COLOURS[METHODS.indexOf(m)]} strokeWidth={2.5} dot={false} isAnimationActive={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {chosen.map((m) => <Readout key={m.id} label={`${m.name}: spoils after`} value={fmtTime(hoursToSpoil(m))} />)}
      </div>
      <div className="mt-3 space-y-1 text-sm">{chosen.map((m) => <p key={m.id}><b>{m.emoji} {m.name}:</b> {m.note}</p>)}</div>
      <p className="mt-2 text-xs text-muted-foreground">The graph uses a “log scale”: each step up means 10 times more microbes. This is a simplified model; always follow food-safety advice.</p>
    </LabFrame>
  )
}
