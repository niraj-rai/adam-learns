import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { G_EARTH } from '../_shared/dynamics'
import { H, L, advance, startX, trackY, type Skater } from './model'

const MASS = 50
const FRICTION = [
  { mu: 0, label: '🧊 No friction' },
  { mu: 0.04, label: '🛹 A little' },
  { mu: 0.12, label: '🧱 Lots' },
]
const W = 560
const PX = (x: number) => W / 2 + (x / L) * (W / 2 - 30)
const PY = (y: number) => 200 - (y / H) * 170

export default function SkatePark() {
  const [h0, setH0] = useState(4)
  const [mu, setMu] = useState(0)
  const [s, setS] = useState<Skater>({ x: startX(4), u: 0 })
  const [running, setRunning] = useState(false)
  const muRef = useRef(mu)
  muRef.current = mu
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setS((p) => advance(p, muRef.current, dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])
  const reset = (h = h0) => { setRunning(false); setS({ x: startX(h), u: 0 }) }
  const E0 = MASS * G_EARTH * h0
  const pe = MASS * G_EARTH * trackY(s.x)
  const ke = 0.5 * MASS * s.u * s.u
  // with no friction any tiny difference is rounding in the simulation, not real heat
  const heat = mu === 0 ? 0 : Math.max(0, E0 - pe - ke)
  const path = Array.from({ length: 61 }, (_, i) => { const x = -L + (i / 60) * 2 * L; return `${PX(x)},${PY(trackY(x))}` }).join(' ')
  const bars = [
    { k: 'Potential', v: pe, c: '#6366f1' },
    { k: 'Kinetic', v: ke, c: '#f59e0b' },
    { k: 'Heat and sound', v: heat, c: '#ef4444' },
    { k: 'Total', v: mu === 0 ? E0 : pe + ke + heat, c: '#10b981' },
  ]
  return (
    <LabFrame labId="energy-skate-park" title="Energy Skate Park" subtitle="Energy is never created or destroyed; it only changes from one form to another." howTo={<p>Choose the starting height and friction, then press Play. Watch the energy bars as the 50 kg skater rolls back and forth.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
        <svg viewBox={`0 0 ${W} 215`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Skater at height ${trackY(s.x).toFixed(1)} m moving at ${Math.abs(s.u).toFixed(1)} m/s`}>
          {[1, 2, 3, 4, 5].map((y) => <g key={y}><line x1={10} y1={PY(y)} x2={W - 10} y2={PY(y)} stroke="currentColor" strokeOpacity={0.08} /><text x={12} y={PY(y) - 2} fontSize={9} fill="currentColor" opacity={0.6}>{y} m</text></g>)}
          <line x1={10} y1={PY(h0)} x2={W - 10} y2={PY(h0)} stroke="#10b981" strokeDasharray="5 4" />
          <polyline points={path} fill="none" stroke="#64748b" strokeWidth={6} strokeLinecap="round" />
          <circle cx={PX(s.x)} cy={PY(trackY(s.x)) - 13} r={11} fill="#ec4899" stroke="white" strokeWidth={2} />
          <text x={PX(s.x)} y={PY(trackY(s.x)) - 9} textAnchor="middle" fontSize={12}>🛹</text>
        </svg>
        <div className="space-y-2">
          {bars.map((b) => (
            <div key={b.k} className="text-xs">
              <div className="flex justify-between"><span>{b.k}</span><span className="font-mono">{b.v.toFixed(0)} J</span></div>
              <div className="mt-0.5 h-4 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (b.v / E0) * 100)}%`, background: b.c }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Start height <b>{h0} m</b><Slider value={[h0]} min={1} max={5} step={0.5} onValueChange={([v]) => { setH0(v); reset(v) }} className="mt-1" aria-label="start height" /></label>
        <div className="flex flex-wrap items-end gap-1">
          {FRICTION.map((f) => <button key={f.mu} type="button" aria-pressed={mu === f.mu} onClick={() => setMu(f.mu)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', mu === f.mu ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{f.label}</button>)}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setRunning((r) => !r)}>{running ? '⏸ Pause' : '▶ Play'}</Button>
        <Button variant="outline" onClick={() => reset()}>Reset</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Height" value={`${trackY(s.x).toFixed(2)} m`} />
        <Readout label="Speed" value={`${Math.abs(s.u).toFixed(2)} m/s`} />
        <Readout label="Max speed at the bottom (no friction)" value={`√(2gh) = ${Math.sqrt(2 * G_EARTH * h0).toFixed(2)} m/s`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{mu === 0 ? 'With no friction, potential and kinetic energy swap back and forth, the total never changes, and the skater always climbs back to the green starting line.' : 'Friction turns some energy into heat and sound every second. The total (green) is still the same, but less is left as potential and kinetic energy, so the skater climbs a little lower each time and finally stops.'}</p>
    </LabFrame>
  )
}
