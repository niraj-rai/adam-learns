import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { positionAt, velocityAt } from '../_shared/kinematics'

const T_MAX = 8

/** Position and velocity, stopping (not reversing) when brakes bring the car to rest. */
function state(u: number, a: number, t: number) {
  const tStop = a < 0 && u > 0 ? -u / a : Infinity
  const tt = Math.min(t, tStop)
  return { s: positionAt(u, a, tt), v: Math.max(a < 0 && u > 0 ? 0 : -Infinity, velocityAt(u, a, tt)), stopped: t >= tStop }
}

export default function AccelerationTrack() {
  const [u, setU] = useState(2)
  const [a, setA] = useState(1.5)
  const [t, setT] = useState(0)
  const [running, setRunning] = useState(false)
  const raf = useRef<number | null>(null)
  useEffect(() => {
    if (!running) return
    const start = performance.now() - t * 1000
    const tick = (now: number) => {
      const nt = Math.min(T_MAX, (now - start) / 1000)
      setT(nt)
      if (nt < T_MAX) raf.current = requestAnimationFrame(tick)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps
  const sMax = Math.max(1, ...Array.from({ length: T_MAX + 1 }, (_, i) => state(u, a, i).s))
  const W = 560
  const X = (s: number) => 20 + (Math.max(0, s) / sMax) * (W - 60)
  const now = state(u, a, t)
  const reset = () => { setRunning(false); setT(0) }
  return (
    <LabFrame labId="acceleration-track" title="Acceleration Track" subtitle="Speed changing at a steady rate: watch the gaps between the dots grow (or shrink)." howTo={<p>Set the starting velocity u and the acceleration a (negative means braking), then press Go. A dot is printed every second, like a ticker tape. Equal gaps mean constant speed; growing gaps mean speeding up.</p>}>
      <svg viewBox={`0 0 ${W} 120`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Car at ${now.s.toFixed(1)} m moving at ${now.v.toFixed(1)} m/s`}>
        <rect x={10} y={60} width={W - 20} height={30} fill="#64748b" opacity={0.3} rx={4} />
        {Array.from({ length: Math.floor(t) + 1 }, (_, i) => <g key={i}><circle cx={X(state(u, a, i).s)} cy={50} r={4} fill="#ef4444" /><text x={X(state(u, a, i).s)} y={40} textAnchor="middle" fontSize={9} fill="currentColor">{i}s</text></g>)}
        <text x={X(now.s)} y={84} textAnchor="middle" fontSize={26} style={{ transform: 'scaleX(-1)', transformBox: 'fill-box', transformOrigin: 'center' }}>🚗</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Starting velocity u = <b>{u} m/s</b><Slider value={[u]} min={0} max={10} step={1} onValueChange={([v]) => { setU(v); reset() }} className="mt-1" aria-label="starting velocity" /></label>
        <label className="text-sm">Acceleration a = <b>{a} m/s²</b><Slider value={[a]} min={-3} max={3} step={0.5} onValueChange={([v]) => { setA(v); reset() }} className="mt-1" aria-label="acceleration" /></label>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => { if (t >= T_MAX) setT(0); setRunning(true) }} disabled={running}>▶ Go</Button>
        <Button variant="outline" onClick={reset}>Reset</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Time" value={`${t.toFixed(1)} s`} />
        <Readout label="Velocity v = u + at" value={`${now.v.toFixed(1)} m/s${now.stopped ? ' (stopped)' : ''}`} />
        <Readout label="Displacement s = ut + ½at²" value={`${now.s.toFixed(1)} m`} />
      </div>
      <table className="mt-3 w-full rounded-xl border text-center text-xs">
        <thead><tr className="border-b"><th className="p-1">t (s)</th>{Array.from({ length: T_MAX + 1 }, (_, i) => <th key={i} className="p-1">{i}</th>)}</tr></thead>
        <tbody><tr><td className="p-1 font-semibold">v (m/s)</td>{Array.from({ length: T_MAX + 1 }, (_, i) => <td key={i} className="p-1 font-mono">{state(u, a, i).v.toFixed(1)}</td>)}</tr></tbody>
      </table>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Acceleration</b> is the rate of change of velocity: a = (v − u) ÷ t, measured in m/s². Here the velocity changes by {a} m/s every second. {a < 0 ? 'A negative acceleration (deceleration) slows the car: the dots get closer together.' : a > 0 ? 'The dots spread further apart each second.' : 'With a = 0 the gaps are equal: uniform motion.'}</p>
    </LabFrame>
  )
}
