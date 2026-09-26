import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CRATE_KG, SURFACES, describe, step } from './model'

const W = 560
const TRACK = 16 // metres shown; the crate wraps around

function Arrow({ x, y, len, color, label }: { x: number; y: number; len: number; color: string; label: string }) {
  if (Math.abs(len) < 1) return null
  const end = x + len
  const dir = Math.sign(len)
  return (
    <g>
      <line x1={x} y1={y} x2={end - dir * 8} y2={y} stroke={color} strokeWidth={5} />
      <path d={`M${end},${y} L${end - dir * 12},${y - 8} L${end - dir * 12},${y + 8} Z`} fill={color} />
      <text x={x + len / 2} y={y - 10} textAnchor="middle" fontSize={11} fill={color} fontWeight={600}>{label}</text>
    </g>
  )
}

export default function ForceArena() {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(40)
  const [sid, setSid] = useState('tiles')
  const [running, setRunning] = useState(false)
  const [state, setState] = useState({ x: 2, v: 0, net: 0, friction: 0 })
  const surface = SURFACES.find((s) => s.id === sid)!
  const push = right - left
  const pushRef = useRef(push)
  pushRef.current = push
  const surfRef = useRef(surface)
  surfRef.current = surface

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setState((s) => {
        const r = step(s.v, pushRef.current, surfRef.current, dt)
        const x = (((s.x + r.v * dt) % TRACK) + TRACK) % TRACK
        return { x, v: r.v, net: r.net, friction: r.friction }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // the forces acting right now (a zero-length step), shown even when paused
  const now = step(state.v, push, surface, 0)
  const net = now.net
  const cx = 20 + (state.x / TRACK) * (W - 40)
  const scale = 1.2
  const reset = () => { setRunning(false); setState({ x: 2, v: 0, net: 0, friction: 0 }) }

  return (
    <LabFrame labId="force-arena" title="Force Arena" subtitle="Balanced forces keep motion the same. Unbalanced forces change it." howTo={<p>Set how hard each team pushes the 10 kg crate, pick a floor, then press Play. Try giving the crate a push on ice or with no friction, then set both pushes to zero.</p>}>
      <svg viewBox={`0 0 ${W} 170`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Crate moving at ${state.v.toFixed(1)} m/s; resultant force ${net.toFixed(0)} N`}>
        <rect x={0} y={120} width={W} height={50} fill={sid === 'ice' ? '#bae6fd' : sid === 'carpet' ? '#a16207' : sid === 'none' ? '#e2e8f0' : '#cbd5e1'} opacity={0.5} />
        <rect x={cx - 30} y={70} width={60} height={50} rx={4} fill="#d97706" stroke="#78350f" strokeWidth={2} />
        <text x={cx} y={101} textAnchor="middle" fontSize={13} fill="white" fontWeight={700}>{CRATE_KG} kg</text>
        <Arrow x={cx + 30} y={60} len={right * scale} color="#2563eb" label={`${right} N`} />
        <Arrow x={cx - 30} y={60} len={-left * scale} color="#dc2626" label={`${left} N`} />
        <Arrow x={cx} y={155} len={now.friction * scale} color="#64748b" label={now.friction ? `friction ${Math.abs(now.friction).toFixed(0)} N` : ''} />
        <Arrow x={cx} y={30} len={net * scale} color="#16a34a" label={net ? `resultant ${Math.abs(net).toFixed(0)} N` : ''} />
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="font-semibold text-red-600">← Left team</span> pushes <b>{left} N</b><Slider value={[left]} min={0} max={100} step={5} onValueChange={([v]) => setLeft(v)} className="mt-1" aria-label="left push" /></label>
        <label className="text-sm"><span className="font-semibold text-blue-600">Right team →</span> pushes <b>{right} N</b><Slider value={[right]} min={0} max={100} step={5} onValueChange={([v]) => setRight(v)} className="mt-1" aria-label="right push" /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {SURFACES.map((s) => <button key={s.id} type="button" aria-pressed={sid === s.id} onClick={() => setSid(s.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', sid === s.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>)}
        <span className="ml-auto flex gap-2">
          <Button onClick={() => setRunning((r) => !r)}>{running ? '⏸ Pause' : '▶ Play'}</Button>
          <Button variant="outline" onClick={reset}>Reset</Button>
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Resultant force" value={`${Math.abs(net).toFixed(0)} N ${net > 0 ? '→' : net < 0 ? '←' : ''}`} />
        <Readout label="Velocity" value={`${Math.abs(state.v).toFixed(2)} m/s ${state.v > 0.005 ? '→' : state.v < -0.005 ? '←' : ''}`} />
        <Readout label="Acceleration a = F ÷ m" value={`${(Math.abs(net) / CRATE_KG).toFixed(1)} m/s²`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{describe(state.v, net)} {sid === 'none' && Math.abs(state.v) > 0.01 && push === 0 && <b>No force is needed to keep it moving: that's Newton's first law (inertia).</b>}</p>
    </LabFrame>
  )
}
