import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { centripetalAccel, circularSpeed } from './model'

const C = 150

export default function CircularMotion() {
  const [r, setR] = useState(2)
  const [T, setT] = useState(2)
  const [theta, setTheta] = useState(0)
  const [released, setReleased] = useState<null | { x: number; y: number; vx: number; vy: number; t0: number }>(null)
  const [flight, setFlight] = useState(0)
  const raf = useRef<number | null>(null)
  const last = useRef<number | null>(null)
  const px = 130 / 5 // pixels per metre (max radius 5 m)
  const R = r * px
  useEffect(() => {
    const tick = (now: number) => {
      const dt = last.current ? (now - last.current) / 1000 : 0
      last.current = now
      if (released) setFlight((f) => f + dt)
      else setTheta((th) => th + (2 * Math.PI * dt) / T)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current); last.current = null }
  }, [T, released])
  const v = circularSpeed(r, T)
  const pos = { x: C + R * Math.cos(theta), y: C - R * Math.sin(theta) }
  // velocity is tangent to the circle (anticlockwise)
  const vel = { x: -Math.sin(theta), y: -Math.cos(theta) }
  const stone = released ? { x: released.x + released.vx * flight * v * px, y: released.y + released.vy * flight * v * px } : pos
  const out = stone.x < -20 || stone.x > 320 || stone.y < -20 || stone.y > 320
  const letGo = () => { setReleased({ x: pos.x, y: pos.y, vx: vel.x, vy: vel.y, t0: 0 }); setFlight(0) }
  return (
    <LabFrame labId="circular-motion" title="Circular Motion" subtitle="Constant speed, but always changing direction: so the velocity changes, and the stone is accelerating." howTo={<p>The stone is whirled on a string. The arrow shows its velocity, always along the tangent. Press ‘Let go!’ and watch which way it flies.</p>}>
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <svg viewBox="0 0 300 300" className="w-full max-w-xs rounded-2xl border bg-background" role="img" aria-label={`Stone moving in a circle of radius ${r} m at ${v.toFixed(2)} m/s`}>
          <defs><marker id="cm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker></defs>
          <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeDasharray="4 4" />
          <circle cx={C} cy={C} r={4} fill="currentColor" />
          {!released && <line x1={C} y1={C} x2={pos.x} y2={pos.y} stroke="#94a3b8" strokeWidth={1.5} />}
          {released && <line x1={released.x} y1={released.y} x2={stone.x} y2={stone.y} stroke="#f59e0b" strokeDasharray="5 4" />}
          {!out && <circle cx={stone.x} cy={stone.y} r={9} fill="#6366f1" />}
          {!released && <line x1={pos.x} y1={pos.y} x2={pos.x + vel.x * 55} y2={pos.y + vel.y * 55} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#cm-arrow)" />}
          {!released && <line x1={pos.x} y1={pos.y} x2={pos.x + (C - pos.x) * 0.35} y2={pos.y + (C - pos.y) * 0.35} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#cm-arrow)" />}
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Radius r = <b>{r} m</b><Slider value={[r]} min={1} max={5} step={0.5} onValueChange={([x]) => setR(x)} className="mt-1" aria-label="radius" /></label>
          <label className="block text-sm">Time for one lap T = <b>{T} s</b><Slider value={[T]} min={1} max={6} step={0.5} onValueChange={([x]) => setT(x)} className="mt-1" aria-label="period" /></label>
          <div className="flex gap-2">
            <Button onClick={letGo} disabled={Boolean(released)}>✋ Let go!</Button>
            <Button variant="outline" onClick={() => { setReleased(null); setFlight(0) }}>Reset</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Speed v = 2πr ÷ T" value={`${v.toFixed(2)} m/s (constant)`} />
            <Readout label="Acceleration towards centre" value={`v²/r = ${centripetalAccel(v, r).toFixed(2)} m/s²`} />
          </div>
          <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">
            {released ? <>The stone flies off in a <b>straight line along the tangent</b>, not outwards! Without the string pulling it towards the centre, nothing changes its direction (Newton's first law).</> : <>The <span className="font-semibold text-red-500">red arrow</span> (velocity) keeps turning, so the velocity changes even though the speed doesn't. The string pulls towards the centre (<span className="font-semibold text-emerald-600">green</span>): that pull causes the acceleration.</>}
          </p>
        </div>
      </div>
    </LabFrame>
  )
}
