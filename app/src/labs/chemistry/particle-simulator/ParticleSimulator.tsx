import { Flame, Pause, RotateCcw, Snowflake } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { cssVar, randn, setupCanvas, useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import {
  SUBSTANCES,
  agitation,
  energyFromTemperature,
  maxEnergy,
  phaseLabel,
  stateFromEnergy,
  type Phase,
  type Substance,
  type ThermalState,
} from './model'

export type ParticleSimulatorProps = {
  substance?: string
  temperature?: number
  mode?: 'slider' | 'heat'
  /** hide the substance picker (lesson wants a specific substance) */
  lockSubstance?: boolean
  /** hide the mode switcher */
  lockMode?: boolean
}

const W = 480
const H = 300
const BOX = { left: 90, right: 350, top: 16, bottom: 284 }
const THERMO = { x: 410, top: 30, bottom: 250 }
const R = 7
const COLS = 8
const ROWS = 6
const SPACING = 2 * R + 1.5

type Particle = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; rank: number; seed: number }

function makeParticles(): Particle[] {
  const ps: Particle[] = []
  const x0 = (BOX.left + BOX.right) / 2 - ((COLS - 1) * SPACING) / 2
  const yBottom = BOX.bottom - R - 1
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const hx = x0 + col * SPACING
      const hy = yBottom - row * SPACING
      ps.push({ x: hx, y: hy, vx: 0, vy: 0, hx, hy, rank: 0, seed: Math.random() * 1000 })
    }
  }
  // top rows melt/boil first: rank 0 = top-most particle
  ps.map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.hy - b.p.hy || a.p.seed - b.p.seed)
    .forEach(({ p }, rank) => (p.rank = rank))
  return ps
}

function phaseOf(p: Particle, n: number, st: ThermalState): Phase {
  if (p.rank < Math.round(st.gasFrac * n)) return 'gas'
  if (p.rank < Math.round(st.meltFrac * n)) return 'liquid'
  return 'solid'
}

export default function ParticleSimulator({
  substance: initialSubstance = 'water',
  temperature: initialT,
  mode: initialMode = 'slider',
  lockSubstance = false,
  lockMode = false,
}: ParticleSimulatorProps) {
  const recordMilestone = useProgress((s) => s.recordLabMilestone)
  const [substanceId, setSubstanceId] = useState(initialSubstance)
  const substance = useMemo(() => SUBSTANCES.find((s) => s.id === substanceId) ?? SUBSTANCES[0], [substanceId])
  const [mode, setMode] = useState<'slider' | 'heat'>(initialMode)
  const [power, setPower] = useState<-1 | 0 | 1>(0)
  const [ui, setUi] = useState<ThermalState>(() => stateFromEnergy(substance, energyFromTemperature(substance, initialT ?? 20)))
  const [graph, setGraph] = useState<{ t: number; T: number }[]>([])
  const [event, setEvent] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const particles = useRef<Particle[]>(makeParticles())
  const energy = useRef(energyFromTemperature(substance, initialT ?? 20))
  const clock = useRef({ elapsed: 0, sinceUi: 0, sinceGraph: 0 })
  const prevState = useRef<ThermalState>(ui)

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, W, H)
  }, [])

  // switching substance: start at room temperature (clamped into its range)
  const selectSubstance = (s: Substance) => {
    setSubstanceId(s.id)
    const T = Math.max(s.tMin, Math.min(25, s.tMax))
    energy.current = energyFromTemperature(s, T)
    particles.current = makeParticles()
    const st = stateFromEnergy(s, energy.current)
    prevState.current = st
    setUi(st)
    setGraph([])
    setPower(0)
    setEvent(null)
  }

  const setTemperature = (T: number) => {
    energy.current = energyFromTemperature(substance, T)
    const st = stateFromEnergy(substance, energy.current)
    detectEvents(st)
    setUi(st)
  }

  const detectEvents = (st: ThermalState) => {
    const prev = prevState.current
    const s = substance
    if (s.sublimes) {
      if (prev.gasFrac < 1 && st.gasFrac === 1) announce('sublime', `Sublimation complete! ${s.names.solid} turned straight into gas at ${s.mp} °C, with no liquid in between.`)
      if (prev.gasFrac > 0 && st.gasFrac === 0) announce('deposit', `Deposition! The gas turned straight back into a solid at ${s.mp} °C.`)
    } else {
      if (prev.meltFrac < 1 && st.meltFrac === 1 && st.gasFrac === 0) announce('melt', `All melted! Did you notice the temperature stayed at ${s.mp} °C while melting? The heat energy was used to overcome the forces between particles.`)
      if (prev.gasFrac < 1 && st.gasFrac === 1) announce('boil', `All boiled! The temperature stayed at ${s.bp} °C until every particle had enough energy to escape into the gas.`)
      if (prev.gasFrac > 0 && st.gasFrac === 0 && st.meltFrac === 1) announce('condense', `Condensation! The gas cooled and particles came close together to form a liquid.`)
      if (prev.meltFrac > 0 && st.meltFrac === 0) announce('freeze', `Frozen solid! The particles settled back into fixed positions at ${s.mp} °C. The freezing point equals the melting point.`)
    }
    prevState.current = st
  }

  const announce = (key: string, text: string) => {
    setEvent(text)
    recordMilestone(`particles:${key}`)
  }

  const heatingActive = mode === 'heat' && power !== 0

  useAnimationFrame((dt, time) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const s = substance

    // --- thermal update ---
    if (heatingActive) {
      const max = maxEnergy(s)
      energy.current = Math.max(0, Math.min(max, energy.current + power * dt))
      if ((power > 0 && energy.current >= max) || (power < 0 && energy.current <= 0)) setPower(0)
    }
    const st = stateFromEnergy(s, energy.current)
    const c = clock.current
    c.elapsed += dt
    c.sinceUi += dt
    c.sinceGraph += dt
    if (c.sinceUi > 0.1) {
      c.sinceUi = 0
      if (heatingActive) detectEvents(st)
      setUi(st)
    }
    if (heatingActive && c.sinceGraph > 0.25) {
      c.sinceGraph = 0
      setGraph((g) => [...g.slice(-240), { t: Math.round(c.elapsed * 10) / 10, T: Math.round(st.temperature * 10) / 10 }])
    }

    // --- particle physics ---
    const ps = particles.current
    const n = ps.length
    const phases = ps.map((p) => phaseOf(p, n, st))
    const steps = 2
    const h = dt / steps
    for (let step = 0; step < steps; step++) {
      for (let i = 0; i < n; i++) {
        const p = ps[i]
        const ph = phases[i]
        const a = agitation(s, st.temperature, ph)
        if (ph === 'solid') {
          const amp = 0.6 + 3 * a
          const tx = p.hx + amp * Math.sin(time * (18 + (p.seed % 7)) + p.seed)
          const ty = p.hy + amp * Math.cos(time * (21 + (p.seed % 5)) + p.seed * 1.7)
          const k = Math.min(1, h * 10)
          p.vx = 0
          p.vy = 0
          p.x += (tx - p.x) * k
          p.y += (ty - p.y) * k
          continue
        }
        const target = ph === 'gas' ? 140 + 180 * a : 45 + 55 * a
        if (ph === 'liquid') {
          // Langevin thermostat: random kicks balanced by damping give an average speed ≈ target
          const gamma = 2.5
          const kick = target * Math.sqrt(2 * gamma * h)
          p.vy += 450 * h
          p.vx += randn() * kick
          p.vy += randn() * kick
          const damp = Math.max(0, 1 - gamma * h)
          p.vx *= damp
          p.vy *= damp
        } else {
          const sp = Math.hypot(p.vx, p.vy) || 1
          const f = 1 + (target / sp - 1) * Math.min(1, h * 4)
          p.vx *= f
          p.vy *= f
          if (sp < 5) {
            p.vx = randn() * target
            p.vy = -Math.abs(randn() * target)
          }
        }
        p.x += p.vx * h
        p.y += p.vy * h
        if (p.x < BOX.left + R) (p.x = BOX.left + R), (p.vx = Math.abs(p.vx))
        if (p.x > BOX.right - R) (p.x = BOX.right - R), (p.vx = -Math.abs(p.vx))
        if (p.y < BOX.top + R) (p.y = BOX.top + R), (p.vy = Math.abs(p.vy))
        if (p.y > BOX.bottom - R) (p.y = BOX.bottom - R), (p.vy = -Math.abs(p.vy) * (ph === 'liquid' ? 0.2 : 1))
      }
      // collisions
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const pi = ps[i]
          const pj = ps[j]
          const dx = pj.x - pi.x
          const dy = pj.y - pi.y
          const d2 = dx * dx + dy * dy
          const minD = 2 * R
          // cohesion: liquid particles attract neighbours slightly, so a liquid stays together as a puddle
          if (d2 >= minD * minD) {
            const reach = 3 * R
            if (phases[i] === 'liquid' && phases[j] === 'liquid' && d2 < reach * reach) {
              const d = Math.sqrt(d2)
              const pull = (700 * h) / d
              pi.vx += dx * pull
              pi.vy += dy * pull
              pj.vx -= dx * pull
              pj.vy -= dy * pull
            }
            continue
          }
          if (d2 === 0) continue
          const d = Math.sqrt(d2)
          const nx = dx / d
          const ny = dy / d
          const overlap = minD - d
          const si = phases[i] === 'solid'
          const sj = phases[j] === 'solid'
          if (si && sj) continue
          if (si) {
            pj.x += nx * overlap
            pj.y += ny * overlap
            const vn = pj.vx * nx + pj.vy * ny
            if (vn < 0) (pj.vx -= 1.6 * vn * nx), (pj.vy -= 1.6 * vn * ny)
          } else if (sj) {
            pi.x -= nx * overlap
            pi.y -= ny * overlap
            const vn = pi.vx * nx + pi.vy * ny
            if (vn > 0) (pi.vx -= 1.6 * vn * nx), (pi.vy -= 1.6 * vn * ny)
          } else {
            pi.x -= (nx * overlap) / 2
            pi.y -= (ny * overlap) / 2
            pj.x += (nx * overlap) / 2
            pj.y += (ny * overlap) / 2
            // exchange normal velocity components (elastic collision of equal masses)
            const vi = pi.vx * nx + pi.vy * ny
            const vj = pj.vx * nx + pj.vy * ny
            if (vi - vj > 0) {
              pi.vx += (vj - vi) * nx
              pi.vy += (vj - vi) * ny
              pj.vx += (vi - vj) * nx
              pj.vy += (vi - vj) * ny
            }
          }
        }
      }
    }

    // --- draw ---
    ctx.clearRect(0, 0, W, H)
    const border = cssVar('--border', '#ddd')
    const fg = cssVar('--muted-foreground', '#666')
    ctx.fillStyle = cssVar('--muted', '#f4f4f5')
    ctx.globalAlpha = 0.5
    ctx.fillRect(BOX.left, BOX.top, BOX.right - BOX.left, BOX.bottom - BOX.top)
    ctx.globalAlpha = 1
    ctx.strokeStyle = border
    ctx.lineWidth = 2
    ctx.strokeRect(BOX.left, BOX.top, BOX.right - BOX.left, BOX.bottom - BOX.top)

    for (let i = 0; i < n; i++) {
      const p = ps[i]
      const ph = phases[i]
      ctx.beginPath()
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2)
      ctx.fillStyle = s.color
      ctx.globalAlpha = ph === 'gas' ? 0.85 : 1
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.stroke()
      // shine
      ctx.beginPath()
      ctx.arc(p.x - 2.2, p.y - 2.2, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fill()
    }

    // heat source indicator
    if (heatingActive) {
      ctx.font = '600 13px system-ui'
      ctx.fillStyle = power > 0 ? '#f97316' : '#38bdf8'
      ctx.fillText(power > 0 ? '🔥 Heating…' : '❄️ Cooling…', BOX.left + 8, BOX.top + 18)
    }
    // thermometer
    const frac = (st.temperature - s.tMin) / (s.tMax - s.tMin)
    const tubeTop = THERMO.top
    const tubeBottom = THERMO.bottom
    ctx.fillStyle = cssVar('--background', '#fff')
    ctx.strokeStyle = border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(THERMO.x - 7, tubeTop - 7, 14, tubeBottom - tubeTop + 14, 7)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(THERMO.x, tubeBottom + 16, 13, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()
    const level = tubeBottom - frac * (tubeBottom - tubeTop)
    ctx.fillRect(THERMO.x - 3.5, level, 7, tubeBottom - level + 8)
    ctx.font = '11px system-ui'
    ctx.fillStyle = fg
    const mark = (t: number, label: string) => {
      const y = tubeBottom - ((t - s.tMin) / (s.tMax - s.tMin)) * (tubeBottom - tubeTop)
      ctx.fillRect(THERMO.x + 8, y - 0.75, 8, 1.5)
      ctx.fillText(label, THERMO.x + 19, y + 4)
    }
    if (s.sublimes) mark(s.mp, `${s.mp}° sublimes`)
    else {
      mark(s.mp, `${s.mp}° melts`)
      mark(s.bp, `${s.bp}° boils`)
    }
  })

  const label = phaseLabel(substance, ui)
  const T = ui.temperature
  const tempDisplay = Math.abs(T) >= 100 ? T.toFixed(0) : T.toFixed(1)

  return (
    <LabFrame
      labId="particle-simulator"
      title="Particle Simulator"
      subtitle="Change the temperature and watch the particles"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Set temperature</b>: drag the slider and compare how particles behave as a solid, a liquid and a gas.</li>
          <li><b>Heat &amp; cool</b>: press Heat or Cool and watch the heating curve being drawn. Look for the flat parts!</li>
          <li>Try <b>carbon dioxide</b> to see sublimation, and <b>oxygen</b> to see why it is a gas in our air.</li>
        </ul>
      }
    >
      {!lockSubstance && (
        <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Substance">
          {SUBSTANCES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === substance.id}
              onClick={() => selectSubstance(s)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition',
                s.id === substance.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted',
              )}
            >
              <span className="size-3 rounded-full border border-black/20" style={{ background: s.color }} />
              {s.name} <span className="text-muted-foreground">{s.formula}</span>
            </button>
          ))}
        </div>
      )}

      {!lockMode && (
        <div className="mb-3 inline-flex rounded-lg border p-1 text-sm" role="tablist" aria-label="Mode">
          {(['slider', 'heat'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setPower(0)
              }}
              className={cn('rounded-md px-3 py-1', mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {m === 'slider' ? '🌡️ Set temperature' : '🔥 Heat & cool'}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', aspectRatio: `${W} / ${H}` }}
            className="rounded-xl"
            role="img"
            aria-label={`${substance.name} particles at ${tempDisplay} degrees Celsius: ${label.phase}. ${label.detail}`}
          />
          <p className="mt-1 text-center text-xs text-muted-foreground">Particle model: imagine zooming in millions of times</p>
          {mode === 'slider' ? (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{substance.tMin} °C</span>
                <span>{substance.tMax} °C</span>
              </div>
              <Slider
                value={[Math.round(T)]}
                min={substance.tMin}
                max={substance.tMax}
                step={1}
                onValueChange={([v]) => setTemperature(v)}
                aria-label="Temperature"
                className="[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2"
              />
              <p className="text-xs text-muted-foreground">
                Melting point: <b>{substance.sublimes ? '— (sublimes)' : `${substance.mp} °C`}</b> · Boiling point:{' '}
                <b>{substance.sublimes ? `sublimes at ${substance.mp} °C` : `${substance.bp} °C`}</b>
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => setPower(1)} variant={power === 1 ? 'default' : 'outline'} size="lg">
                <Flame /> Heat
              </Button>
              <Button onClick={() => setPower(-1)} variant={power === -1 ? 'default' : 'outline'} size="lg">
                <Snowflake /> Cool
              </Button>
              <Button onClick={() => setPower(0)} variant="outline" size="lg" disabled={power === 0}>
                <Pause /> Pause
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  energy.current = 0
                  particles.current = makeParticles()
                  clock.current.elapsed = 0
                  setGraph([])
                  setPower(0)
                  setEvent(null)
                  const st = stateFromEnergy(substance, 0)
                  prevState.current = st
                  setUi(st)
                }}
              >
                <RotateCcw /> Start cold
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Readout label="Temperature" value={`${tempDisplay} °C`} />
          <Readout
            label="State"
            value={
              ui.gasFrac === 1
                ? substance.names.gas
                : ui.meltFrac === 1 && ui.gasFrac === 0
                  ? substance.names.liquid
                  : ui.meltFrac === 0
                    ? substance.names.solid
                    : label.phase
            }
          />
          <div className="rounded-xl border bg-chem-soft px-3 py-2 text-sm">
            <p className="font-semibold">{label.phase}</p>
            <p className="text-muted-foreground">{label.detail}</p>
          </div>
          <StateBars st={ui} sublimes={substance.sublimes} />
        </div>
      </div>

      {event && (
        <div role="status" className="mt-3 rounded-xl border border-success/40 bg-success-soft px-4 py-3 text-sm">
          🎉 {event}
        </div>
      )}

      {mode === 'heat' && (
        <div className="mt-4">
          <p className="mb-1 text-sm font-semibold">Heating curve: temperature over time</p>
          <div className="h-56 w-full rounded-xl border bg-background p-2">
            {graph.length < 2 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Press <b className="mx-1">Heat</b> to start drawing the graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graph} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 11 }} label={{ value: 'time (s)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
                  <YAxis domain={[substance.tMin, substance.tMax]} tick={{ fontSize: 11 }} width={44} unit="°" />
                  <Tooltip formatter={(v) => [`${v} °C`, 'Temperature']} labelFormatter={(l) => `${l} s`} />
                  {!substance.sublimes && <ReferenceLine y={substance.mp} stroke="#0ea5e9" strokeDasharray="4 4" label={{ value: `melting point ${substance.mp}°`, fontSize: 10, position: 'insideTopLeft' }} />}
                  <ReferenceLine y={substance.bp} stroke="#f97316" strokeDasharray="4 4" label={{ value: substance.sublimes ? `sublimes ${substance.bp}°` : `boiling point ${substance.bp}°`, fontSize: 10, position: 'insideTopLeft' }} />
                  <Line type="monotone" dataKey="T" stroke="var(--chem)" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">💡 {substance.fact}</p>
    </LabFrame>
  )
}

function StateBars({ st, sublimes }: { st: ThermalState; sublimes?: boolean }) {
  const solid = 1 - st.meltFrac
  const gas = st.gasFrac
  const liquid = Math.max(0, st.meltFrac - st.gasFrac)
  const rows = [
    { label: 'Solid', v: solid, color: 'bg-sky-700' },
    ...(sublimes ? [] : [{ label: 'Liquid', v: liquid, color: 'bg-sky-400' }]),
    { label: 'Gas', v: gas, color: 'bg-orange-400' },
  ]
  return (
    <div className="space-y-1.5 rounded-xl border bg-background px-3 py-2" aria-label="How much is solid, liquid and gas">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-xs">
          <span className="w-10 text-muted-foreground">{r.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full transition-[width]', r.color)} style={{ width: `${r.v * 100}%` }} />
          </div>
          <span className="w-8 text-right tabular-nums">{Math.round(r.v * 100)}%</span>
        </div>
      ))}
    </div>
  )
}
