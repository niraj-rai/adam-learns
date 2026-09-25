import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { convectionVelocity, radiationStep, SURFACES } from './model'

const W = 240
const H = 180
const N = 60
const seed = () => Array.from({ length: N }, () => ({ x: 0.45 + Math.random() * 0.1, y: 0.02 + Math.random() * 0.08 }))

export default function ConvectionRadiation() {
  const [tab, setTab] = useState<'convection' | 'radiation'>('convection')
  return (
    <LabFrame labId="convection-radiation" title="Convection and Radiation" subtitle="Heat can travel by currents in liquids and gases, and even across empty space." howTo={<p>Tab 1: drop a purple crystal (potassium permanganate) into a pot of water and heat it. Watch the currents. Try heating from the top instead! Tab 2: shine a lamp on three cans and compare how fast they warm up and cool down.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['convection', '🌀 Convection'], ['radiation', '☀️ Radiation']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'convection' ? <Convection /> : <Radiation />}
    </LabFrame>
  )
}

function Convection() {
  const [flame, setFlame] = useState(3)
  const [fromTop, setFromTop] = useState(false)
  const [time, setTime] = useState(0)
  const p = useRef(seed())
  const [, force] = useState(0)

  useAnimationFrame((dt) => {
    const speed = 0.018 * flame
    for (const q of p.current) {
      if (fromTop) {
        // heating from the top: warm water stays at the top, no currents, only slow spreading
        q.x += (Math.random() - 0.5) * 0.004
        q.y += (Math.random() - 0.5) * 0.002
      } else {
        const v = convectionVelocity(q.x, q.y)
        q.x += (v.vx * speed + (Math.random() - 0.5) * 0.01) * dt * 3
        q.y += (v.vy * speed + (Math.random() - 0.5) * 0.01) * dt * 3
      }
      q.x = Math.min(0.99, Math.max(0.01, q.x))
      q.y = Math.min(0.99, Math.max(0.01, q.y))
    }
    setTime((t) => t + dt)
    force((n) => (n + 1) % 1000)
  }, flame > 0)

  const reset = (top = fromTop) => {
    p.current = top ? Array.from({ length: N }, () => ({ x: 0.45 + Math.random() * 0.1, y: 0.02 + Math.random() * 0.08 })) : seed()
    setTime(0)
  }
  const warmTop = fromTop ? Math.min(1, time / 20) : 0

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox={`0 0 ${W + 40} ${H + 60}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={fromTop ? 'Pot heated from the top: the purple colour stays near the bottom' : 'Pot heated from below: purple streams rise in the middle and sink at the sides'}>
        <defs>
          <linearGradient id="topwarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ef4444" stopOpacity={0.35 * warmTop} />
            <stop offset="0.35" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={20} y={20} width={W} height={H} fill="#bae6fd" opacity={0.6} />
        {fromTop && <rect x={20} y={20} width={W} height={H} fill="url(#topwarm)" />}
        {p.current.map((q, i) => <circle key={i} cx={20 + q.x * W} cy={20 + (1 - q.y) * H} r={3} fill="#7e22ce" opacity={0.75} />)}
        <path d={`M18 18 V${H + 22} H${W + 22} V18`} fill="none" stroke="currentColor" strokeOpacity={0.6} strokeWidth={3} />
        {flame > 0 && !fromTop && <text x={20 + W / 2} y={H + 50} textAnchor="middle" fontSize={20 + flame * 3}>🔥</text>}
        {flame > 0 && fromTop && <text x={20 + W / 2} y={16} textAnchor="middle" fontSize={16}>🔥 heater at the top</text>}
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Flame: <b>{['off', 'very low', 'low', 'medium', 'high', 'very high'][flame]}</b>
          <Slider value={[flame]} min={0} max={5} step={1} onValueChange={([v]) => setFlame(v)} className="mt-1.5" aria-label="Flame strength" />
        </label>
        <div className="flex gap-2">
          <Button variant={fromTop ? 'outline' : 'default'} size="sm" onClick={() => { setFromTop(false); reset(false) }}>Heat from below</Button>
          <Button variant={fromTop ? 'default' : 'outline'} size="sm" onClick={() => { setFromTop(true); reset(true) }}>Heat from the top</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => reset()}>↺ Drop a new crystal</Button>
        <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">
          {fromTop
            ? 'Heated from the top, the warm water is already at the top, so it has nowhere to rise. There are no convection currents, and the bottom stays cool for a long time.'
            : flame === 0
              ? 'No heat, no currents: the purple colour just spreads very slowly.'
              : 'Water at the bottom warms, expands, becomes less dense and rises. Cooler, denser water sinks at the sides to take its place. This loop is a convection current.'}
        </p>
      </div>
    </div>
  )
}

function Radiation() {
  const [lamp, setLamp] = useState(false)
  const [temps, setTemps] = useState(SURFACES.map(() => 25))
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const acc = useRef({ T: SURFACES.map(() => 25), t: 0 })

  useAnimationFrame((dt) => {
    const step = dt * 4
    acc.current.T = acc.current.T.map((t, i) => radiationStep(t, SURFACES[i].absorb, lamp, step))
    acc.current.t += step
    setTemps(acc.current.T)
    setTime(acc.current.t)
  }, running)

  const reset = () => {
    acc.current = { T: SURFACES.map(() => 25), t: 0 }
    setTemps(acc.current.T)
    setTime(0)
    setRunning(false)
    setLamp(false)
  }

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 190" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Three cans under a lamp that is ${lamp ? 'on' : 'off'}`}>
        <defs>
          <linearGradient id="foil" x1="0" x2="1">
            <stop offset="0" stopColor="#e5e7eb" /><stop offset="0.5" stopColor="#ffffff" /><stop offset="1" stopColor="#9ca3af" />
          </linearGradient>
        </defs>
        <text x={180} y={34} textAnchor="middle" fontSize={28} opacity={lamp ? 1 : 0.3}>💡</text>
        {lamp && [80, 180, 280].map((x) => <line key={x} x1={180} y1={40} x2={x} y2={100} stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" />)}
        {SURFACES.map((s, i) => (
          <g key={s.id}>
            <rect x={55 + i * 100} y={100} width={50} height={70} rx={6} fill={s.fill} stroke="#475569" />
            <text x={80 + i * 100} y={186} textAnchor="middle" fontSize={10} className="fill-foreground">{s.name}</text>
            <text x={80 + i * 100} y={92} textAnchor="middle" fontSize={11} className="fill-foreground">{temps[i].toFixed(1)} °C</text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setLamp(true); setRunning(true) }} disabled={lamp && running}>💡 Lamp on</Button>
        <Button variant="outline" onClick={() => { setLamp(false); setRunning(true) }} disabled={!lamp}>🌙 Lamp off (let them cool)</Button>
        <Button variant="ghost" onClick={reset}>↺ Reset</Button>
        <Readout label="Lab time" value={`${time.toFixed(0)} s`} className="min-w-28" />
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {time === 0
          ? 'Predict: which can will warm up fastest? Which will cool fastest when the lamp goes off?'
          : lamp
            ? 'Dull black surfaces absorb radiation best; white and shiny surfaces reflect most of it. Radiation needs no medium: the Sun heats the Earth across empty space!'
            : 'Now the black can also cools fastest: good absorbers are also good emitters. Shiny surfaces keep heat in, which is why flasks are silvered inside.'}
      </p>
    </div>
  )
}
