import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { COLD_CONTAINERS, effectiveK, HOT_CONTAINERS, minutesAbove, targetFor, tempAt } from './model'

const MINUTES = Array.from({ length: 25 }, (_, i) => i * 10) // 0–240 min

export default function FlaskLab() {
  const [mode, setMode] = useState<'hot' | 'cold'>('hot')
  const [picked, setPicked] = useState<string[]>(['steel', 'flask'])
  const [lid, setLid] = useState(false)
  const list = mode === 'hot' ? HOT_CONTAINERS : COLD_CONTAINERS
  const start = mode === 'hot' ? 90 : 30
  const room = mode === 'hot' ? 28 : 38
  const chosen = list.filter((c) => picked.includes(c.id))

  const data = useMemo(
    () => MINUTES.map((t) => Object.fromEntries([['t', t], ...chosen.map((c) => [c.id, Math.round(tempAt(start, targetFor(c, room), effectiveK(c, lid), t) * 10) / 10])])),
    [chosen, start, room, lid],
  )
  const switchMode = (m: 'hot' | 'cold') => {
    setMode(m)
    setPicked(m === 'hot' ? ['steel', 'flask'] : ['plastic', 'matka'])
  }
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <LabFrame labId="flask-lab" title="Flask Lab: Keep It Hot, Keep It Cold" subtitle="Insulators slow down heat flow. Which container wins?" howTo={<p>Hot mode: pour 90 °C chai into different containers and watch them cool over four hours. Can any keep it above 60 °C for two hours? Cold mode: keep 30 °C water cool on a 38 °C Chennai afternoon.</p>}>
      <div className="mb-3 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['hot', '☕ Keep chai hot'], ['cold', '💧 Keep water cool']] as const).map(([m, lbl]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={cn('rounded-md px-3 py-1', mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {list.map((c) => (
          <button key={c.id} type="button" aria-pressed={picked.includes(c.id)} onClick={() => toggle(c.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', picked.includes(c.id) ? 'font-semibold' : 'opacity-70 hover:bg-muted')} style={picked.includes(c.id) ? { borderColor: c.colour, background: `${c.colour}22` } : undefined}>{c.emoji} {c.name}</button>
        ))}
        {mode === 'hot' && (
          <label className="ml-2 flex items-center gap-1.5 text-sm"><input type="checkbox" checked={lid} onChange={(e) => setLid(e.target.checked)} className="size-4" /> Put a lid on</label>
        )}
      </div>
      <div className="h-72 rounded-2xl border bg-background p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="t" type="number" domain={[0, 240]} ticks={[0, 60, 120, 180, 240]} tick={{ fontSize: 11 }} label={{ value: 'time (minutes)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
            <YAxis domain={mode === 'hot' ? [20, 100] : [20, 40]} tick={{ fontSize: 11 }} width={40} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v} °C`} labelFormatter={(l) => `${l} min`} />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            {mode === 'hot' ? <ReferenceLine y={60} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'nice and hot: 60 °C', fontSize: 10, position: 'insideTopRight' }} /> : <ReferenceLine y={room} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `room ${room} °C`, fontSize: 10, position: 'insideBottomRight' }} />}
            {chosen.map((c) => <Line key={c.id} dataKey={c.id} name={c.name} stroke={c.colour} strokeWidth={2.5} dot={false} isAnimationActive={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {chosen.map((c) => {
          const k = effectiveK(c, lid)
          const tgt = targetFor(c, room)
          return mode === 'hot' ? (
            <Readout key={c.id} label={`${c.name}: above 60 °C for`} value={(() => { const m = minutesAbove(start, tgt, k, 60); return m > 240 ? 'over 4 hours' : `${Math.round(m)} min` })()} />
          ) : (
            <Readout key={c.id} label={`${c.name}: after 4 hours`} value={`${tempAt(start, tgt, k, 240).toFixed(1)} °C`} />
          )
        })}
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm" role="status">
        {mode === 'hot'
          ? 'A vacuum flask stops all three kinds of heat transfer: the vacuum between its double walls blocks conduction and convection, and the silvery surfaces reflect radiation. The stopper also stops evaporation.'
          : 'Water seeps through the tiny pores of a clay matka and evaporates from its outer surface. Evaporation takes heat from the pot, so the water inside stays cooler than the room: an ancient Indian fridge! Insulated bottles just slow the heat getting in.'}
      </p>
    </LabFrame>
  )
}
