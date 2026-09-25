import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CELLS, MATERIALS, stepRod } from './model'

const HOT = 80
const ROOM = 25
const PINS = [4, 8, 12, 16, 19]
const heat = (t: number) => {
  const f = Math.max(0, Math.min(1, (t - ROOM) / (HOT - ROOM)))
  return `rgba(239, 68, 68, ${f * 0.85})`
}
const fresh = () => MATERIALS.map(() => Array(CELLS).fill(ROOM) as number[])

export default function HeatFlow() {
  const [running, setRunning] = useState(false)
  const [picked, setPicked] = useState<string[]>(['copper', 'steel', 'wood'])
  const sim = useRef({ T: fresh(), time: 0, warm: MATERIALS.map(() => null as number | null), acc: 0 })
  const [ui, setUi] = useState({ T: sim.current.T, time: 0, warm: sim.current.warm })

  useAnimationFrame((dt) => {
    const s = sim.current
    const step = dt * 2 // lab clock runs at 2× speed
    s.time += step
    s.T = s.T.map((rod, i) => stepRod(rod, MATERIALS[i].alpha, step, HOT, ROOM))
    s.warm = s.warm.map((w, i) => (w === null && s.T[i][CELLS - 1] >= 40 ? s.time : w))
    s.acc += dt
    if (s.acc > 0.08) {
      s.acc = 0
      setUi({ T: s.T, time: s.time, warm: s.warm })
    }
    if (s.time > 120) setRunning(false)
  }, running)

  const reset = () => {
    sim.current = { T: fresh(), time: 0, warm: MATERIALS.map(() => null), acc: 0 }
    setUi({ T: sim.current.T, time: 0, warm: sim.current.warm })
    setRunning(false)
  }
  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]))
  }
  const rows = MATERIALS.map((m, i) => ({ m, i })).filter(({ m }) => picked.includes(m.id))
  const RH = 46

  return (
    <LabFrame labId="heat-flow" title="Heat Flow: The Spoon Race" subtitle="Dip spoons of different materials into hot chai. Whose handle gets hot first?" howTo={<p>Choose up to four materials, predict the order, then start the race. Wax holds a pin at five points along each spoon. When the heat reaches a pin, the wax melts and the pin drops.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {MATERIALS.map((m) => (
          <button key={m.id} type="button" disabled={running || ui.time > 0} onClick={() => toggle(m.id)} aria-pressed={picked.includes(m.id)} className={cn('rounded-full border px-3 py-1.5 text-sm disabled:opacity-60', picked.includes(m.id) ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{m.emoji} {m.name}</button>
        ))}
      </div>
      <svg viewBox={`0 0 520 ${rows.length * RH + 30}`} className="w-full rounded-2xl border bg-background" role="img" aria-label="Spoons dipped in hot chai, coloured by temperature">
        <rect x={6} y={8} width={70} height={rows.length * RH + 14} rx={10} fill="#b45309" opacity={0.75} />
        <text x={41} y={rows.length * RH + 16} textAnchor="middle" fontSize={10} fill="#fff">chai 80 °C</text>
        {rows.map(({ m, i }, r) => {
          const y = 16 + r * RH
          const T = ui.T[i]
          const cw = 420 / CELLS
          return (
            <g key={m.id}>
              {T.map((t, c) => (
                <g key={c}>
                  <rect x={40 + c * cw} y={y + 10} width={cw + 0.5} height={12} fill={m.colour} />
                  <rect x={40 + c * cw} y={y + 10} width={cw + 0.5} height={12} fill={heat(t)} />
                </g>
              ))}
              {PINS.map((p) => {
                const fallen = T[p] > 50
                return <text key={p} x={40 + p * cw + cw / 2} y={fallen ? y + 42 : y + 8} textAnchor="middle" fontSize={11} style={{ transition: 'y 0.4s' }}>{fallen ? '📍' : '📌'}</text>
              })}
              <text x={468} y={y + 20} fontSize={11} className="fill-foreground">{T[CELLS - 1].toFixed(0)} °C</text>
              <text x={100} y={y + 36} fontSize={10} className="fill-muted-foreground">{m.name}</text>
            </g>
          )
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={() => setRunning((x) => !x)} disabled={ui.time > 120}>{running ? '⏸ Pause' : ui.time > 0 ? '▶ Resume' : '▶ Start the race'}</Button>
        <Button variant="outline" onClick={reset}>↺ Reset</Button>
        <Readout label="Lab time" value={`${ui.time.toFixed(0)} s`} className="min-w-28" />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
        {rows.map(({ m, i }) => (
          <Readout key={m.id} label={`${m.name}: handle reaches 40 °C`} value={ui.warm[i] !== null ? `${ui.warm[i]!.toFixed(1)} s` : ui.time > 0 ? 'not yet…' : '–'} />
        ))}
      </div>
      {ui.time > 20 && (
        <p role="status" className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
          Metals are good <b>conductors</b>: their particles (and free electrons) pass heat along quickly. Wood, plastic and glass are <b>insulators</b>: heat creeps through them very slowly. That's why pan handles are made of wood or plastic, and why a steel spoon left in chai gets hot at the end.
        </p>
      )}
    </LabFrame>
  )
}
